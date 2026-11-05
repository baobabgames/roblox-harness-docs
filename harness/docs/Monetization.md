# Monetization

Handles Robux purchases: gamepasses (saved as owned, with per-pass handlers), developer products (receipt processing with no duplicate grants), and gifting either one to another player in the same server. It also has the client effects (confetti, sound, notification) shown after a purchase.

## Files
- [`MonetizationSystem.luau`](../src/Features/Monetization/Server/MonetizationSystem.luau): entry point. Owns `ProcessReceipt`, the purchase-finished events and the join ownership checks (Server)
- [`MonetizationService.luau`](../src/Features/Monetization/Server/MonetizationService.luau): gamepass ownership, receipt history, celebrate effects (Server)
- [`GiftService.luau`](../src/Features/Monetization/Server/GiftService.luau): pending gifts: checks a request, prompts the payment, saves the paid gift and delivers it through the recipient's saved mailbox (Server)
- [`Monetizations/Gamepass/init.luau`](../src/Features/Monetization/Server/Monetizations/Gamepass/init.luau): loads the gamepass handler modules into a `[gamepassId] = handler` table (Server)
- [`Monetizations/Products/init.luau`](../src/Features/Monetization/Server/Monetizations/Products/init.luau): loads the product handler modules into a `[productId] = handler` table (Server)
- [`MonetizationController.luau`](../src/Features/Monetization/Client/MonetizationController.luau): plays confetti, sounds and notifications sent by the server (Client)
- [`SharedConfigs/Monetization.luau`](../src/Core/Shared/SharedConfigs/Monetization.luau): named gamepass / product config. Empty by default (Shared)
- [`SharedUtilities/MonetizationUtil.luau`](../src/Core/Shared/SharedUtilities/MonetizationUtil.luau): config lookups, prices, ownership checks, purchase prompts, gift whitelist (Shared)

## How it connects
- **Uses:** `ServerData.ProfileDatas`, `ServerData.Plums.ProfilesPlum`, `ServerSignals.Profile.Loaded`, `SharedConfigs.Monetization`, `SharedUtilities.MonetizationUtil`, Blink events (see below), `Packages.Confetti`, `ReplicatedStorage.Services.SoundsService`, `MarketplaceService`.
- **Used by:** only this feature uses it right now. `MonetizationUtil` is the API meant for other code, like shop UI.
- **Starts (`MonetizationSystem.Init`):**
  - `GiftService.Init` (the gift mailbox callback).
  - `MarketplaceService.ProcessReceipt` is set to the system's receipt handler. Nothing else may set it. It acknowledges a receipt only after `MonetizationService.WaitForSaveAsync` confirms the reward and receipt id are saved.
  - `PromptGamePassPurchaseFinished`: on purchase, `GiveGamepass` then `Celebrate`. On cancel, the handler's `OnCancel`.
  - `PromptProductPurchaseFinished`: `GiftService.OnPromptFinished`, then the product's `OnCancel` on cancel.
  - `Profile.Loaded` plus a loop over profiles that already loaded: runs the join logic (see Gamepasses).
  - `RequestGift.On(GiftService.Request)` and `Players.PlayerRemoving` → `GiftService.RemovePlayer`.
- **Starts (`MonetizationController.Init`):** listens to `ConfettiNotification`, `PlaySound` and `Notify`.

## Adding a gamepass
1. Add it to the config (the name is the key used everywhere else):
   ```lua
   Gamepass = { VIP = { Id = 123456, DisplayName = "VIP", Giftable = true } },
   ```
2. Add a handler module anywhere under `Server/Monetizations/Gamepass/` (every descendant ModuleScript is loaded):
   ```lua
   return { Id = 123456, Processing = function(player, gamepassId) end, OnJoin = function(player, gamepassId) end }
   ```
   - Use `IdList = { ... }` instead of `Id` to share one handler between several passes. A module with neither gets a warning and is skipped. A module that returns nil is skipped.
   - `Processing(player, id)`: runs every time `GiveGamepass` is called (purchase, gift, or found on join). It does not run on join for passes that were already saved.
   - `OnJoin(player, id)`: runs on every profile load for saved passes, and right after `Processing` for passes found through `UserOwnsGamePassAsync`. It does **not** run after an in-game purchase or gift.
   - `OnCancel(player, id)`: optional, runs when the prompt is closed without buying.
   - All three are optional in practice (each call is nil-checked), even though the type marks `Processing` / `OnJoin` as required.
3. Prompt it from anywhere: `MonetizationUtil.Prompt("VIP", "Gamepass")`.

## Adding a developer product
1. Config: `DevProducts = { Coins100 = { Id = 987654, DisplayName = "100 Coins", Value = 100 } }`.
2. Handler under `Server/Monetizations/Products/`:
   ```lua
   return { Id = 987654, Processing = function(player, productId) return true end }
   ```
   - `Processing` **must return `true`** once the reward is given. Any falsy result returns `NotProcessedYet`, so Roblox retries the receipt later. It may yield.
   - Optional `OnCancel(player, productId)`.
3. Prompt: `MonetizationUtil.Prompt("Coins100", "DevProduct")`.

## How gifting works
- **Whitelist:** only config entries with `Giftable = true` can be gifted (`MonetizationUtil.GetGift`).
- **Payment:** every gift is paid with the **DevProduct with the same key**, and its `Id` must not be `0`.
  - Gamepass gift: you need a matching DevProducts entry, e.g. `DevProducts.VIP = { Id = <gift product id>, DisplayName = "VIP (Gift)" }`. It needs no handler.
  - DevProduct gift: the product pays for itself (same key), so the payment id is the product's own id.
- **Flow:**
  1. The client fires `RequestGift(recipientUserId, key)`.
  2. `GiftService.Request` checks:
     - the buyer's profile has loaded (otherwise silently dropped)
     - the buyer's last request was at least 2 s ago (`RequestCooldown`, otherwise silently dropped)
     - the buyer has no gift pending
     - the arg types are right
     - the recipient is in the server with a loaded profile, and is not the buyer
     - the key is giftable and has a payment product
     - the recipient doesn't already own the gamepass (checked in data)

     From the pending check on, a failed check sends the buyer a `Notify` "Warn" with the reason.
  3. The gift is kept for the prompt (one per buyer, server memory) with a 300 s timeout (`PromptTimeout`). The **server** prompts the payment product. If the prompt can't open, the gift is cleared.
  4. Prompt closed: a cancel clears the gift. A purchase moves it into the buyer's **saved** `PlayerData.PendingGifts` (oldest first), so a receipt that only arrives after a rejoin or a crash still knows who it's for. The receipt can arrive before (then it uses the in-memory gift) or after this event.
  5. `ProcessReceipt`: `GiftService.FindPending` returns the oldest saved gift for that product, else the prompt's. `GiftService.Send` writes it into the **recipient's saved mailbox** (ProfileStore `MessageAsync`, through DataService). Then the gift is removed from `PendingGifts`, the receipt is recorded, the buyer gets `Celebrate` and a success notification, and the receipt is acknowledged once that is saved.
  6. `GiftService.Receive` (DataService global callback `"Gift"`) delivers it to the recipient's session: within seconds if they're online in any server, else on their next join. They get the reward (`GiveGamepass`, or the product's `Processing`), confetti and a "gifted you" notification.
- If the message can't be sent, the receipt returns `NotProcessedYet` and the gift stays saved, so Roblox retries it. If the product's `Processing` fails on the recipient's side, the message stays in their mailbox and is delivered again later. A paid gift is never dropped.
- A gamepass-gift payment that arrives with no gift (its prompt was never reported and timed out) is recorded and granted with a warning, and gives no reward.

## Public API

### `MonetizationService` (Server, `script.Parent.MonetizationService` inside the feature)
#### `OwnsGamepass(player: Player, gamepassId: number) -> boolean`
- `true` if the id is in the saved `PlayerData.GamepassPurchased`. `false` if the profile hasn't loaded. Does not call Roblox.

#### `GiveGamepass(player: Player, gamepassId: number) -> ()`
- Adds the id to `GamepassPurchased` once (replicated `ArrayInsert`), then runs the handler's `Processing` (every call, even if the pass was already owned).
- Does nothing if the player has no Plum (profile not loaded).

#### `WasPurchaseGranted(player: Player, purchaseId: string) -> boolean`
- `true` if the receipt id is in `PlayerData.PurchaseHistory`.

#### `RecordPurchase(player: Player, purchaseId: string) -> ()`
- Server-only insert into `PurchaseHistory`. When there are more than 100 entries, the oldest is removed. Does nothing if the profile isn't loaded.

#### `WaitForSaveAsync(player: Player, purchaseId: string) -> boolean`
- **Yields.** Saves the profile now and waits until a finished save includes `purchaseId` (`OnAfterSave`). `true` once saved (at once if it already was), `false` if the profile is missing or its session ends first. `ProcessReceipt` only returns `PurchaseGranted` after this, so the reward and the receipt id are saved together before Roblox is told.

#### `Celebrate(player: Player) -> ()`
- Fires `ConfettiNotification` and `PlaySound("RobuxBuy")` to that player.

```lua
if not MonetizationService.OwnsGamepass(player, gamepassId) then
	MonetizationService.GiveGamepass(player, gamepassId)
end
```

### `GiftService` (Server, `script.Parent.GiftService` inside the feature)
The system wires these up. Most code never calls them directly.
#### `Request(purchaser: Player, recipientUserId: number, key: string) -> ()`
- The `RequestGift` handler: checks the request, stores the pending gift (300 s timeout) and prompts the payment product for the buyer. Problems go back to the buyer as a `Notify`. Requests within 2 s of the previous one, or before the buyer's profile loads, are dropped silently (the cooldown counts every request that passes the profile check, even ones that then fail).
#### `Init() -> ()`
- Registers `Receive` as the DataService global callback `"Gift"`. Called from `MonetizationSystem.Init`.
#### `FindPending(purchaser: Player, productId: number) -> PendingGift?`
- The gift a receipt for `productId` pays for: the oldest saved one in `PendingGifts`, else the open prompt's. Removes nothing.
#### `Complete(purchaser: Player, pending: PendingGift) -> ()`
- Removes a gift `FindPending` returned (from the prompt slot or `PendingGifts`), once it was sent.
#### `Send(purchaser: Player, pending: PendingGift) -> boolean`
- **Yields.** Writes the gift into the recipient's saved mailbox and notifies the buyer. `false` (buyer told it will be retried) if the message couldn't be sent or the key is no longer giftable.
- Studio's mock profiles use the mock store's mailbox, so gifts work in Studio plays too.
#### `Receive(recipient: Player, message: { Key: string, FromName: string }) -> boolean`
- The mailbox callback: gives the gift, confetti and a notification. Product gifts: `Processing` is pcall'd, and missing, erroring or nil/false returns `false`, which keeps the message for a later retry. An unknown key is dropped with a warning.
#### `OnPromptFinished(purchaser: Player, productId: number, wasPurchased: boolean) -> ()`
- Ignored unless `productId` matches the prompt's payment. A cancel clears the gift. A purchase moves it into the saved `PendingGifts`.
#### `RemovePlayer(purchaser: Player) -> ()`
- Clears the prompt gift and the buyer's request cooldown. Saved `PendingGifts` stay. Connected to `PlayerRemoving`.

`PendingGift = SharedTypes.PendingGiftData = { RecipientUserId: number, Key: string, PaymentId: number }` (exported type).

### `MonetizationUtil` (Shared, `require(ReplicatedStorage.SharedUtilities).MonetizationUtil`)
`monetizationType` is `"Gamepass" | "DevProduct"` (singular. The util maps it to the config's `DevProducts`). An unknown type warns.

#### `GetConfigByName(name: string, monetizationType) -> MonetizationConfig?`
- The config entry stored under `name`, or nil.
#### `GetConfigById(id: number, monetizationType) -> (MonetizationConfig?, string?)`
- Linear search. Returns the entry and its key, or `nil, nil`.
#### `GetGift(key: string) -> Gift?`
- `{ Key, Type, Id, DisplayName }` for a `Giftable` entry. Gamepass is checked before DevProduct. nil if the key isn't a string or isn't giftable.
#### `GetPaymentProduct(key: string) -> MonetizationConfig?`
- The DevProduct with the same key. nil if it's missing or `Id == 0`.
#### `IsGamepassGiftPayment(productId: number) -> boolean`
- `true` if the product is the payment product for a giftable gamepass.
#### `GetRobuxPriceById(idOrName: number | string, monetizationType) -> number?`
- **Yields** (`GetProductInfoAsync`) the first time per id. After that it's cached for the session. Returns nil on failure (never 0). Failures are not cached.
#### `IsGamepassPurchased(idOrName: number | string, player: Player?, checkData: boolean?) -> boolean`
- `player` defaults to `LocalPlayer`. If it's missing on the server, the call warns and returns `false`.
- `checkData = true`: reads saved data instead of calling Roblox. On the server that's `ServerData` (needs an explicit `player`). On the client it's the `ClientData.PlayerData.GamepassPurchased` atom. Doesn't yield.
- Otherwise it **yields** on `UserOwnsGamePassAsync`. It fails closed (`false` on error).
#### `Prompt(idOrName: number | string, monetizationType, player: Player?) -> boolean`
- Opens the Roblox purchase prompt. `player` defaults to `LocalPlayer`. Returns `false` if there's no player, the id is unknown or the type is bad. Returns `true` once the prompt opens, whether or not the player buys.

```lua
local MonetizationUtil = SharedUtilities.MonetizationUtil
task.spawn(function() priceSource(MonetizationUtil.GetRobuxPriceById("VIP", "Gamepass")) end)
MonetizationUtil.Prompt("VIP", "Gamepass")
```

### `MonetizationController` (Client)
- Only `Init`. No public functions.

## Data and network
- `PlayerData.GamepassPurchased: { number }`: saved, replicated (`ArrayInsert`). Listed in `PlayerController` `DeepSyncFields`, so it is mirrored into `ClientData.PlayerData.GamepassPurchased`.
- `PlayerData.PurchaseHistory: { string }`: saved, **server only** (`ArrayInsertServerOnly` / `ArrayRemoveServerOnly`), last 100 receipt ids.
- `PlayerData.PendingGifts: { PendingGiftData }`: saved, **server only**, paid gifts whose receipt isn't handled yet.
- Gifts in the recipient's ProfileStore mailbox (message key `"Gift"`, data `{ Key, FromName }`) until their session delivers them.
- Prompt gifts, their timeouts and request cooldowns: server memory, keyed by buyer, cleared on `PlayerRemoving` (`GiftService.RemovePlayer`).
- "Server only" writes are never sent as changes, but the owning player's first Plum snapshot on join still includes the whole profile, so the buyer's client can see its own receipt ids and pending gifts. Nothing sensitive and nothing about other players.
- Blink events (`network.blink`):
  - `RequestGift`, client → server: `(f64 recipientUserId, string key)`
  - `ConfettiNotification`, server → client: no payload. Rains confetti into `PlayerGui.Hud`.
  - `PlaySound`, server → client: `string` sound name in SoundService (cloned and played)
  - `Notify`, server → client: `(NotifyKind "Success" | "Warn", string)`. Shown with `StarterGui:SetCore("SendNotification")` for now.

## Gotchas
- Handler tables are keyed by **numeric id**, and `SharedConfigs` is keyed by **name**. They're separate, so keep the ids in sync (for example, have the handler read `SharedConfigs.Monetization.Gamepass.VIP.Id`).
- **Gifted gamepasses only exist in saved data**: Roblox doesn't count the recipient as owning them. Check ownership with `MonetizationService.OwnsGamepass` or `MonetizationUtil.IsGamepassPurchased(id, player, true)`, not with the Roblox call.
- Receipts are deduplicated by `PurchaseId` against the last 100 only. That's safe because a receipt is only acknowledged once its id is saved, and Roblox stops retrying acknowledged receipts.
- A receipt handler yields until the save finishes (usually a second or two). A save that keeps failing keeps it waiting until the next autosave works or the session ends (then `NotProcessedYet`).
- A gift whose mailbox message was sent, but whose buyer's server crashed before the buyer's save, is sent again when Roblox retries the receipt: the recipient may get it twice. That's on purpose: a duplicate is better than a paid gift that never arrives.
- A receipt for a player who isn't in the server, or whose profile hasn't loaded, returns `NotProcessedYet`, and Roblox retries it later.
- `GiveGamepass` on a profile that hasn't loaded does nothing silently. The join check (`UserOwnsGamePassAsync`, run in parallel and pcall'd per pass) recovers real purchases next time the profile loads, but not gifts.
- While a buyer has a gift pending (saved or in the prompt), a receipt for that same payment product counts as the gift and is never also given to the buyer. Every paid prompt makes exactly one receipt, so the count always matches, even if two receipts swap gifts.
- Product `Processing` is pcall'd only for gifts. In a normal `ProcessReceipt` it is called directly, so an error there propagates out of the receipt handler.
- Gift requests inside the 2 s cooldown get no feedback at all. UI should debounce its own button.
- Client effects need optional content: a `Hud` ScreenGui in PlayerGui for confetti (skipped if missing), and a `RobuxBuy` sound in SoundService (SoundsService warns if missing).
- `GetRobuxPriceById` and `IsGamepassPurchased` (without `checkData`) yield. Don't call them straight from a Vide binding or effect.

import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  step: string;
  title: string;
  command: string;
  to: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    step: '1',
    title: 'Design it',
    command: '/new-gdd <idea>',
    to: '/docs/building/build-a-game#1-design-it',
    description: (
      <>
        Turn an idea into a game design doc, with research on comparable games
        and how each mechanic can be built on Roblox. You pick and approve.
      </>
    ),
  },
  {
    step: '2',
    title: 'Build it',
    command: '/build-gdd <GDD>',
    to: '/docs/building/build-a-game#2-build-it-in-stages',
    description: (
      <>
        MVP, Looks, Polish &amp; UX, Wrap-up. Every stage asks first, builds,
        reviews itself, and only moves on when you approve.
      </>
    ),
  },
  {
    step: '3',
    title: 'Change it',
    command: '/revise-gdd <change>',
    to: '/docs/building/change-your-game',
    description: (
      <>
        Add, change or remove systems, tune the feel, restyle the UI. Same
        loop, and the game plan stays up to date.
      </>
    ),
  },
];

function Feature({step, title, command, to, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4', styles.col)}>
      <Link to={to} className={styles.card}>
        <span className={styles.step}>{step}</span>
        <Heading as="h3">{title}</Heading>
        <code className={styles.command}>{command}</code>
        <p>{description}</p>
      </Link>
    </div>
  );
}

const Sections = [
  {
    title: 'Systems',
    to: '/systems/FEATURES',
    text: 'Player data, monetization, onboarding, cutscenes, leaderboards, input, UI, developer tools and analytics, function by function.',
  },
  {
    title: 'Skills & agents',
    to: '/docs/reference/skills',
    text: 'Every slash command and every specialist agent, and when each one runs.',
  },
  {
    title: 'AI guides',
    to: '/ai-guides/WORKFLOW_GUIDE',
    text: 'The rules Claude follows on every task, straight from .claude/guides.',
  },
];

export default function HomepageFeatures(): ReactNode {
  return (
    <>
      <section className={styles.features}>
        <div className="container">
          <div className="row">
            {FeatureList.map((props) => (
              <Feature key={props.step} {...props} />
            ))}
          </div>
        </div>
      </section>
      <section className={styles.more}>
        <div className="container">
          <Heading as="h2" className={styles.moreTitle}>
            Reference
          </Heading>
          <div className="row">
            {Sections.map((s) => (
              <div key={s.title} className={clsx('col col--4', styles.col)}>
                <Link to={s.to} className={styles.card}>
                  <Heading as="h3">{s.title}</Heading>
                  <p>{s.text}</p>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

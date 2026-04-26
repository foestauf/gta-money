import { Link } from 'react-router';
import './Rdr2Hub.css';
import './theme.css';

interface RealCard {
  to: string;
  title: string;
  desc: string;
}

interface StubCard {
  title: string;
  desc: string;
}

const real: RealCard[] = [
  { to: '/rdr2/herbs', title: 'Herbs', desc: 'Track every gatherable herb across the map.' },
  { to: '/rdr2/horses', title: 'Horses for Challenges', desc: 'Tasks for the nine Horseman challenges.' },
];

const stubs: StubCard[] = [
  { title: 'Gold Bars', desc: 'Hidden gold bar locations.' },
  { title: 'Treasure Maps', desc: 'Treasure map chains and final caches.' },
  { title: 'Legendary Animals', desc: 'All legendary hunts.' },
  { title: 'Gang Hideouts', desc: 'Random / fixed hideouts.' },
];

export default function Rdr2Hub() {
  return (
    <section className="rdr2-hub">
      <h1 className="rdr2-hub-title">Red Dead Redemption 2</h1>
      <p className="rdr2-hub-subtitle">100% completion trackers</p>
      <div className="rdr2-hub-grid">
        {real.map(card => (
          <Link key={card.to} to={card.to} className="rdr2-hub-card">
            <h2 className="rdr2-hub-card-title">{card.title}</h2>
            <p className="rdr2-hub-card-desc">{card.desc}</p>
          </Link>
        ))}
        {stubs.map(card => (
          <div key={card.title} className="rdr2-hub-card disabled" aria-disabled="true">
            <h2 className="rdr2-hub-card-title">{card.title}</h2>
            <p className="rdr2-hub-card-desc">{card.desc}</p>
            <span className="rdr2-hub-card-pill">Coming soon</span>
          </div>
        ))}
      </div>
    </section>
  );
}

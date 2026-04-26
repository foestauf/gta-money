import { useMemo, useState } from 'react';
import type { TrackerDef } from './types';
import { useTrackerProgress } from './useTrackerProgress';
import './ChecklistTracker.css';

interface Props {
  tracker: TrackerDef;
}

export default function ChecklistTracker({ tracker }: Props) {
  const { done, toggle, reset, count, total, pct } = useTrackerProgress(
    tracker.id,
    tracker.items.length,
  );
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tracker.items;
    return tracker.items.filter(item => {
      const haystack = [
        item.name,
        item.description ?? '',
        item.location ?? '',
        item.category ?? '',
      ].join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }, [tracker.items, query]);

  const groups = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const item of filtered) {
      const key = item.category ?? 'Uncategorized';
      const list = map.get(key);
      if (list) list.push(item); else map.set(key, [item]);
    }
    return [...map.entries()];
  }, [filtered]);

  return (
    <section className="checklist-tracker">
      <header className="checklist-header">
        <div className="checklist-title-row">
          <h1 className="checklist-title">{tracker.title}</h1>
          <div className="checklist-progress">
            <span className="checklist-progress-count">{count} / {total} — {pct}%</span>
            <div className="checklist-progress-bar">
              <div className="checklist-progress-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
        {tracker.subtitle && <p className="checklist-subtitle">{tracker.subtitle}</p>}
      </header>

      <div className="checklist-toolbar">
        <input
          className="checklist-search"
          type="search"
          placeholder="Search by name, description, location…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <button className="checklist-reset-btn" onClick={reset}>Reset</button>
      </div>

      {groups.length === 0 && (
        <p className="checklist-empty">No items match.</p>
      )}

      {groups.map(([category, items]) => (
        <ChecklistGroup
          key={category}
          category={category}
          items={items}
          done={done}
          toggle={toggle}
        />
      ))}
    </section>
  );
}

interface GroupProps {
  category: string;
  items: { id: string; name: string; description?: string; location?: string }[];
  done: Set<string>;
  toggle: (id: string) => void;
}

function ChecklistGroup({ category, items, done, toggle }: GroupProps) {
  const [open, setOpen] = useState(true);
  const groupDone = items.filter(i => done.has(i.id)).length;

  return (
    <div className="checklist-group">
      <div className="checklist-group-header" onClick={() => setOpen(o => !o)}>
        <span className="checklist-group-title">{category}</span>
        <span className="checklist-group-count">
          {groupDone} / {items.length} {open ? '\u25B2' : '\u25BC'}
        </span>
      </div>
      {open && (
        <ul className="checklist-items">
          {items.map(item => (
            <li key={item.id} className={`checklist-item${done.has(item.id) ? ' done' : ''}`}>
              <input
                type="checkbox"
                checked={done.has(item.id)}
                onChange={() => toggle(item.id)}
                aria-label={item.name}
              />
              <div>
                <div className="checklist-item-name">{item.name}</div>
                {item.description && <div className="checklist-item-desc">{item.description}</div>}
                {item.location && <div className="checklist-item-location">{item.location}</div>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

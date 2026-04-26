export type Game = 'gta5' | 'rdr2';

export interface ChecklistItem {
  id: string;
  name: string;
  description?: string;
  category?: string;
  location?: string;
}

export interface TrackerDef {
  id: string;
  game: Game;
  title: string;
  subtitle?: string;
  items: ChecklistItem[];
}

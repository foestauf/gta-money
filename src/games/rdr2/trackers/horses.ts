import type { TrackerDef } from '../../../trackers/types';

export const horses: TrackerDef = {
  id: 'rdr2:horses',
  game: 'rdr2',
  title: 'Horses for Challenges',
  subtitle: 'Tasks across the nine Horseman challenges',
  items: [
    // Horseman 1
    { id: 'h1-kill-5-rabbits', name: 'Kill 5 rabbits from horseback', category: 'Horseman 1', description: 'Varmint Rifle recommended; Bolger Glade has frequent spawns' },

    // Horseman 2
    { id: 'h2-jump-3-obstacles', name: 'Jump over 3 obstacles in 15 seconds', category: 'Horseman 2', description: 'Any fence or stone wall counts; same obstacle can be repeated' },

    // Horseman 3
    { id: 'h3-valentine-to-rhodes', name: 'Ride Valentine → Rhodes in under 5 minutes', category: 'Horseman 3', description: "Horse must not enter water; Arthur must not dismount", location: 'Valentine → Rhodes' },

    // Horseman 4
    { id: 'h4-drag-victim-3300ft', name: 'Drag a victim 3,300 feet with lasso while mounted', category: 'Horseman 4', description: 'Victim must be alive when lassoed; dragging corpses does not count' },

    // Horseman 5
    { id: 'h5-trample-5-animals', name: 'Trample 5 animals on horseback', category: 'Horseman 5', description: 'Small animals count — rabbits, squirrels, frogs, turtles; Bayou Nwa and Bolger Glade are good spots' },

    // Horseman 6
    { id: 'h6-strawberry-to-saint-denis', name: 'Ride Strawberry → Saint Denis in under 9 minutes', category: 'Horseman 6', description: 'Horse must not touch any water; follow railway tracks through Riggs Station to avoid swamps', location: 'Strawberry → Saint Denis' },

    // Horseman 7
    { id: 'h7-kill-7-enemies', name: 'Kill 7 enemies from horseback without dismounting', category: 'Horseman 7', description: 'Progress resets if you dismount; gang hideouts are ideal for finding enough enemies' },

    // Horseman 8
    { id: 'h8-kill-9-predators', name: 'Kill 9 predators from horseback', category: 'Horseman 8', description: 'Predators include wolves, bears, cougars, alligators, panthers, coyotes and foxes; swamps north of Saint Denis work well' },

    // Horseman 9
    { id: 'h9-van-horn-to-blackwater', name: 'Ride Van Horn → Blackwater in under 17 minutes', category: 'Horseman 9', description: 'Horse must not touch any water; cross via Owanjila Dam; complete Chapter 6 first — Arthur is wanted in Blackwater', location: 'Van Horn → Blackwater' },
  ],
};

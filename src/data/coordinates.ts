// GTA V game-space coordinates for steps that have physical locations.
// Keyed by step ID from guide.ts.
// Sources: GTA V wiki, FiveM modding repos, community datasets.

export interface GameCoord {
  x: number;
  y: number;
  label?: string; // Optional override for marker label
}

// CRS transformation: converts GTA V game coords to Leaflet lat/lng
// From RiceaRaul/gta-v-map-leaflet
export const CRS_CONFIG = {
  scale_x: 0.02072,
  scale_y: 0.0205,
  center_x: 117.3,
  center_y: 172.8,
};

export function gameToLatLng(coord: GameCoord): [number, number] {
  const lat = CRS_CONFIG.center_y - coord.y * CRS_CONFIG.scale_y;
  const lng = CRS_CONFIG.center_x + coord.x * CRS_CONFIG.scale_x;
  return [lat, lng];
}

// Step ID -> game coordinate(s)
// Some steps have multiple locations (e.g. "Shop Robbery 1" is one store)
export const stepCoordinates: Record<string, GameCoord[]> = {
  // Phase 1
  '1-1': [{ x: -815, y: 177, label: 'The Good Husband' }],

  // Phase 2
  '2-1': [{ x: -27, y: -1298, label: 'Getaway Driver (Packie)' }],

  // Phase 3
  '3-1': [{ x: -630, y: -234, label: 'Vangelico Jewel Store' }],

  // Phase 4
  '4-1': [{ x: -56, y: -1115, label: 'Simeon Yetarian' }],
  '4-2': [{ x: -1908, y: -437, label: 'Dr. Friedlander' }],

  // Phase 5
  '5-1': [{ x: -1664, y: -1082, label: 'Epsilon Program' }],

  // Phase 7 - The Big Collection
  '7-1': [{ x: -1171, y: 4926, label: 'Altruist Cult' }],
  '7-2': [{ x: 1393, y: 3604, label: 'Drug Shootout' }],
  '7-3': [{ x: -1103, y: 4920, label: 'Maude (Bail Bonds)' }],
  '7-4': [{ x: -1012, y: -497, label: 'Vinewood Souvenirs' }],
  '7-7': [{ x: -60, y: -1030, label: 'Hao Street Races' }],
  '7-8': [{ x: -1252, y: -1458, label: 'Paparazzo' }],

  // Robberies - Store locations
  '7-19': [{ x: 25, y: -1347, label: 'Shop Robbery 1 (24/7)' }],
  '7-20': [{ x: 1166, y: -323, label: 'Shop Robbery 2 (24/7)' }],
  '7-21': [{ x: -47, y: -1758, label: 'LTD Gasoline (Davis)' }],
  '7-22': [{ x: -1820, y: 794, label: '24/7 (Chumash)' }],
  '7-23': [{ x: 2678, y: 3280, label: '24/7 (Harmony)' }],
  '7-24': [{ x: -255, y: 6340, label: 'Countryside Gang Fight' }],
  '7-25': [{ x: -175, y: -1687, label: 'Gang Intimidation' }],
  '7-26': [{ x: 1729, y: 6414, label: '24/7 (Grapeseed)' }],
  '7-27': [{ x: -710, y: -917, label: 'LTD Gasoline (Burton)' }],
  '7-28': [{ x: 1163, y: 2710, label: 'LTD Gasoline (Route 68)' }],
  '7-29': [{ x: -1557, y: -460, label: 'LTD Gasoline (Morningwood)' }],
  '7-30': [{ x: -878, y: -379, label: 'Escape Paparazzi' }],
  '7-31': [{ x: -508, y: 4671, label: 'Border Patrol 1' }],
  '7-32': [{ x: 1878, y: 3916, label: 'Border Patrol 2' }],
  '7-33': [{ x: 2516, y: 3706, label: 'Border Patrol 3' }],
  '7-34': [{ x: 549, y: 2671, label: '24/7 (Zancudo)' }],
  '7-35': [{ x: -1222, y: -907, label: "Rob's Liquor (Rockford)" }],
  '7-36': [{ x: 373, y: 328, label: '24/7 (Mirror Park)' }],
  '7-37': [{ x: -1487, y: -380, label: '24/7 (Morningwood)' }],
  '7-38': [{ x: 1135, y: -1275, label: "Rob's Liquor (Prosperity)" }],
  '7-39': [{ x: -1288, y: -1063, label: "Rob's Liquor (Del Perro)" }],
  '7-40': [{ x: -301, y: -830, label: 'ATM Robberies' }],
  '7-41': [{ x: -708, y: -152, label: 'LTD Gasoline (Vinewood)' }],
  '7-42': [{ x: -1350, y: -471, label: 'Chase Thieves City 2' }],
  '7-43': [{ x: 1960, y: 3740, label: "Scoops Liquor Barn" }],
  '7-44': [{ x: -3039, y: 594, label: '24/7 (Pacific Bluffs)' }],
  '7-45': [{ x: -1388, y: -580, label: 'Arrest 1' }],
  '7-46': [{ x: 346, y: -1573, label: 'Arrest 2' }],
  '7-47': [{ x: 2324, y: 3131, label: 'Chase Thieves Country 1' }],
  '7-48': [{ x: 108, y: -1304, label: 'Mugging 1' }],
  '7-49': [{ x: 1392, y: 3609, label: '24/7 (Sandy Shores)' }],
  '7-50': [{ x: 2557, y: 381, label: '24/7 (Tataviam)' }],
  '7-51': [{ x: 1689, y: 4817, label: 'Chase Thieves Country 2' }],
  '7-52': [{ x: -1392, y: -606, label: "Rob's Liquor (Del Perro)" }],
  '7-53': [{ x: 1388, y: 3614, label: "Trevor's Meth Lab" }],
  '7-54': [{ x: -576, y: 311, label: 'Drunk Driver 1' }],
  '7-55': [{ x: -2178, y: 217, label: 'Domestic' }],
  '7-56': [{ x: -1154, y: 4930, label: 'Rogue Altruists' }],
  '7-57': [{ x: 152, y: -1258, label: 'Luring Girl' }],

  // Random events with coords
  '7-11': [{ x: -414, y: -55, label: 'Bike Thief City 1' }],
  '7-12': [{ x: -1807, y: 2107, label: 'Burial' }],
  '7-13': [{ x: 1005, y: -1625, label: 'Deal Gone Wrong' }],
  '7-14': [{ x: 471, y: 2610, label: 'Countryside Robbery' }],
  '7-15': [{ x: -601, y: -1050, label: 'Security Vans' }],
  '7-17': [{ x: -183, y: -1281, label: 'Chase Thieves City 1' }],
  '7-18': [{ x: -600, y: -1014, label: 'Mugging 3' }],

  // Phase 9
  '9-1': [{ x: 712, y: -964, label: 'Boiler Suits / Masks' }],

  // Phase 10
  '10-1': [{ x: -1908, y: -437, label: 'Dr. Friedlander' }],

  // Phase 13
  '13-2': [{ x: -113, y: 6464, label: 'Paleto Bay (Heist)' }],

  // Phase 14
  '14-1': [{ x: -1908, y: -437, label: 'Dr. Friedlander' }],

  // Phase 15
  '15-3': [{ x: -1604, y: 4247, label: 'Uncalculated Risk' }],

  // Phase 17
  '17-1': [{ x: 1304, y: 3275, label: 'Crash Rescue (Taliana)' }],

  // Phase 18
  '18-1': [{ x: -1908, y: -437, label: 'Dr. Friedlander' }],

  // Phase 19
  '19-1': [{ x: -1908, y: -437, label: 'Kill Dr. Friedlander' }],

  // Phase 20
  '20-1': [{ x: -72, y: -793, label: 'Union Depository (Big Score)' }],

  // Phase 26
  '26-2': [{ x: 2639, y: 4618, label: 'Hitch Lift 1' }],
};

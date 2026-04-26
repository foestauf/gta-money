import type { TrackerDef } from '../../../trackers/types';

export const herbs: TrackerDef = {
  id: 'rdr2:herbs',
  game: 'rdr2',
  title: 'Herbs',
  subtitle: 'All 43 species for the Herbalist 9 challenge, grouped by region',
  items: [
    // Ambarino — Grizzlies & Cumberland Forest
    { id: 'alaskan-ginseng', name: 'Alaskan Ginseng', category: 'Ambarino', location: 'Cumberland Forest and Grizzlies foothills — base of pine trees' },
    { id: 'dragons-mouth-orchid', name: "Dragon's Mouth Orchid", category: 'Ambarino', location: "O'Creagh's Run and Grizzlies East — high mountain meadows" },
    { id: 'violet-snowdrop', name: 'Violet Snowdrop', category: 'Ambarino', location: 'Grizzlies West — high-altitude snowfields above Lake Isabella' },
    { id: 'wintergreen-berry', name: 'Wintergreen Berry', category: 'Ambarino', location: 'Northern Ambarino into Roanoke Ridge — coniferous woods' },

    // New Hanover — Heartlands & Roanoke Ridge
    { id: 'burdock-root', name: 'Burdock Root', category: 'New Hanover', location: 'Heartlands and Dakota River banks — disturbed ground and roadsides' },
    { id: 'common-bulrush', name: 'Common Bulrush', category: 'New Hanover', location: 'Kamassa River and Heartlands streams — also Bluewater Marsh edges' },
    { id: 'english-mace', name: 'English Mace', category: 'New Hanover', location: 'Northern Heartlands and southern Roanoke Ridge — open fields' },
    { id: 'golden-currant', name: 'Golden Currant', category: 'New Hanover', location: 'Roanoke Ridge thickets and riverbanks' },
    { id: 'indian-tobacco', name: 'Indian Tobacco', category: 'New Hanover', location: 'Heartlands and Roanoke Ridge clearings — also common in Bayou Nwa' },
    { id: 'milkweed', name: 'Milkweed', category: 'New Hanover', location: 'Heartlands and Dewberry Creek roadsides' },
    { id: 'moccasin-orchid', name: 'Moccasin Flower', category: 'New Hanover', location: 'Roanoke Ridge — large group southeast of Elysian Pool' },
    { id: 'sparrow-egg-orchid', name: "Sparrow's Egg Orchid", category: 'New Hanover', location: 'Roanoke Ridge — damp forested hillsides north of Annesburg' },
    { id: 'wild-carrot', name: 'Wild Carrot', category: 'New Hanover', location: 'Heartlands open fields and roadsides' },
    { id: 'yarrow', name: 'Yarrow', category: 'New Hanover', location: 'Heartlands and Dewberry Creek — yellow and red varieties both count' },

    // West Elizabeth — Big Valley, Tall Trees, Great Plains
    { id: 'american-ginseng', name: 'American Ginseng', category: 'West Elizabeth', location: 'Tall Trees forested ridges — also Roanoke Ridge edges' },
    { id: 'bay-bolete', name: 'Bay Bolete', category: 'West Elizabeth', location: 'Tall Trees and Big Valley forest floors near pine trees' },
    { id: 'creeping-thyme', name: 'Creeping Thyme', category: 'West Elizabeth', location: 'Big Valley and roadsides north of Strawberry — sandy, dry soil' },
    { id: 'hummingbird-sage', name: 'Hummingbird Sage', category: 'West Elizabeth', location: 'Little Creek River and Big Valley — forested hillsides' },
    { id: 'lady-slipper-orchid', name: 'Lady Slipper Orchid', category: 'West Elizabeth', location: 'Tall Trees and Big Valley — Black Bone Forest near the Trapper' },
    { id: 'oregano', name: 'Oregano', category: 'West Elizabeth', location: 'Great Plains and Flatneck Station roadsides — dry open ground' },
    { id: 'parasol-mushroom', name: 'Parasol Mushroom', category: 'West Elizabeth', location: 'Big Valley grasslands and forest edges along the train tracks' },
    { id: 'prairie-poppy', name: 'Prairie Poppy', category: 'West Elizabeth', location: 'Great Plains — alongside the train tracks south of Valentine' },
    { id: 'rams-head', name: "Ram's Head", category: 'West Elizabeth', location: 'Big Valley and Cumberland Forest — at the base of dead trees' },
    { id: 'red-raspberry', name: 'Red Raspberry', category: 'West Elizabeth', location: 'Big Valley and Tall Trees woodland edges' },
    { id: 'spider-orchid', name: 'Spider Orchid', category: 'West Elizabeth', location: 'Big Valley and Tall Trees — damp forest floors' },
    { id: 'wild-feverfew', name: 'Wild Feverfew', category: 'West Elizabeth', location: 'Big Valley grasslands — also Cholla Springs in the Epilogue' },
    { id: 'wild-mint', name: 'Wild Mint', category: 'West Elizabeth', location: 'Little Creek River streamsides and Big Valley meadows' },

    // Lemoyne — Bayou Nwa, Bluewater Marsh, Scarlett Meadows
    { id: 'acunas-star-orchid', name: "Acuna's Star Orchid", category: 'Lemoyne', location: 'Bayou Nwa east coast — on rocks and small islands' },
    { id: 'blackberry', name: 'Blackberry', category: 'Lemoyne', location: 'Scarlett Meadows forests and Lemoyne riverbanks' },
    { id: 'chanterelles', name: 'Chanterelles', category: 'Lemoyne', location: 'Bayou Nwa damp forest floors near Lakay' },
    { id: 'cigar-orchid', name: 'Cigar Orchid', category: 'Lemoyne', location: 'Bluewater Marsh — on cypress trees at swamp level' },
    { id: 'clamshell-orchid', name: 'Clamshell Orchid', category: 'Lemoyne', location: 'Bayou Nwa and Scarlett Meadows wetlands' },
    { id: 'evergreen-huckleberry', name: 'Evergreen Huckleberry', category: 'Lemoyne', location: 'Scarlett Meadows and Roanoke Ridge border — Kamassa River length' },
    { id: 'ghost-orchid', name: 'Ghost Orchid', category: 'Lemoyne', location: 'Bayou Nwa — deep swamp on cypress trunks' },
    { id: 'lady-of-the-night-orchid', name: 'Lady of the Night Orchid', category: 'Lemoyne', location: 'Bayou Nwa swamps' },
    { id: 'night-scented-orchid', name: 'Night Scented Orchid', category: 'Lemoyne', location: 'Bluewater Marsh wetlands — on cypress trees' },
    { id: 'oleander-sage', name: 'Oleander Sage', category: 'Lemoyne', location: 'Bayou Nwa and Bluewater Marsh — swamp watersides near Saint Denis' },
    { id: 'queens-orchid', name: "Queen's Orchid", category: 'Lemoyne', location: 'Bayou Nwa swamps — rare, in deep bayou' },
    { id: 'rat-tail-orchid', name: 'Rat Tail Orchid', category: 'Lemoyne', location: 'Bayou Nwa — on rocks and cypress trees' },
    { id: 'vanilla-flower', name: 'Vanilla Flower', category: 'Lemoyne', location: 'Bayou Nwa river banks — at the base of trees' },

    // New Austin — Cholla Springs, Río Bravo, Hennigan's Stead, Gaptooth Ridge (mostly Epilogue)
    { id: 'blackcurrant', name: 'Blackcurrant', category: 'New Austin', location: 'Gaptooth Ridge and Cholla Springs — also Río Bravo' },
    { id: 'desert-sage', name: 'Desert Sage', category: 'New Austin', location: 'Cholla Springs and Río Bravo — arid plains' },
    { id: 'red-sage', name: 'Red Sage', category: 'New Austin', location: 'Río Bravo southern hills near Fort Mercer — also Hennigan’s Stead' },
  ],
};

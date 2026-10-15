import { img, type Img } from "../types";

export type Kind = "perfume" | "discovery" | "candle" | "giftcard";
export type FamilyId = "fresh" | "floral" | "woody" | "amber";
export type Season = "Spring" | "Summer" | "Autumn" | "Winter";

export interface Variant {
  id: string;
  label: string;
  /** Base price in USD. Other currencies are derived in lib/commerce/markets.ts. */
  usd: number;
  stock: number;
  sku: string;
}

export interface Review {
  name: string;
  location: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  variant: string;
}

export interface Product {
  slug: string;
  kind: Kind;
  name: string;
  tagline: string;
  short: string;
  description: string[];
  family?: FamilyId;
  color: string;
  variants: Variant[];
  image: Img;
  hover?: Img;
  gallery: Img[];
  notes?: { top: string[]; heart: string[]; base: string[] };
  scales?: { intensity: number; longevity: number; sillage: number; longevityText: string; sillageText: string };
  seasons?: Season[];
  time?: ("Day" | "Evening")[];
  moods?: string[];
  pairs?: string[];
  ingredients?: string;
  specs?: string[];
  rating: { value: number; count: number };
  reviews: Review[];
}

export const FAMILIES: Record<FamilyId, { name: string; short: string; text: string; image: Img; color: string }> = {
  fresh: {
    name: "Fresh & Luminous",
    short: "Fresh",
    text: "Citrus peel, orange blossom and salt air. Bright, clean scents that feel like the first hour of a summer day.",
    image: img("mood-sol-blanc", "Lemon, neroli blossoms and sea salt on a travertine block"),
    color: "#E9E1C6",
  },
  floral: {
    name: "Floral & Powdery",
    short: "Floral",
    text: "Rose and iris, worn close to the skin. Petals with depth, softened with musk, suede and powder.",
    image: img("mood-iris-poudre", "An iris flower, loose petals and a dish of powder on pale stone"),
    color: "#E2C9C9",
  },
  woody: {
    name: "Green & Woody",
    short: "Woody",
    text: "Fig leaf, sandalwood and cedar shavings. Creamy, green and calm, for every day of the year.",
    image: img("mood-figue-lente", "Fresh figs, a fig leaf and a cup of milk on a travertine block"),
    color: "#C9D2B4",
  },
  amber: {
    name: "Amber & Smoke",
    short: "Amber",
    text: "Resins, oud, leather and black tea. Deep evening scents with a long, slow trail.",
    image: img("mood-ombre-doud", "Oud wood, saffron and amber resin on dark stone with rising smoke"),
    color: "#B98A64",
  },
};

const perfumeImages = (slug: string, name: string, life: string, mood: string): Pick<Product, "image" | "hover" | "gallery"> => {
  const bottle = img(`bottle-${slug}`, `${name} eau de parfum, 100 ml bottle with a wooden cap on a travertine block`);
  const m = img(`mood-${slug}`, mood);
  const l = img(`life-${slug}`, life);
  return { image: bottle, hover: m, gallery: [bottle, m, l] };
};

const sizes = (code: string, p50: number, p100: number, s50: number, s100: number): Variant[] => [
  { id: "50", label: "50 ml", usd: p50, stock: s50, sku: `SLV-${code}-50` },
  { id: "100", label: "100 ml", usd: p100, stock: s100, sku: `SLV-${code}-100` },
  { id: "2", label: "2 ml sample", usd: 6, stock: 400, sku: `SLV-${code}-02` },
];

export const PERFUMES: Product[] = [
  {
    slug: "sol-blanc",
    kind: "perfume",
    name: "Sol Blanc",
    tagline: "Sunlight on white linen.",
    short: "Amalfi lemon, neroli, sea salt",
    description: [
      "Sol Blanc opens like shutters in the morning: a squeeze of Amalfi lemon and bergamot, then the green, honeyed warmth of neroli distilled from bitter-orange blossom.",
      "A pinch of sea salt and a clean white musk keep it close and luminous, like freshly washed linen drying in the sun. Easy to wear, impossible to over-spray.",
    ],
    family: "fresh",
    color: "#EDE6CF",
    variants: sizes("SB", 150, 215, 46, 38),
    ...perfumeImages("sol-blanc", "Sol Blanc", "Sol Blanc on a travertine bathroom shelf beside a folded white towel and eucalyptus", "Lemon, neroli blossoms and sea salt on a travertine block"),
    notes: { top: ["Amalfi lemon", "Bergamot"], heart: ["Neroli", "Orange blossom"], base: ["Sea salt", "White musk"] },
    scales: { intensity: 2, longevity: 3, sillage: 2, longevityText: "5–6 hours", sillageText: "Soft, close to the skin" },
    seasons: ["Spring", "Summer"],
    time: ["Day"],
    moods: ["Clean", "Bright", "Effortless"],
    pairs: ["vetiver-mer", "iris-poudre"],
    ingredients: "Alcohol Denat., Parfum (Fragrance), Aqua (Water), Limonene, Linalool, Citral, Geraniol, Citronellol.",
    rating: { value: 4.8, count: 318 },
    reviews: [
      { name: "Hannah W.", location: "London, UK", rating: 5, title: "Smells like a holiday", body: "I wanted a citrus that didn't vanish after twenty minutes. The lemon fades into this soft salty musk that lasts all morning. Colleagues keep asking what it is.", date: "2026-08-28", variant: "50 ml" },
      { name: "Daniel R.", location: "Austin, US", rating: 5, title: "My summer signature", body: "Fresh without smelling like cologne. I spray twice before work and still catch it after lunch.", date: "2026-07-14", variant: "100 ml" },
      { name: "Léa M.", location: "Lyon, FR", rating: 4, title: "Beautiful, quite discreet", body: "The neroli is gorgeous. It sits close to the skin, which I like for the office, but if you want projection, look elsewhere.", date: "2026-06-02", variant: "50 ml" },
      { name: "Priya S.", location: "Dubai, AE", rating: 5, title: "Perfect in the heat", body: "Most perfumes turn heavy here. This one stays crisp and clean even at 40°C.", date: "2026-05-19", variant: "100 ml" },
    ],
  },
  {
    slug: "ombre-doud",
    kind: "perfume",
    name: "Ombre d’Oud",
    tagline: "Saffron, resin and the shadow of oud.",
    short: "Saffron, frankincense, oud",
    description: [
      "Ombre d’Oud is our darkest composition. Saffron and cardamom glow at the top, then frankincense and labdanum rise like smoke from a warm resin burner.",
      "At its heart is a sustainably sourced oud from cultivated Aquilaria trees, softened with benzoin so it reads velvet rather than barnyard. Rich, long-lasting and best on cool evenings.",
    ],
    family: "amber",
    color: "#8E3B1E",
    variants: sizes("OD", 175, 250, 4, 22),
    ...perfumeImages("ombre-doud", "Ombre d’Oud", "Ombre d’Oud on a dark walnut dresser beside a lit candle, a brass dish and a silk scarf", "Oud wood, saffron and amber resin on dark stone with rising smoke"),
    notes: { top: ["Saffron", "Cardamom"], heart: ["Frankincense", "Labdanum"], base: ["Cultivated oud", "Benzoin"] },
    scales: { intensity: 5, longevity: 5, sillage: 5, longevityText: "10+ hours", sillageText: "Strong, leaves a trail" },
    seasons: ["Autumn", "Winter"],
    time: ["Evening"],
    moods: ["Opulent", "Warm", "Mysterious"],
    pairs: ["santal-doux", "rose-nocturne"],
    ingredients: "Alcohol Denat., Parfum (Fragrance), Aqua (Water), Benzyl Benzoate, Eugenol, Coumarin, Linalool, Cinnamal.",
    rating: { value: 4.9, count: 241 },
    reviews: [
      { name: "Omar H.", location: "Riyadh, SA", rating: 5, title: "An oud for people who think they know oud", body: "Smooth, resinous and not at all harsh. Two sprays on a scarf and it was still there the next morning.", date: "2026-09-30", variant: "100 ml" },
      { name: "Sophie D.", location: "Brussels, BE", rating: 5, title: "Evening in a bottle", body: "The saffron opening is stunning. It's heavy, so one spray is enough for dinner.", date: "2026-09-02", variant: "50 ml" },
      { name: "James C.", location: "Toronto, CA", rating: 5, title: "Compliment machine", body: "I got this after trying the discovery set and used the credit. Best purchase this year.", date: "2026-08-11", variant: "100 ml" },
      { name: "Mia J.", location: "Amsterdam, NL", rating: 4, title: "Gorgeous but potent", body: "Love it in winter. In summer it's too much for me, so I wear Sol Blanc instead.", date: "2026-07-22", variant: "50 ml" },
    ],
  },
  {
    slug: "figue-lente",
    kind: "perfume",
    name: "Figue Lente",
    tagline: "A long afternoon under the fig tree.",
    short: "Fig leaf, fig milk, cedar",
    description: [
      "Figue Lente begins with the sharp green snap of a fig leaf crushed between your fingers, then slows down into the creamy, milky sweetness of ripe fruit split open in the sun.",
      "Cedarwood and sandalwood shavings give it a quiet backbone. Calm, green and comforting: the scent of doing nothing at all, slowly.",
    ],
    family: "woody",
    color: "#A9C08D",
    variants: sizes("FL", 150, 215, 31, 27),
    ...perfumeImages("figue-lente", "Figue Lente", "Figue Lente on a garden table under a fig tree with a bowl of fresh figs and a linen cloth", "Fresh figs, a fig leaf and a cup of milk on a travertine block"),
    notes: { top: ["Fig leaf", "Green bergamot"], heart: ["Fig milk", "Coconut water"], base: ["Cedarwood", "Sandalwood"] },
    scales: { intensity: 3, longevity: 4, sillage: 3, longevityText: "6–8 hours", sillageText: "Moderate, an arm’s length" },
    seasons: ["Spring", "Summer", "Autumn"],
    time: ["Day"],
    moods: ["Green", "Creamy", "Relaxed"],
    pairs: ["santal-doux", "sol-blanc"],
    ingredients: "Alcohol Denat., Parfum (Fragrance), Aqua (Water), Linalool, Limonene, Coumarin, Hexyl Cinnamal.",
    rating: { value: 4.7, count: 186 },
    reviews: [
      { name: "Grace L.", location: "Melbourne, AU", rating: 5, title: "Exactly like a fig tree", body: "The opening is so green it made me smile. It turns creamy and soft after an hour.", date: "2026-09-18", variant: "50 ml" },
      { name: "Marco B.", location: "Milan, IT", rating: 5, title: "Unisex and easy", body: "My partner and I share this one. Fresh, never sweet, very elegant.", date: "2026-08-03", variant: "100 ml" },
      { name: "Elena P.", location: "Madrid, ES", rating: 4, title: "Lovely, wish it lasted longer", body: "Six hours on me, which is fine for a green scent. I reapply after lunch.", date: "2026-06-25", variant: "50 ml" },
      { name: "Chris T.", location: "Seattle, US", rating: 5, title: "Calming", body: "I wear it on weekends. It just makes everything feel slower, like the name says.", date: "2026-05-08", variant: "2 ml sample" },
    ],
  },
  {
    slug: "rose-nocturne",
    kind: "perfume",
    name: "Rose Nocturne",
    tagline: "A dark rose after rain.",
    short: "Pink pepper, Turkish rose, patchouli",
    description: [
      "Rose Nocturne is the rose at midnight, not at noon. Pink pepper and blackcurrant leaf give it a fizzing, slightly bitter start before the Turkish rose absolute opens up, deep and jammy.",
      "Patchouli and a soft musk ground it in damp earth, the way a garden smells after an evening storm. Romantic, but never sweet.",
    ],
    family: "floral",
    color: "#E7B8AE",
    variants: sizes("RN", 160, 230, 24, 19),
    ...perfumeImages("rose-nocturne", "Rose Nocturne", "Rose Nocturne on a marble dressing table beside a vase of deep red roses and a round mirror", "A deep red rose, pink peppercorns and a leaf on a travertine block"),
    notes: { top: ["Pink pepper", "Blackcurrant leaf"], heart: ["Turkish rose", "Geranium"], base: ["Patchouli", "Musk"] },
    scales: { intensity: 4, longevity: 4, sillage: 4, longevityText: "8 hours", sillageText: "Noticeable in a room" },
    seasons: ["Autumn", "Winter", "Spring"],
    time: ["Evening", "Day"],
    moods: ["Romantic", "Moody", "Elegant"],
    pairs: ["ombre-doud", "iris-poudre"],
    ingredients: "Alcohol Denat., Parfum (Fragrance), Aqua (Water), Citronellol, Geraniol, Linalool, Eugenol, Farnesol.",
    rating: { value: 4.8, count: 204 },
    reviews: [
      { name: "Amelia K.", location: "Edinburgh, UK", rating: 5, title: "Finally a rose I love", body: "I always found rose perfumes old-fashioned. This one is dark and peppery and a bit wild.", date: "2026-09-21", variant: "50 ml" },
      { name: "Nadia F.", location: "Abu Dhabi, AE", rating: 5, title: "Beautiful projection", body: "People notice it when I walk into a room, but it never feels loud.", date: "2026-08-15", variant: "100 ml" },
      { name: "Julia S.", location: "Berlin, DE", rating: 5, title: "Wedding perfume", body: "Wore it on my wedding day in October. It smelled amazing in the photos, if that makes sense.", date: "2026-07-10", variant: "50 ml" },
      { name: "Ryan P.", location: "New York, US", rating: 4, title: "Great on men too", body: "Bought it for my wife, ended up wearing it myself. The patchouli makes it work.", date: "2026-04-29", variant: "100 ml" },
    ],
  },
  {
    slug: "cuir-fume",
    kind: "perfume",
    name: "Cuir Fumé",
    tagline: "Leather, black tea and cold smoke.",
    short: "Black tea, birch, suede",
    description: [
      "Cuir Fumé is an old library with the window open. Smoky lapsang black tea and birch bark meet a supple suede accord, worn soft like a favourite jacket.",
      "Guaiac wood and vetiver add a dry, ashy finish that lingers on wool for days. Quietly confident, made for cold mornings and long conversations.",
    ],
    family: "amber",
    color: "#4A3426",
    variants: sizes("CF", 165, 240, 18, 25),
    ...perfumeImages("cuir-fume", "Cuir Fumé", "Cuir Fumé on a leather-topped desk beside a notebook, a fountain pen and a cup of black coffee", "A folded leather hide, birch bark and black tea leaves on dark slate with a curl of smoke"),
    notes: { top: ["Lapsang black tea", "Birch bark"], heart: ["Suede accord", "Papyrus"], base: ["Guaiac wood", "Vetiver"] },
    scales: { intensity: 4, longevity: 5, sillage: 3, longevityText: "10 hours", sillageText: "Moderate, close but persistent" },
    seasons: ["Autumn", "Winter"],
    time: ["Day", "Evening"],
    moods: ["Smoky", "Refined", "Confident"],
    pairs: ["vetiver-mer", "santal-doux"],
    ingredients: "Alcohol Denat., Parfum (Fragrance), Aqua (Water), Linalool, Limonene, Isoeugenol, Coumarin.",
    rating: { value: 4.7, count: 152 },
    reviews: [
      { name: "Thomas N.", location: "Stockholm, SE", rating: 5, title: "Smells like a good bookshop", body: "Smoky but not campfire. The tea note is beautiful and it lasts the whole day on a sweater.", date: "2026-10-01", variant: "100 ml" },
      { name: "Aiko T.", location: "Tokyo, JP", rating: 5, title: "Elegant leather", body: "I prefer it to many famous leather perfumes that cost twice as much.", date: "2026-08-19", variant: "50 ml" },
      { name: "Liam O.", location: "Dublin, IE", rating: 4, title: "Takes time to open", body: "The first ten minutes are very smoky. After that it's perfect.", date: "2026-06-30", variant: "50 ml" },
      { name: "Sara V.", location: "Lisbon, PT", rating: 5, title: "My winter scent", body: "Feels warm and protective. I spray it on my coat collar.", date: "2026-02-12", variant: "100 ml" },
    ],
  },
  {
    slug: "santal-doux",
    kind: "perfume",
    name: "Santal Doux",
    tagline: "Soft sandalwood, warm skin.",
    short: "Cardamom, sandalwood, vanilla",
    description: [
      "Santal Doux is a cashmere sweater of a perfume. A breath of green cardamom leads into creamy Australian sandalwood and fresh cedar shavings.",
      "Madagascar vanilla and tonka bean melt into the skin underneath, sweet but never sugary. It smells like you, only better, from morning until late.",
    ],
    family: "woody",
    color: "#D9A55B",
    variants: sizes("SD", 155, 220, 52, 41),
    ...perfumeImages("santal-doux", "Santal Doux", "Santal Doux on a wooden bedside table in morning light beside a stack of books and a cup of coffee", "Vanilla pods, a sandalwood block, cedar shavings and green cardamom on travertine"),
    notes: { top: ["Green cardamom", "Pink grapefruit"], heart: ["Australian sandalwood", "Cedar shavings"], base: ["Madagascar vanilla", "Tonka bean"] },
    scales: { intensity: 3, longevity: 4, sillage: 3, longevityText: "8 hours", sillageText: "Moderate, a soft halo" },
    seasons: ["Autumn", "Winter", "Spring", "Summer"],
    time: ["Day", "Evening"],
    moods: ["Cosy", "Creamy", "Sensual"],
    pairs: ["figue-lente", "ombre-doud"],
    ingredients: "Alcohol Denat., Parfum (Fragrance), Aqua (Water), Coumarin, Linalool, Benzyl Benzoate, Limonene.",
    rating: { value: 4.9, count: 276 },
    reviews: [
      { name: "Olivia B.", location: "Sydney, AU", rating: 5, title: "Skin but better", body: "Exactly as described. Warm, soft and so comforting. I wear it every single day.", date: "2026-09-26", variant: "100 ml" },
      { name: "Lucas M.", location: "Munich, DE", rating: 5, title: "Best sandalwood I've tried", body: "Creamy, not sharp or plasticky like many sandalwood perfumes.", date: "2026-09-09", variant: "50 ml" },
      { name: "Fatima A.", location: "Doha, QA", rating: 5, title: "Layers beautifully", body: "I wear it under Ombre d'Oud for evenings. A perfect pair.", date: "2026-07-28", variant: "100 ml" },
      { name: "Emily R.", location: "Chicago, US", rating: 5, title: "Gift that became mine", body: "Bought it for my sister, ended up ordering one for myself the same week.", date: "2026-05-30", variant: "50 ml" },
    ],
  },
  {
    slug: "iris-poudre",
    kind: "perfume",
    name: "Iris Poudré",
    tagline: "Powder, suede and a cashmere scarf.",
    short: "Pear, orris butter, suede musk",
    description: [
      "Iris Poudré is built around orris butter, the precious paste made from iris roots that are dried for three years before distillation. It smells of cool powder, violets and soft suede.",
      "A crisp pear at the top keeps it fresh, while ambrette and a suede musk make it feel like a cashmere scarf against the skin. Elegant, quiet and quietly addictive.",
    ],
    family: "floral",
    color: "#CFC6DD",
    variants: sizes("IP", 165, 240, 21, 3),
    ...perfumeImages("iris-poudre", "Iris Poudré", "Iris Poudré on a linen-covered table beside a vase of purple irises, a makeup brush and a lilac scarf", "An iris flower, loose petals, a dish of powder and a brush on pale stone"),
    notes: { top: ["Pear", "Violet leaf"], heart: ["Orris butter", "Violet"], base: ["Suede musk", "Ambrette"] },
    scales: { intensity: 2, longevity: 3, sillage: 2, longevityText: "6 hours", sillageText: "Soft, a skin scent" },
    seasons: ["Spring", "Autumn"],
    time: ["Day"],
    moods: ["Powdery", "Elegant", "Soft"],
    pairs: ["rose-nocturne", "sol-blanc"],
    ingredients: "Alcohol Denat., Parfum (Fragrance), Aqua (Water), Alpha-Isomethyl Ionone, Linalool, Citronellol, Limonene.",
    rating: { value: 4.6, count: 129 },
    reviews: [
      { name: "Camille G.", location: "Paris, FR", rating: 5, title: "Pure elegance", body: "The iris is real and it shows. Powdery but modern, never like lipstick.", date: "2026-09-12", variant: "50 ml" },
      { name: "Isabel F.", location: "Barcelona, ES", rating: 4, title: "Subtle", body: "Very close to the skin. I love it for work but wish it projected a little more.", date: "2026-07-03", variant: "50 ml" },
      { name: "Noor K.", location: "London, UK", rating: 5, title: "Clean and calm", body: "Smells like expensive soap and soft leather. My most complimented perfume up close.", date: "2026-05-14", variant: "100 ml" },
      { name: "Hugo L.", location: "Geneva, CH", rating: 4, title: "Takes a few wears", body: "I wasn't sure at first, now I can't stop wearing it. Lovely in spring.", date: "2026-04-01", variant: "2 ml sample" },
    ],
  },
  {
    slug: "vetiver-mer",
    kind: "perfume",
    name: "Vétiver Mer",
    tagline: "Grapefruit, vetiver and salt air.",
    short: "Grapefruit, vetiver, driftwood",
    description: [
      "Vétiver Mer is a walk along the shore at the end of summer. Pink grapefruit sparkles at the top, then a mineral sea-salt accord and Haitian vetiver root take over, earthy and cool.",
      "Driftwood and a sun-warmed musk linger on the skin like salt after a swim. Fresh enough for August, grounded enough for every day.",
    ],
    family: "fresh",
    color: "#9FCFCB",
    variants: sizes("VM", 150, 215, 39, 33),
    ...perfumeImages("vetiver-mer", "Vétiver Mer", "Vétiver Mer on a weathered wooden table by the sea beside a striped towel, sunglasses and half a grapefruit", "Half a pink grapefruit, a bundle of vetiver roots, sea salt and a white pebble on travertine"),
    notes: { top: ["Pink grapefruit", "Bergamot"], heart: ["Sea-salt accord", "Haitian vetiver"], base: ["Driftwood", "Mineral musk"] },
    scales: { intensity: 3, longevity: 4, sillage: 3, longevityText: "7 hours", sillageText: "Moderate, fresh trail" },
    seasons: ["Spring", "Summer"],
    time: ["Day"],
    moods: ["Fresh", "Mineral", "Energising"],
    pairs: ["sol-blanc", "cuir-fume"],
    ingredients: "Alcohol Denat., Parfum (Fragrance), Aqua (Water), Limonene, Linalool, Citral, Coumarin.",
    rating: { value: 4.8, count: 233 },
    reviews: [
      { name: "Ben A.", location: "San Diego, US", rating: 5, title: "Best fresh scent", body: "Grapefruit and vetiver is a perfect combination. It lasts longer than any citrus I've owned.", date: "2026-09-05", variant: "100 ml" },
      { name: "Chloé R.", location: "Marseille, FR", rating: 5, title: "Smells like the Mediterranean", body: "Salty, sunny and a little earthy. Exactly a day at the beach.", date: "2026-08-08", variant: "50 ml" },
      { name: "Khalid M.", location: "Dubai, AE", rating: 5, title: "Great for the gym and office", body: "Clean, fresh and never too much. I keep the 50 ml in my bag.", date: "2026-06-17", variant: "50 ml" },
      { name: "Anna K.", location: "Warsaw, PL", rating: 4, title: "Fresh and modern", body: "Lovely, very unisex. The vetiver gets stronger in the dry down which I like.", date: "2026-05-02", variant: "100 ml" },
    ],
  },
];

export const DISCOVERY: Product = {
  slug: "discovery-set",
  kind: "discovery",
  name: "The Discovery Set",
  tagline: "All eight, plus two seasonal editions.",
  short: "10 × 2 ml · $38 back as credit",
  description: [
    "Ten 2 ml vials in a linen-covered box: all eight Solvane eaux de parfum plus two seasonal editions that change four times a year. Enough for three to four days of wear each, so you can live with a scent before you choose it.",
    "Your Discovery Set comes with a personal credit code worth its full price, to spend on any 50 ml or 100 ml bottle within 60 days. Shipping is always free.",
  ],
  color: "#E3DED6",
  variants: [{ id: "set", label: "10 × 2 ml", usd: 38, stock: 260, sku: "SLV-DISC-10" }],
  image: img("discovery-box", "The Solvane Discovery Set: an open linen box holding ten 2 ml perfume vials"),
  hover: img("discovery-flatlay", "Ten perfume vials laid out on travertine beside blotters, lavender and an open box"),
  gallery: [
    img("discovery-box", "The Solvane Discovery Set: an open linen box holding ten 2 ml perfume vials"),
    img("discovery-flatlay", "Ten perfume vials laid out on travertine beside blotters, lavender and an open box"),
  ],
  specs: ["10 × 2 ml eau de parfum vials with sprays", "Each vial gives 25–30 sprays", "Includes 4 scent blotters and a tasting card", "Recycled linen-covered box, made in France"],
  rating: { value: 4.9, count: 612 },
  reviews: [
    { name: "Rachel D.", location: "Boston, US", rating: 5, title: "Best way to buy perfume online", body: "I tried every vial for a few days and chose Santal Doux. Using the credit made the set basically free.", date: "2026-09-29", variant: "10 × 2 ml" },
    { name: "Tom H.", location: "Bristol, UK", rating: 5, title: "Beautiful box", body: "Arrived in two days, packaging is gorgeous. Great gift too.", date: "2026-08-20", variant: "10 × 2 ml" },
    { name: "Yasmin E.", location: "Dubai, AE", rating: 5, title: "So generous", body: "The vials last much longer than I expected. Ten scents for this price is excellent.", date: "2026-07-07", variant: "10 × 2 ml" },
  ],
};

const candle = (slug: string, name: string, tagline: string, short: string, description: string[], notes: Product["notes"], color: string, image: Img, stock: number, rating: Product["rating"], reviews: Review[], pairs: string[]): Product => ({
  slug,
  kind: "candle",
  name,
  tagline,
  short,
  description,
  color,
  variants: [{ id: "220", label: "220 g", usd: 68, stock, sku: `SLV-${slug.toUpperCase().replace(/[^A-Z]/g, "").slice(-4)}-220` }],
  image,
  hover: img("candle-trio", "Three Solvane candles in stone, sage and charcoal ceramic on a travertine shelf"),
  gallery: [image, img("candle-trio", "Three Solvane candles in stone, sage and charcoal ceramic on a travertine shelf")],
  notes,
  specs: ["220 g coconut and rapeseed wax blend", "Around 50 hours of burn time", "Lead-free cotton wick", "Matte ceramic vessel with ash-wood lid, made to be reused"],
  pairs,
  rating,
  reviews,
});

export const CANDLES: Product[] = [
  candle(
    "candle-ombre",
    "Ombre Candle",
    "Amber resin and smouldering woods.",
    "Saffron, frankincense, cedar",
    ["The warmth of Ombre d’Oud for your home: saffron, frankincense and cedar over a soft amber base. Lights up a room on winter evenings without ever becoming smoky."],
    { top: ["Saffron"], heart: ["Frankincense"], base: ["Amber", "Cedar"] },
    "#CDBFAE",
    img("candle-ombre", "Ombre candle in a stone-coloured ceramic vessel with an ash-wood lid, lit on travertine"),
    34,
    { value: 4.8, count: 88 },
    [
      { name: "Laura P.", location: "Vienna, AT", rating: 5, title: "Fills the room", body: "Even unlit it scents my living room. Burns very evenly.", date: "2026-09-15", variant: "220 g" },
      { name: "David K.", location: "Denver, US", rating: 5, title: "Cosy", body: "Exactly the evening mood I wanted. I'll reuse the jar for pens.", date: "2026-02-03", variant: "220 g" },
    ],
    ["ombre-doud", "santal-doux"]
  ),
  candle(
    "candle-jardin",
    "Jardin Candle",
    "Fig leaves and green tea in a summer garden.",
    "Fig leaf, green tea, white woods",
    ["A green, airy candle inspired by Figue Lente: crushed fig leaf, green tea and soft white woods. Fresh enough for the kitchen, calm enough for the bedroom."],
    { top: ["Fig leaf"], heart: ["Green tea"], base: ["White woods"] },
    "#A8B59A",
    img("candle-jardin", "Jardin candle in a sage-green ceramic vessel with an ash-wood lid, lit on travertine"),
    26,
    { value: 4.7, count: 64 },
    [
      { name: "Ines C.", location: "Porto, PT", rating: 5, title: "Smells like a garden", body: "So fresh. I burn it while working from home.", date: "2026-08-12", variant: "220 g" },
      { name: "Megan F.", location: "Leeds, UK", rating: 4, title: "Subtle", body: "Lovely green scent, best in a smaller room.", date: "2026-06-21", variant: "220 g" },
    ],
    ["figue-lente", "sol-blanc"]
  ),
  candle(
    "candle-sel",
    "Sel Noir Candle",
    "Sea salt, smoked wood and vetiver.",
    "Sea salt, smoked wood, vetiver",
    ["A mineral, slightly smoky candle that smells like a beach bonfire at dusk: sea salt, driftwood and vetiver, with a whisper of smoke from Cuir Fumé."],
    { top: ["Sea salt"], heart: ["Smoked wood"], base: ["Vetiver", "Driftwood"] },
    "#4B4B4A",
    img("candle-sel", "Sel Noir candle in a charcoal ceramic vessel with an ash-wood lid, lit on travertine"),
    5,
    { value: 4.8, count: 71 },
    [
      { name: "Erik S.", location: "Oslo, NO", rating: 5, title: "Unusual and beautiful", body: "Salty, smoky and clean. Very different from other candles.", date: "2026-09-03", variant: "220 g" },
      { name: "Jade W.", location: "Vancouver, CA", rating: 5, title: "Gift success", body: "Bought three as gifts. Everyone asked where it was from.", date: "2026-01-19", variant: "220 g" },
    ],
    ["vetiver-mer", "cuir-fume"]
  ),
];

export const GIFT_CARD: Product = {
  slug: "gift-card",
  kind: "giftcard",
  name: "Solvane Gift Card",
  tagline: "Let them choose their own scent.",
  short: "Digital · from $50",
  description: ["A digital gift card delivered by email on the date you choose, with your personal message. Valid for three years on everything at Solvane, including the Discovery Set."],
  color: "#E3DED6",
  variants: [{ id: "gc", label: "Digital", usd: 0, stock: 9999, sku: "SLV-GIFT" }],
  image: img("gift-wrapped", "A cream gift box tied with an amber silk ribbon and a sprig of eucalyptus"),
  hover: img("gift-open", "An open cream gift box holding a Solvane bottle, with an amber ribbon and a blank card"),
  gallery: [img("gift-wrapped", "A cream gift box tied with an amber silk ribbon and a sprig of eucalyptus")],
  rating: { value: 4.9, count: 57 },
  reviews: [],
};

/** Gift card face values in USD; converted per market. */
export const GIFT_CARD_USD = [50, 100, 150, 250];

export const ALL_PRODUCTS: Product[] = [...PERFUMES, DISCOVERY, ...CANDLES, GIFT_CARD];

export const getProduct = (slug: string) => ALL_PRODUCTS.find((p) => p.slug === slug);
export const getPerfume = (slug: string) => PERFUMES.find((p) => p.slug === slug);

/** Public URL of a product. */
export function productHref(p: Pick<Product, "slug" | "kind">) {
  if (p.kind === "discovery") return "/discovery-set";
  if (p.kind === "giftcard") return "/gifting#gift-card";
  return `/products/${p.slug}`;
}

/** Star breakdown derived from the average, for the review summary bars. */
export function ratingBreakdown(r: { value: number; count: number }) {
  const five = Math.round(r.count * Math.min(0.92, Math.max(0.55, (r.value - 4) * 1.05)));
  const four = Math.round((r.count - five) * 0.72);
  const three = Math.round((r.count - five - four) * 0.6);
  const two = Math.round((r.count - five - four - three) * 0.6);
  const one = r.count - five - four - three - two;
  return [five, four, three, two, one];
}

export const LOW_STOCK = 6;

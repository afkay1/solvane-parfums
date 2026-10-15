import { img } from "../types";

export const BRAND = {
  name: "Solvane",
  legalName: "Solvane Parfums SAS",
  tagline: "Eaux de parfum composed in Grasse, made slowly in small batches.",
  email: "care@solvane.com",
  phone: "+33 4 93 00 21 47",
  phoneHref: "tel:+33493002147",
  address: "Atelier Solvane, 18 Chemin des Roses, 06130 Grasse, France",
  hours: "Monday to Friday, 9:00–18:00 CET",
  founded: 2019,
  perfumer: "Camille Arnaud",
  instagram: "https://www.instagram.com/",
};

export const NAV = [
  { href: "/shop", label: "Shop" },
  { href: "/collections", label: "Collections" },
  { href: "/discovery-set", label: "Discovery Set" },
  { href: "/scent-finder", label: "Scent Finder" },
  { href: "/gifting", label: "Gifting" },
  { href: "/atelier", label: "Atelier" },
];

export const FOOTER_LINKS = [
  {
    title: "Shop",
    links: [
      { href: "/shop", label: "All fragrances" },
      { href: "/discovery-set", label: "Discovery Set" },
      { href: "/shop?category=candle", label: "Candles" },
      { href: "/gifting", label: "Gift cards" },
      { href: "/scent-finder", label: "Scent Finder" },
    ],
  },
  {
    title: "Help",
    links: [
      { href: "/track", label: "Track your order" },
      { href: "/shipping-returns", label: "Shipping & returns" },
      { href: "/faq", label: "FAQ" },
      { href: "/contact", label: "Contact us" },
    ],
  },
  {
    title: "Solvane",
    links: [
      { href: "/atelier", label: "Our atelier" },
      { href: "/collections", label: "Scent families" },
      { href: "/policies#privacy", label: "Privacy" },
      { href: "/policies#terms", label: "Terms of sale" },
    ],
  },
];

export const ANNOUNCEMENTS = ["free-shipping", "Two free samples with every order", "Discovery Set: try all eight, get the price back as credit"];

export const PROMISES = [
  { title: "Two free samples", text: "Choose two 2 ml samples with every order, so you can try something new." },
  { title: "Try before you open", text: "Every full bottle ships with a sealed 2 ml of the same scent. Not for you? Return the unopened bottle within 30 days." },
  { title: "Gift wrapped, free", text: "Our signature box, an amber ribbon and your message written by hand." },
  { title: "Ships from Grasse", text: "Packed by hand in our atelier and sent with tracking, worldwide." },
];

export const INGREDIENTS = [
  { name: "Amalfi lemon", origin: "Campania, Italy", used: "Sol Blanc", family: "Citrus" },
  { name: "Neroli", origin: "Nabeul, Tunisia", used: "Sol Blanc", family: "White flower" },
  { name: "Turkish rose", origin: "Isparta, Türkiye", used: "Rose Nocturne", family: "Floral" },
  { name: "Orris butter", origin: "Tuscany, Italy", used: "Iris Poudré", family: "Powdery" },
  { name: "Fig leaf", origin: "Provence, France", used: "Figue Lente", family: "Green" },
  { name: "Australian sandalwood", origin: "Western Australia", used: "Santal Doux", family: "Woody" },
  { name: "Haitian vetiver", origin: "Les Cayes, Haiti", used: "Vétiver Mer", family: "Earthy" },
  { name: "Cultivated oud", origin: "Assam, India", used: "Ombre d’Oud", family: "Resinous" },
  { name: "Lapsang black tea", origin: "Fujian, China", used: "Cuir Fumé", family: "Smoky" },
  { name: "Madagascar vanilla", origin: "Sava, Madagascar", used: "Santal Doux", family: "Gourmand" },
];

export const MARQUEE = ["Amalfi lemon", "Neroli", "Fig milk", "Turkish rose", "Orris butter", "Lapsang tea", "Cultivated oud", "Sandalwood", "Haitian vetiver", "Sea salt", "Saffron", "Madagascar vanilla"];

export const NUMBERS = [
  { value: "300", label: "bottles per batch" },
  { value: "6", label: "weeks of maceration" },
  { value: "20–22%", label: "perfume concentration" },
  { value: "0", label: "animal-derived ingredients" },
];

export const ATELIER_STEPS = [
  {
    title: "Sourcing",
    text: "We buy raw materials from growers we know by name: May rose from the fields around Grasse, orris from Tuscany, vetiver from a cooperative in southern Haiti. Natural materials are paired with safe, modern molecules for clarity and longevity.",
    image: img("atelier-roses", "A woven basket of freshly picked pink rose petals on a stone wall beside a misty rose field"),
  },
  {
    title: "Distillation",
    text: "Some of our materials are still distilled the old way, in copper alembics in a stone barn outside Grasse. It is slow and expensive, and it gives oils with a warmth that industrial extraction cannot match.",
    image: img("atelier-workshop", "A stone distillery with copper alembic stills, oak barrels and glass demijohns in morning light"),
  },
  {
    title: "Composition",
    text: "Each perfume takes Camille between one and three years and often more than two hundred trials. Every formula is weighed by hand on a precision scale and judged on blotters, then on skin, for days at a time.",
    image: img("atelier-bench", "A perfumer’s workbench with beakers, a precision scale, a pipette, a notebook and paper blotters"),
  },
  {
    title: "Maceration & bottling",
    text: "Once blended, every batch rests for six weeks in the dark so the materials can marry, then is chilled, filtered and bottled by hand. We number every batch and never make more than three hundred bottles at a time.",
    image: img("home-blotters", "A fan of perfume blotters in a ceramic cup on a travertine plinth, casting a long shadow"),
  },
];

export const VALUES = [
  { title: "Vegan & cruelty-free", text: "No animal-derived ingredients and no animal testing, at any stage." },
  { title: "IFRA compliant", text: "Every formula meets the latest International Fragrance Association standards." },
  { title: "Recycled glass", text: "Bottles contain 30% recycled glass. Caps are FSC-certified beech." },
  { title: "Plastic-free packaging", text: "Paper tape, recycled card and a linen-covered box made to be kept." },
];

export interface Faq {
  q: string;
  a: string;
}

export const FAQ_GROUPS: { title: string; id: string; items: Faq[] }[] = [
  {
    title: "Orders & shipping",
    id: "orders",
    items: [
      { q: "Where do you ship?", a: "We ship to the United States, the United Kingdom, the European Union, the UAE and more than a dozen other countries. Choose your country in the header or footer to see prices, delivery times and costs in your currency." },
      { q: "How long does delivery take?", a: "Orders placed before 2 pm (Paris time) on a business day leave our atelier the same day. Standard delivery takes 2–6 business days depending on your country, and express delivery 1–3 business days. The exact delivery window is shown in your bag and at checkout." },
      { q: "Is shipping free?", a: "Standard shipping is free over $150 in the US, £125 in the UK, €140 in the EU, AED 550 in the UAE and $250 elsewhere. The Discovery Set and samples always ship free." },
      { q: "Will I pay import duties?", a: "No. Prices in the UK, EU and UAE include VAT, and for international orders we prepay all duties and taxes. US orders show estimated sales tax at checkout." },
      { q: "Can I change or cancel my order?", a: "We pack quickly, so write to us within one hour of ordering and we will do our best. Once shipped, you can return it instead." },
    ],
  },
  {
    title: "Returns",
    id: "returns",
    items: [
      { q: "What is your return policy?", a: "You can return unopened full bottles and candles within 30 days of delivery for a full refund. Every 50 ml and 100 ml bottle ships with a sealed 2 ml of the same scent: try it first, and if it is not for you, send the bottle back unopened." },
      { q: "How do I start a return?", a: "Email care@solvane.com with your order number. We send a prepaid return label for the US, UK and EU; refunds are made to your original payment method within 5 business days of the bottle reaching us." },
      { q: "Can I return the Discovery Set?", a: "For hygiene reasons opened sets and samples cannot be returned, but your Discovery Set credit means its price comes back to you when you choose a full bottle." },
    ],
  },
  {
    title: "The perfumes",
    id: "perfumes",
    items: [
      { q: "What concentration are your perfumes?", a: "All Solvane perfumes are eaux de parfum with 20–22% perfume oil, macerated for six weeks. That is higher than many eaux de parfum and is why they last 6–10+ hours." },
      { q: "Are they unisex?", a: "Yes. We describe scents by mood and family, not by gender. Wear whatever makes you feel like yourself." },
      { q: "Are your perfumes natural?", a: "We use a high proportion of natural materials alongside safe, modern molecules. The molecules make our perfumes clearer, longer-lasting and more consistent, and they protect fragile natural resources." },
      { q: "How should I store my perfume?", a: "Keep it away from light and heat, ideally in its box in a cupboard rather than in a bathroom. Stored well, an eau de parfum keeps for three to five years." },
      { q: "Are they vegan?", a: "Yes. No animal-derived ingredients and no animal testing at any stage." },
    ],
  },
  {
    title: "Discovery Set & samples",
    id: "discovery",
    items: [
      { q: "How does the Discovery Set credit work?", a: "With your Discovery Set you receive a personal credit code worth its full price. Enter it at checkout within 60 days on any 50 ml or 100 ml bottle and the amount is deducted." },
      { q: "What are the two seasonal editions?", a: "Alongside our eight permanent perfumes, the set includes two seasonal editions that change four times a year. This autumn they are Thé Noir, a smoky black tea and fig, and Bois d’Hiver, cedar with frost-dried juniper." },
      { q: "How do I choose my free samples?", a: "Open your bag and pick any two of our eight perfumes. They are added free to every order that includes a physical product." },
    ],
  },
  {
    title: "Gifting",
    id: "gifting",
    items: [
      { q: "Do you gift wrap?", a: "Yes, for free. Tick gift wrap in your bag and add a message: we write it by hand on our card and leave prices off the packing slip." },
      { q: "How do gift cards work?", a: "Gift cards are digital and delivered by email on the date you choose. They are valid for three years on everything at Solvane, including the Discovery Set." },
      { q: "Do you offer corporate gifts?", a: "Yes, from 20 boxes with personalised cards and delivery to multiple addresses. Write to us through the contact page and choose “Corporate gifting”." },
    ],
  },
];

export const FAQS: Faq[] = FAQ_GROUPS.flatMap((g) => g.items);

export const CONTACT_TOPICS = ["An existing order", "Choosing a scent", "Returns", "Corporate gifting", "Press", "Something else"];

import { PERFUMES } from "./products";

type Weights = Partial<Record<string, number>>;

export interface QuizOption {
  id: string;
  label: string;
  hint?: string;
  weights: Weights;
}

export interface QuizQuestion {
  id: string;
  title: string;
  sub: string;
  options: QuizOption[];
}

/**
 * Six questions. Every answer nudges the eight perfumes up or down; the three
 * highest scores become the matches. Weights were tuned so every perfume can win.
 */
export const QUIZ: QuizQuestion[] = [
  {
    id: "moment",
    title: "When will you wear it most?",
    sub: "Pick the moment you picture first.",
    options: [
      { id: "morning", label: "Bright mornings", hint: "Coffee, open windows", weights: { "sol-blanc": 3, "vetiver-mer": 2, "figue-lente": 2, "iris-poudre": 1 } },
      { id: "work", label: "Working days", hint: "Close, polished, easy", weights: { "iris-poudre": 3, "santal-doux": 2, "sol-blanc": 1, "cuir-fume": 1 } },
      { id: "evening", label: "Evenings out", hint: "Dinner, candlelight", weights: { "ombre-doud": 3, "rose-nocturne": 3, "cuir-fume": 1 } },
      { id: "always", label: "All day, every day", hint: "A signature", weights: { "santal-doux": 3, "figue-lente": 2, "vetiver-mer": 1 } },
    ],
  },
  {
    id: "place",
    title: "Where would you rather be?",
    sub: "Close your eyes for a second.",
    options: [
      { id: "sea", label: "A terrace above the sea", weights: { "vetiver-mer": 3, "sol-blanc": 3 } },
      { id: "orchard", label: "Under a fig tree at noon", weights: { "figue-lente": 4, "santal-doux": 1 } },
      { id: "library", label: "A library with leather chairs", weights: { "cuir-fume": 4, "santal-doux": 1, "ombre-doud": 1 } },
      { id: "garden", label: "A rose garden after rain", weights: { "rose-nocturne": 4, "iris-poudre": 1 } },
      { id: "souk", label: "A candlelit room full of incense", weights: { "ombre-doud": 4, "cuir-fume": 1 } },
    ],
  },
  {
    id: "notes",
    title: "Which ingredients draw you in?",
    sub: "Go with your nose, not your head.",
    options: [
      { id: "citrus", label: "Citrus peel & sea salt", weights: { "sol-blanc": 3, "vetiver-mer": 3 } },
      { id: "green", label: "Green leaves & creamy milk", weights: { "figue-lente": 4 } },
      { id: "petals", label: "Petals & soft powder", weights: { "iris-poudre": 3, "rose-nocturne": 2 } },
      { id: "woods", label: "Warm woods & vanilla", weights: { "santal-doux": 4, "ombre-doud": 1 } },
      { id: "smoke", label: "Smoke, tea & resin", weights: { "cuir-fume": 3, "ombre-doud": 3 } },
    ],
  },
  {
    id: "presence",
    title: "How should it wear?",
    sub: "This tells us how bold to go.",
    options: [
      { id: "skin", label: "A secret, close to the skin", weights: { "iris-poudre": 3, "sol-blanc": 2, "santal-doux": 1 } },
      { id: "room", label: "Noticed when I walk in", weights: { "rose-nocturne": 2, "figue-lente": 1, "vetiver-mer": 2, "cuir-fume": 1 } },
      { id: "trail", label: "A trail people remember", weights: { "ombre-doud": 4, "rose-nocturne": 2 } },
    ],
  },
  {
    id: "season",
    title: "Your favourite season?",
    sub: "Perfume behaves differently in heat and cold.",
    options: [
      { id: "spring", label: "Spring", weights: { "iris-poudre": 2, "figue-lente": 2, "sol-blanc": 1 } },
      { id: "summer", label: "Summer", weights: { "vetiver-mer": 3, "sol-blanc": 2, "figue-lente": 1 } },
      { id: "autumn", label: "Autumn", weights: { "cuir-fume": 2, "rose-nocturne": 2, "santal-doux": 2 } },
      { id: "winter", label: "Winter", weights: { "ombre-doud": 3, "santal-doux": 2, "cuir-fume": 1 } },
    ],
  },
  {
    id: "taste",
    title: "Pick something to taste.",
    sub: "Scent and flavour are close cousins.",
    options: [
      { id: "granita", label: "Lemon granita", weights: { "sol-blanc": 3, "vetiver-mer": 1 } },
      { id: "figs", label: "Fresh figs with yoghurt", weights: { "figue-lente": 3, "santal-doux": 1 } },
      { id: "tea", label: "Smoky black tea", weights: { "cuir-fume": 3, "vetiver-mer": 1 } },
      { id: "delight", label: "Rose Turkish delight", weights: { "rose-nocturne": 3, "iris-poudre": 1 } },
      { id: "chocolate", label: "Saffron hot chocolate", weights: { "ombre-doud": 3, "santal-doux": 2 } },
    ],
  },
];

export function scoreQuiz(answers: Record<string, string>) {
  const scores = new Map<string, number>(PERFUMES.map((p) => [p.slug, 0]));
  let max = 0;
  for (const q of QUIZ) {
    const best = Math.max(...q.options.map((o) => Math.max(0, ...Object.values(o.weights).map((v) => v ?? 0))));
    max += best;
    const opt = q.options.find((o) => o.id === answers[q.id]);
    if (!opt) continue;
    for (const [slug, w] of Object.entries(opt.weights)) scores.set(slug, (scores.get(slug) ?? 0) + (w ?? 0));
  }
  return Array.from(scores.entries())
    .map(([slug, s]) => ({ slug, score: s, match: Math.min(98, Math.round(55 + (s / max) * 45)) }))
    .sort((a, b) => b.score - a.score || a.slug.localeCompare(b.slug))
    .slice(0, 3);
}

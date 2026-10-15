export interface Img {
  src: string;
  alt: string;
}

export const img = (name: string, alt: string): Img => ({ src: `/images/${name}.webp`, alt });

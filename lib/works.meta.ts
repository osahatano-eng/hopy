export const WORKS_META: Record<
  string,
  {
    title?: string;
    price?: number;

    // ✅ こっちが正：stripePriceId
    stripePriceId?: string;

    description?: string;
    size?: string;
    tags?: string[];
    video?: string;
  }
> = {
  y8durmct: {
    title: "y8durmct",
    price: 390,
    stripePriceId: "price_1SoqF5PdHZWs1X17cvujvG32",
  },

  g4tywz0w: {
    title: "g4tywz0w",
    price: 390,
    stripePriceId: "price_1SpcChPdHZWs1X17tkGdGAU5",
  },
} as const;



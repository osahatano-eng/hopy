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
    stripePriceId: "price_1Sov8RPdHZWs1X17dIDyEZPm",
  },

  g4tywz0w: {
    title: "g4tywz0w",
    price: 390,
    stripePriceId: "price_1SovAMPdHZWs1X17DxvgZ1Fg",
  },
   5wf7bntd: {
    title: "5wf7bntd",
    price: 390,
    stripePriceId: "price_1SpnHhPdHZWs1X17U7CniiO3",
  },
  
} as const;





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
  "y8durmct": {
    title: "y8durmct",
    price: 390,
    stripePriceId: "price_1Sov8RPdHZWs1X17dIDyEZPm",
  },
  "g4tywz0w": {
    title: "g4tywz0w",
    price: 390,
    stripePriceId: "price_1SovAMPdHZWs1X17DxvgZ1Fg",
  },
  "5wf7bntd": {
    title: "5wf7bntd",
    price: 390,
    stripePriceId: "price_1SpngjPdHZWs1X17VuKOI5td",
  },
    "r4xva4g5": {
    title: "r4xva4g5",
    price: 390,
    stripePriceId: "price_1SppcgPdHZWs1X17LXQzU1S9",
  },
    "m48opy86": {
    title: "m48opy86",
    price: 390,
    stripePriceId: "",
  },
} as const;












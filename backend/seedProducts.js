const optimize = (photoId, width = 520, height = 390) =>
  `https://images.unsplash.com/${photoId}?w=${width}&h=${height}&fit=crop&q=82&auto=format`;

const seedProducts = [
  {
    legacyNames: ["Standard Thali"],
    name: "Homestyle Daily Thali",
    description:
      "A balanced everyday plate — creamy dal, seasonal sabzi, steamed rice, soft roti, fresh salad, and tangy achaar. Wholesome, familiar, and made to feel like home.",
    image: optimize("photo-1742281257687-092746ad6021"),
    price: 120,
    status: "AVAILABLE",
    category: "THALI",
  },
  {
    legacyNames: ["Deluxe Thali"],
    name: "Premium Signature Thali",
    description:
      "Our chef's elevated thali: rich paneer curry, fragrant jeera rice, butter-brushed roti, cooling raita, and a sweet finish. Comfort food with a touch of indulgence.",
    image: optimize("photo-1585937421612-70a008356fbe"),
    price: 180,
    status: "AVAILABLE",
    category: "THALI",
  },
  {
    legacyNames: ["Rajma Rice Combo"],
    name: "Classic Rajma & Rice",
    description:
      "Slow-simmered kidney beans in a spiced tomato-onion gravy, served with fluffy steamed rice and a crisp onion salad. A North Indian staple, done the homely way.",
    image: optimize("photo-1606471191009-63994c53433b"),
    price: 99,
    status: "AVAILABLE",
    category: "COMBO_MEAL",
  },
  {
    legacyNames: ["Chole Rice Combo"],
    name: "Punjabi Chole & Rice",
    description:
      "Hearty Punjabi chickpea curry with warm aromatic spices, paired with fragrant basmati rice. Bold, satisfying, and perfect for a filling lunch.",
    image: optimize("photo-1563379091339-03b21ab4a4f8"),
    price: 99,
    status: "AVAILABLE",
    category: "COMBO_MEAL",
  },
  {
    legacyNames: ["Extra Roti"],
    name: "Fresh Whole Wheat Roti",
    description:
      "Soft, hot whole wheat flatbread rolled fresh to order. The perfect add-on to round out any meal.",
    image: optimize("photo-1565557623262-b51c2513a641"),
    price: 15,
    status: "AVAILABLE",
    category: "ADD_ON",
  },
  {
    legacyNames: ["Garden Salad"],
    name: "Kachumber Garden Salad",
    description:
      "Bright kachumber-style salad — cucumber, tomato, and onion tossed with lemon and a light chaat masala lift. Fresh, crunchy, and refreshing.",
    image: optimize("photo-1540420773420-3366772f4999"),
    price: 40,
    status: "AVAILABLE",
    category: "ADD_ON",
  },
  {
    legacyNames: ["Boondi Raita"],
    name: "Chilled Boondi Raita",
    description:
      "Smooth yogurt whisked with crispy boondi and roasted cumin. A cooling side that balances spice and heat.",
    image: optimize("photo-1517244683847-7456b63c5969"),
    price: 35,
    status: "AVAILABLE",
    category: "ADD_ON",
  },
];

module.exports = seedProducts;

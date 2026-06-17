/**
 * Landing page static images.
 * Place JPG files in: frontend/public/assets/images/
 *
 * Required files:
 *   - hygienic-kitchen.jpg
 *   - expert-chefs.jpg
 *   - fresh-vegetables.jpg
 *   - fast-delivery.jpg
 *   - digital-payments.jpg
 *   - affordable-prices.jpg
 *   - hero-meal.jpg (optional hero background)
 */

const ASSETS_BASE = `${process.env.PUBLIC_URL || ""}/assets/images`;

export const LANDING_IMAGES = {
  hero: `${ASSETS_BASE}/hero-meal.jpg`,
  hygienicKitchen: `${ASSETS_BASE}/hygienic-kitchen.jpg`,
  expertChefs: `${ASSETS_BASE}/expert-chefs.jpg`,
  freshVegetables: `${ASSETS_BASE}/fresh-vegetables.jpg`,
  fastDelivery: `${ASSETS_BASE}/fast-delivery.jpg`,
  digitalPayments: `${ASSETS_BASE}/digital-payments.jpg`,
  affordablePrices: `${ASSETS_BASE}/affordable-prices.jpg`,
};

export const LANDING_HIGHLIGHTS = [
  {
    title: "Best Hygienic Kitchen",
    description:
      "Our kitchen follows strict hygiene standards so every meal is prepared in a clean, safe environment.",
    image: LANDING_IMAGES.hygienicKitchen,
    icon: "kitchen",
  },
  {
    title: "Expert Chefs",
    description:
      "Experienced home-style cooks prepare authentic recipes with care, just like ghar ka khana.",
    image: LANDING_IMAGES.expertChefs,
    icon: "chef",
  },
  {
    title: "Fresh Vegetables",
    description:
      "We use fresh, quality ingredients sourced daily for wholesome and flavourful meals.",
    image: LANDING_IMAGES.freshVegetables,
    icon: "vegetables",
  },
  {
    title: "Fast Home Delivery",
    description:
      "Hot meals delivered quickly to your doorstep across our local delivery area.",
    image: LANDING_IMAGES.fastDelivery,
    icon: "delivery",
  },
  {
    title: "Smooth Digital Payments",
    description:
      "Pay securely online with a simple checkout — no hassle, no confusion.",
    image: LANDING_IMAGES.digitalPayments,
    icon: "payment",
  },
  {
    title: "Affordable Prices",
    description:
      "Home-style tiffin meals at prices that keep everyday dining easy on your pocket.",
    image: LANDING_IMAGES.affordablePrices,
    icon: "price",
  },
];

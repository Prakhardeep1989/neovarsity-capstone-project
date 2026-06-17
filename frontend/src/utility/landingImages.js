import { FOOD_SERVICE_IMAGES } from "./foodServiceImages";

export const LANDING_IMAGES = {
  hero: FOOD_SERVICE_IMAGES.hero,
  hygienicKitchen: FOOD_SERVICE_IMAGES.hygienicKitchen,
  expertChefs: FOOD_SERVICE_IMAGES.expertChefs,
  freshVegetables: FOOD_SERVICE_IMAGES.freshVegetables,
  fastDelivery: FOOD_SERVICE_IMAGES.fastDelivery,
  digitalPayments: FOOD_SERVICE_IMAGES.digitalPayments,
  affordablePrices: FOOD_SERVICE_IMAGES.affordablePrices,
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

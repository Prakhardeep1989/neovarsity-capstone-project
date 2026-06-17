/**
 * Curated warm-toned food-service imagery.
 * Indian home-style meals with consistent crop, quality, and warm palette.
 */

const ASSETS_BASE = `${process.env.PUBLIC_URL || ""}/assets/images`;
const ASSET_VERSION = "2";

const localAsset = (filename) => `${ASSETS_BASE}/${filename}?v=${ASSET_VERSION}`;

const optimize = (photoId, width, height) =>
  `https://images.unsplash.com/${photoId}?w=${width}&h=${height}&fit=crop&q=82&auto=format`;

export const FOOD_SERVICE_IMAGES = {
  hero: optimize("photo-1585937421612-7a4d08aa4d1f", 1200, 900),
  hygienicKitchen: optimize("photo-1556910103-1c02745aae4d", 800, 500),
  // Local assets — verified delivery / chef / INR imagery (avoids broken CDN fallbacks)
  expertChefs: localAsset("expert-chefs.jpg"),
  freshVegetables: optimize("photo-1540420773420-3366772f4999", 800, 500),
  fastDelivery: localAsset("fast-delivery.jpg"),
  digitalPayments: optimize("photo-1563013544-824ae1b704d3", 800, 500),
  affordablePrices: localAsset("affordable-prices.jpg"),
  thali: optimize("photo-1585937421612-7a4d08aa4d1f", 520, 390),
  comboMeal: optimize("photo-1601055920504-6f935284601d", 520, 390),
  addOn: optimize("photo-1626075621479-816963be6ddb", 520, 390),
  defaultMeal: optimize("photo-1504674900247-0877df9cc836", 520, 390),
  login: optimize("photo-1556910103-1c02745aae4d", 240, 240),
  emptyCart: optimize("photo-1534422298397-e4f8c17278c0", 480, 360),
  error404: optimize("photo-1601055920504-6f935284601d", 800, 600),
};

export const BRAND_LOGO_PATH = `${process.env.PUBLIC_URL || ""}/assets/homely-logo.png`;

export const FOOD_IMAGE_CLASS = "w-full h-full object-cover rounded-xl";

export const FOOD_IMAGE_CARD_CLASS = "w-full h-full object-cover rounded-lg";

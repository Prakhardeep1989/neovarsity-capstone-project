import { FOOD_SERVICE_IMAGES, BRAND_LOGO_PATH } from "./foodServiceImages";

const categoryImages = {
  THALI: FOOD_SERVICE_IMAGES.thali,
  COMBO_MEAL: FOOD_SERVICE_IMAGES.comboMeal,
  ADD_ON: FOOD_SERVICE_IMAGES.addOn,
  other: FOOD_SERVICE_IMAGES.defaultMeal,
};

export const DEFAULT_FOOD_IMAGE = FOOD_SERVICE_IMAGES.defaultMeal;

export const getProductImage = (image, category = "other") => {
  if (image && image.trim()) return image;
  const key = (category || "other").toUpperCase();
  return categoryImages[key] || DEFAULT_FOOD_IMAGE;
};

export const BRAND_LOGO = BRAND_LOGO_PATH;

export const LOGIN_IMAGE = FOOD_SERVICE_IMAGES.login;

export const EMPTY_CART_IMAGE = FOOD_SERVICE_IMAGES.emptyCart;

export const ERROR_404_IMAGE = FOOD_SERVICE_IMAGES.error404;

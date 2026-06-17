const categoryImages = {
  THALI: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop",
  COMBO_MEAL: "https://images.unsplash.com/photo-1516684669130-aa58539042e5?w=400&auto=format&fit=crop",
  ADD_ON: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&auto=format&fit=crop",
  other: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&auto=format&fit=crop",
};

export const DEFAULT_FOOD_IMAGE =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&auto=format&fit=crop";

export const getProductImage = (image, category = "other") => {
  if (image && image.trim()) return image;
  const key = category?.toLowerCase?.() || "other";
  return categoryImages[key] || DEFAULT_FOOD_IMAGE;
};

export const BRAND_LOGO =
  "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&auto=format&fit=crop";

export const LOGIN_IMAGE =
  "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=200&auto=format&fit=crop";

export const EMPTY_CART_IMAGE =
  "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop";

export const ERROR_404_IMAGE =
  "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&auto=format&fit=crop";

const categoryImages = {
  fruits: "https://images.unsplash.com/photo-1610831308542-5873a349d2eb?w=400&auto=format&fit=crop",
  vegetable: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&auto=format&fit=crop",
  icream: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&auto=format&fit=crop",
  dosa: "https://images.unsplash.com/photo-1630383249896-424e482dfaeb?w=400&auto=format&fit=crop",
  pizza: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&auto=format&fit=crop",
  rice: "https://images.unsplash.com/photo-1516684669130-aa58539042e5?w=400&auto=format&fit=crop",
  cake: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&auto=format&fit=crop",
  burger: "https://images.unsplash.com/photo-1568901347635-c4030a548a92?w=400&auto=format&fit=crop",
  panner: "https://images.unsplash.com/photo-1631452181589-215fdab553a8?w=400&auto=format&fit=crop",
  sandwich: "https://images.unsplash.com/photo-1528735602782-2552fd46c207?w=400&auto=format&fit=crop",
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

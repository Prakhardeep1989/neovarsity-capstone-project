export const PRODUCT_CATEGORIES = ["THALI", "COMBO_MEAL", "ADD_ON"];

export const PRODUCT_STATUSES = ["AVAILABLE", "INACTIVE"];

export const CATEGORY_LABELS = {
  THALI: "Thali",
  COMBO_MEAL: "Combo Meal",
  ADD_ON: "Add On",
};

export const STATUS_LABELS = {
  AVAILABLE: "Available",
  INACTIVE: "Inactive",
};

export const EMPTY_PRODUCT = {
  name: "",
  description: "",
  image: "",
  price: "",
  status: "AVAILABLE",
  category: "",
};

export const formatCategory = (category) =>
  CATEGORY_LABELS[category] || category?.replace(/_/g, " ") || "";

export const formatStatus = (status) => STATUS_LABELS[status] || status || "";

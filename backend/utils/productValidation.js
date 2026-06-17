const PRODUCT_CATEGORIES = ["THALI", "COMBO_MEAL", "ADD_ON"];
const PRODUCT_STATUSES = ["AVAILABLE", "INACTIVE"];

const validateProductInput = (body, { isUpdate = false } = {}) => {
  const errors = [];
  const data = {};

  if (!isUpdate || body.name !== undefined) {
    const name = body.name?.trim?.() ?? "";
    if (!name) errors.push("Name is required");
    else data.name = name;
  }

  if (!isUpdate || body.description !== undefined) {
    const description = body.description?.trim?.() ?? "";
    if (!description) errors.push("Description is required");
    else data.description = description;
  }

  if (!isUpdate || body.image !== undefined) {
    const image = body.image?.trim?.() ?? "";
    if (!image) errors.push("Image is required");
    else data.image = image;
  }

  if (!isUpdate || body.price !== undefined) {
    const price = Number(body.price);
    if (Number.isNaN(price) || price <= 0) {
      errors.push("Price must be a number greater than 0");
    } else {
      data.price = price;
    }
  }

  if (!isUpdate || body.category !== undefined) {
    const category = body.category;
    if (!PRODUCT_CATEGORIES.includes(category)) {
      errors.push("Category must be THALI, COMBO_MEAL, or ADD_ON");
    } else {
      data.category = category;
    }
  }

  if (body.status !== undefined) {
    if (!PRODUCT_STATUSES.includes(body.status)) {
      errors.push("Status must be AVAILABLE or INACTIVE");
    } else {
      data.status = body.status;
    }
  } else if (!isUpdate) {
    data.status = "AVAILABLE";
  }

  return { errors, data };
};

module.exports = {
  PRODUCT_CATEGORIES,
  PRODUCT_STATUSES,
  validateProductInput,
};

import React, { useEffect, useState } from "react";
import { BsCloudUpload } from "react-icons/bs";
import { ImagetoBase64 } from "../utility/ImagetoBase64";
import {
  EMPTY_PRODUCT,
  PRODUCT_CATEGORIES,
  PRODUCT_STATUSES,
  formatCategory,
  formatStatus,
} from "../utility/productConstants";

const ProductForm = ({ initialValues, onSubmit, submitLabel = "Save" }) => {
  const [data, setData] = useState({ ...EMPTY_PRODUCT, ...initialValues });

  useEffect(() => {
    setData({ ...EMPTY_PRODUCT, ...initialValues });
  }, [initialValues]);

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const uploadImage = async (e) => {
    const imageData = await ImagetoBase64(e.target.files[0]);
    setData((prev) => ({ ...prev, image: imageData }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...data,
      price: Number(data.price),
    });
  };

  return (
    <form
      className="w-full max-w-md bg-white shadow rounded-lg flex flex-col p-4 gap-1"
      onSubmit={handleSubmit}
    >
      <label htmlFor="name">Name</label>
      <input
        type="text"
        id="name"
        name="name"
        className="bg-slate-200 p-2 rounded mb-2"
        value={data.name}
        onChange={handleOnChange}
        required
      />

      <label htmlFor="description">Description</label>
      <textarea
        id="description"
        name="description"
        rows={3}
        className="bg-slate-200 p-2 rounded mb-2 resize-none"
        value={data.description}
        onChange={handleOnChange}
        required
      />

      <label htmlFor="category">Category</label>
      <select
        id="category"
        name="category"
        className="bg-slate-200 p-2 rounded mb-2"
        value={data.category}
        onChange={handleOnChange}
        required
      >
        <option value="">Select category</option>
        {PRODUCT_CATEGORIES.map((category) => (
          <option key={category} value={category}>
            {formatCategory(category)}
          </option>
        ))}
      </select>

      <label htmlFor="price">Price (₹)</label>
      <input
        type="number"
        id="price"
        name="price"
        min="1"
        step="1"
        className="bg-slate-200 p-2 rounded mb-2"
        value={data.price}
        onChange={handleOnChange}
        required
      />

      <label htmlFor="status">Status</label>
      <select
        id="status"
        name="status"
        className="bg-slate-200 p-2 rounded mb-2"
        value={data.status}
        onChange={handleOnChange}
        required
      >
        {PRODUCT_STATUSES.map((status) => (
          <option key={status} value={status}>
            {formatStatus(status)}
          </option>
        ))}
      </select>

      <label htmlFor="product-image">Image</label>
      <label
        htmlFor="product-image"
        className="h-40 w-full bg-slate-200 rounded flex items-center justify-center cursor-pointer mb-2"
      >
        {data.image ? (
          <img src={data.image} alt="Preview" className="h-full object-contain" />
        ) : (
          <span className="text-5xl text-slate-500">
            <BsCloudUpload />
          </span>
        )}
        <input
          type="file"
          accept="image/*"
          id="product-image"
          onChange={uploadImage}
          className="hidden"
        />
      </label>

      <button
        type="submit"
        className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 rounded mt-2"
      >
        {submitLabel}
      </button>
    </form>
  );
};

export default ProductForm;

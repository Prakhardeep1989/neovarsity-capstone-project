import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import ProductCard from "../component/ProductCard";
import ProductForm from "../component/ProductForm";
import Modal from "../component/Modal";
import {
  createProduct,
  deleteProduct,
  fetchProducts,
  updateProduct,
} from "../utility/productApi";
import {
  PRODUCT_CATEGORIES,
  formatCategory,
} from "../utility/productConstants";
import { setDataProduct } from "../redux/productSlide";

const MenuBrowse = () => {
  const dispatch = useDispatch();
  const productData = useSelector((state) => state.product.productList);
  const userData = useSelector((state) => state.user);
  const isAdmin = Boolean(userData.isAdmin);

  const [activeCategory, setActiveCategory] = useState("ALL");

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [confirmDelete, setConfirmDelete] = useState(null);

  const refreshProducts = async () => {
    const products = await fetchProducts(userData.token);
    dispatch(setDataProduct(products));
  };

  const filteredProducts =
    activeCategory === "ALL"
      ? productData
      : productData.filter((item) => item.category === activeCategory);

  const openCreateForm = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const openEditForm = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (formData) => {
    if (!userData.token) {
      toast("Unauthorized: admin access required");
      return;
    }

    const payload = {
      name: formData.name,
      description: formData.description,
      image: formData.image,
      price: formData.price,
      category: formData.category,
      status: formData.status,
    };

    const response = editingProduct
      ? await updateProduct(editingProduct._id, payload, userData.token)
      : await createProduct(payload, userData.token);

    toast(response.message);

    if (response.alert) {
      await refreshProducts();
      closeForm();
    }
  };

  const handleDeleteClick = (product) => {
    setConfirmDelete(product);
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    const response = await deleteProduct(confirmDelete._id, userData.token);
    toast(response.message);
    setConfirmDelete(null);
    if (response.alert) {
      await refreshProducts();
    }
  };

  return (
    <div className="p-2 md:p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Our Menu</h1>
          <p className="text-slate-600 mt-1">
            Homely meals from HOMELY Meals cloud kitchen in Chandausi.
          </p>
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={openCreateForm}
            className="bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-full self-start"
          >
            Add Product
          </button>
        )}
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
        <button
          type="button"
          onClick={() => setActiveCategory("ALL")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium ${
            activeCategory === "ALL"
              ? "bg-red-600 text-white"
              : "bg-white text-slate-700 shadow"
          }`}
        >
          All
        </button>
        {PRODUCT_CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium ${
              activeCategory === category
                ? "bg-red-600 text-white"
                : "bg-white text-slate-700 shadow"
            }`}
          >
            {formatCategory(category)}
          </button>
        ))}
      </div>

      {filteredProducts.length ? (
        <div className="flex flex-wrap justify-center md:justify-start gap-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onEdit={openEditForm}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-slate-500">
          <p className="text-lg">No menu items found in this category.</p>
          {isAdmin && (
            <button
              type="button"
              onClick={openCreateForm}
              className="mt-4 text-red-500 underline"
            >
              Add your first product
            </button>
          )}
        </div>
      )}

      {/* Product form modal (create / edit) */}
      <Modal
        isOpen={showForm}
        onClose={closeForm}
        title={editingProduct ? "Edit Product" : "Add New Product"}
        maxWidth="max-w-lg"
      >
        <ProductForm
          initialValues={editingProduct || undefined}
          onSubmit={handleSubmit}
          submitLabel={editingProduct ? "Update Product" : "Create Product"}
        />
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        title="Delete Product"
        maxWidth="max-w-sm"
      >
        <p className="text-slate-700 mb-6">
          Are you sure you want to delete{" "}
          <span className="font-semibold">"{confirmDelete?.name}"</span>? This
          action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setConfirmDelete(null)}
            className="px-4 py-2 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDeleteConfirm}
            className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white font-medium"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default MenuBrowse;

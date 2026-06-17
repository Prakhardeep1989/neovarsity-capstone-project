import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import ProductForm from "../component/ProductForm";
import { createProduct, fetchProducts } from "../utility/productApi";
import { setDataProduct } from "../redux/productSlide";

const Newproduct = () => {
  const userData = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLoggedIn = Boolean(userData.email);
  const isAdmin = Boolean(userData.isAdmin);

  const handleSubmit = async (formData) => {
    if (!isLoggedIn || !isAdmin || !userData.token) {
      toast("Unauthorized: admin access required");
      return;
    }

    const response = await createProduct(
      {
        name: formData.name,
        description: formData.description,
        image: formData.image,
        price: formData.price,
        category: formData.category,
        status: formData.status,
      },
      userData.token
    );

    toast(response.message);

    if (response.alert) {
      const products = await fetchProducts(userData.token);
      dispatch(setDataProduct(products));
      navigate("/menu");
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-600 text-lg mb-4">
          Please log in to access this page.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Go to Login
        </button>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-600 text-lg mb-4">
          You do not have permission to add products.
        </p>
        <button
          onClick={() => navigate("/")}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 flex justify-center">
      <ProductForm onSubmit={handleSubmit} submitLabel="Create Product" />
    </div>
  );
};

export default Newproduct;

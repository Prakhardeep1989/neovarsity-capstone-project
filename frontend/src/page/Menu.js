import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import AllProduct from "../component/AllProduct";
import { addCartItem } from "../redux/productSlide";
import { getProductImage } from "../utility/productImages";

const Menu = () => {
  const { filterby } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const productData = useSelector((state) => state.product.productList);

  const productDisplay = productData.find(
    (el) => String(el._id) === String(filterby)
  );

  const handleAddCartProduct = () => {
    if (productDisplay) {
      dispatch(addCartItem(productDisplay));
    }
  };

  const handleBuy = () => {
    if (productDisplay) {
      dispatch(addCartItem(productDisplay));
      navigate("/cart");
    }
  };

  if (!productData.length) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-600 text-lg">Loading menu...</p>
      </div>
    );
  }

  if (!productDisplay) {
    return (
      <div className="p-8 text-center max-w-md mx-auto">
        <p className="text-slate-600 text-lg mb-4">
          This dish was not found. It may have been removed from the menu.
        </p>
        <Link
          to="/menu"
          className="inline-block bg-red-500 hover:bg-red-600 text-white font-medium px-6 py-2 rounded-full"
        >
          Browse Full Menu
        </Link>
      </div>
    );
  }

  const imageSrc = getProductImage(productDisplay.image, productDisplay.category);

  return (
    <div>
      <div className="p-2 md:p-4">
        <div className="w-full max-w-4xl m-auto md:flex bg-white rounded-lg shadow">
          <div className="max-w-sm overflow-hidden w-full p-5">
            <img
              src={imageSrc}
              alt={productDisplay.name}
              className="hover:scale-105 transition-all h-full w-full object-cover rounded"
              onError={(e) => {
                e.target.src = getProductImage("", productDisplay.category);
              }}
            />
          </div>

          <div className="flex flex-col gap-1 p-4">
            <h3 className="font-semibold text-slate-600 capitalize text-2xl md:text-4xl">
              {productDisplay.name}
            </h3>
            <p className="text-slate-500 font-medium text-2xl capitalize">
              {productDisplay.category}
            </p>
            <p className="font-bold md:text-2xl">
              <span className="text-red-500">₹</span>
              <span>{productDisplay.price}</span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleBuy}
                className="bg-yellow-500 py-1 mt-2 rounded hover:bg-yellow-600 min-w-[100px]"
              >
                Buy
              </button>
              <button
                onClick={handleAddCartProduct}
                className="bg-yellow-500 py-1 mt-2 rounded hover:bg-yellow-600 min-w-[100px]"
              >
                Add Cart
              </button>
            </div>
            <div>
              <p className="text-slate-600 font-medium">Description:</p>
              <p>{productDisplay.description || "Homely meal prepared fresh for you."}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="p-2 md:p-4">
        <AllProduct heading={"Related Products"} />
      </div>
    </div>
  );
};

export default Menu;

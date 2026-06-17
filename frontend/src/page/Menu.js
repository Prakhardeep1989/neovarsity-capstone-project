import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import AllProduct from "../component/AllProduct";
import { addCartItem } from "../redux/productSlide";
import { getProductImage } from "../utility/productImages";
import { formatCategory, formatStatus } from "../utility/productConstants";

const Menu = () => {
  const { filterby } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const productData = useSelector((state) => state.product.productList);
  const isAdmin = useSelector((state) => state.user.isAdmin);

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
  const isAvailable = productDisplay.status === "AVAILABLE";

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
            <h3 className="font-semibold text-slate-600 text-2xl md:text-4xl">
              {productDisplay.name}
            </h3>
            <div className="flex flex-wrap gap-2 mt-1">
              <span className="text-sm px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                {formatCategory(productDisplay.category)}
              </span>
              {isAdmin && (
                <span
                  className={`text-sm px-2 py-0.5 rounded-full ${
                    isAvailable
                      ? "bg-green-600 text-white"
                      : "bg-orange-500 text-white"
                  }`}
                >
                  {formatStatus(productDisplay.status)}
                </span>
              )}
            </div>
            <p className="font-bold md:text-2xl">
              <span className="text-red-500">₹</span>
              <span>{productDisplay.price}</span>
            </p>
            <div className="flex gap-3">
              {!isAdmin && isAvailable && (
                <>
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
                </>
              )}
            </div>
            <div>
              <p className="text-slate-600 font-medium">Description:</p>
              <p>{productDisplay.description}</p>
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

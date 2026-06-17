import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { addCartItem } from "../redux/productSlide";
import { getProductImage } from "../utility/productImages";
import { formatCategory, formatStatus } from "../utility/productConstants";

const CardFeature = ({
  image,
  name,
  price,
  category,
  status = "AVAILABLE",
  loading,
  id,
}) => {
  const dispatch = useDispatch();
  const isAdmin = useSelector((state) => state.user.isAdmin);
  const imageSrc = getProductImage(image, category);
  const isAvailable = status === "AVAILABLE";

  const handleAddCartProduct = () => {
    dispatch(
      addCartItem({
        _id: id,
        name,
        price,
        category,
        image,
      })
    );
  };

  return (
    <div className="w-full min-w-[200px] max-w-[200px] bg-white hover:shadow-lg drop-shadow-lg py-5 px-4 flex flex-col">
      {name ? (
        <>
          <Link
            to={`/menu/${id}`}
            onClick={() => window.scrollTo({ top: "0", behavior: "smooth" })}
          >
            <div className="relative h-28 flex flex-col justify-center items-center">
              <img
                src={imageSrc}
                alt={name}
                className="h-full object-cover"
                onError={(e) => {
                  e.target.src = getProductImage("", category);
                }}
              />
              {isAdmin && (
                <div className="absolute top-0 left-0 flex flex-wrap gap-1 p-1">
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-white">
                    {formatCategory(category)}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      isAvailable ? "bg-green-600 text-white" : "bg-orange-500 text-white"
                    }`}
                  >
                    {formatStatus(status)}
                  </span>
                </div>
              )}
            </div>
            <h3 className="font-semibold text-slate-600 text-lg mt-4 whitespace-nowrap overflow-hidden">
              {name}
            </h3>
            <p className="text-slate-500 font-medium">{formatCategory(category)}</p>
            <p className="font-bold">
              <span className="text-red-500">₹</span>
              <span>{price}</span>
            </p>
          </Link>
          {!isAdmin && isAvailable && (
            <button
              className="bg-yellow-500 py-1 mt-2 rounded hover:bg-yellow-600 w-full"
              onClick={handleAddCartProduct}
            >
              Add Cart
            </button>
          )}
        </>
      ) : (
        <div className="min-h-[150px] flex justify-center items-center">
          <p>{loading}</p>
        </div>
      )}
    </div>
  );
};

export default CardFeature;

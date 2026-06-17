import React from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addCartItem } from "../redux/productSlide";
import { getProductImage } from "../utility/productImages";
import { formatCategory, formatStatus } from "../utility/productConstants";
import FoodImage from "./FoodImage";

const ProductCard = ({ product, onEdit, onDelete }) => {
  const dispatch = useDispatch();
  const isAdmin = useSelector((state) => state.user.isAdmin);
  const { _id, name, description, image, price, category, status } = product;
  const imageSrc = getProductImage(image, category);
  const isAvailable = status === "AVAILABLE";

  const handleAddCart = (e) => {
    e.preventDefault();
    dispatch(
      addCartItem({
        _id,
        name,
        price,
        category,
        image,
      })
    );
  };

  return (
    <div className="w-full max-w-[260px] bg-white rounded-lg shadow hover:shadow-lg flex flex-col overflow-hidden">
      <Link
        to={`/menu/${_id}`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="flex flex-col flex-1"
      >
        <div className="relative h-36 bg-orange-50 overflow-hidden rounded-t-lg">
          <FoodImage
            src={imageSrc}
            alt={name}
            className="h-full w-full object-cover"
            rounded="rounded-t-lg"
            fallbackSrc={getProductImage("", category)}
          />
          {isAdmin && (
            <div className="absolute top-2 left-2 flex flex-wrap gap-1">
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-white">
                {formatCategory(category)}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  isAvailable
                    ? "bg-green-600 text-white"
                    : "bg-orange-500 text-white"
                }`}
              >
                {formatStatus(status)}
              </span>
            </div>
          )}
        </div>
        <div className="p-3 flex flex-col flex-1">
          <h3 className="font-semibold text-slate-800 text-lg">{name}</h3>
          <p className="text-sm text-slate-500 line-clamp-2 mt-1">{description}</p>
          <p className="font-bold mt-2">
            <span className="text-red-500">₹</span>
            {price}
          </p>
        </div>
      </Link>

      <div className="px-3 pb-3 flex gap-2">
        {!isAdmin && isAvailable && (
          <button
            type="button"
            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-sm font-medium py-1.5 rounded"
            onClick={handleAddCart}
          >
            Add Cart
          </button>
        )}
        {isAdmin && (
          <>
            <button
              type="button"
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm py-1.5 rounded"
              onClick={() => onEdit(product)}
            >
              Edit
            </button>
            <button
              type="button"
              className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm py-1.5 rounded"
              onClick={() => onDelete(product)}
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductCard;

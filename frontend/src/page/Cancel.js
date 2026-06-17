import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

const Cancel = () => {
  const isAdmin = useSelector((state) => state.user.isAdmin);

  return (
    <div className="p-4 md:p-8 max-w-lg mx-auto text-center">
      <div className="bg-red-100 border border-red-300 rounded-lg p-8 shadow">
        <p className="text-5xl mb-4">✕</p>
        <h1 className="text-2xl font-bold text-red-800 mb-2">
          Payment Cancelled
        </h1>
        <p className="text-slate-600 mb-6">
          {isAdmin
            ? "Your payment was not completed."
            : "Your payment was not completed. Your cart items are still saved."}
        </p>
        <Link
          to={isAdmin ? "/" : "/cart"}
          className="inline-block bg-red-500 hover:bg-red-600 text-white font-medium px-6 py-2 rounded-full"
        >
          {isAdmin ? "Go Home" : "Return to Cart"}
        </Link>
      </div>
    </div>
  );
};

export default Cancel;

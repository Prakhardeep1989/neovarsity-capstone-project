import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearCart } from "../redux/productSlide";
import PageLayout from "../component/PageLayout";

const PaymentSuccess = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(clearCart());
  }, [dispatch]);

  return (
    <PageLayout centered contentClassName="max-w-lg">
      <div className="w-full bg-green-100 border border-green-300 rounded-lg p-8 shadow text-center">
        <p className="text-5xl mb-4">✓</p>
        <h1 className="text-2xl font-bold text-green-800 mb-2">
          Payment Successful!
        </h1>
        <p className="text-slate-600 mb-2">
          Thank you for ordering from HOMELY Meals.
        </p>
        <p className="text-slate-500 text-sm mb-6">
          Your order has been confirmed. A receipt email will arrive shortly.
          Check the <strong>Orders</strong> tab for status updates.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/orders"
            className="inline-block bg-red-500 hover:bg-red-600 text-white font-medium px-6 py-2 rounded-full"
          >
            View My Orders
          </Link>
          <Link
            to="/"
            className="inline-block bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium px-6 py-2 rounded-full"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </PageLayout>
  );
};

export default PaymentSuccess;

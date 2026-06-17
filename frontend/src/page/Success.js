import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { clearCart } from "../redux/productSlide";
import { toast } from "react-hot-toast";

const Success = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const cartItems = useSelector((state) => state.product.cartItem);
  const orderSaved = useRef(false);

  useEffect(() => {
    const saveOrder = async () => {
      if (orderSaved.current || cartItems.length === 0) return;
      orderSaved.current = true;

      const totalPrice = cartItems.reduce(
        (acc, curr) => acc + parseInt(curr.total),
        0
      );
      const totalQty = cartItems.reduce(
        (acc, curr) => acc + parseInt(curr.qty),
        0
      );

      try {
        await fetch(`${process.env.REACT_APP_SERVER_DOMIN}/save-order`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            userEmail: user.email,
            userName: `${user.firstName} ${user.lastName}`.trim(),
            items: cartItems,
            totalQty,
            totalPrice,
          }),
        });
        dispatch(clearCart());
      } catch {
        toast("Order placed but failed to save record");
        dispatch(clearCart());
      }
    };

    saveOrder();
  }, [cartItems, dispatch, user]);

  return (
    <div className="p-4 md:p-8 max-w-lg mx-auto text-center">
      <div className="bg-green-100 border border-green-300 rounded-lg p-8 shadow">
        <p className="text-5xl mb-4">✓</p>
        <h1 className="text-2xl font-bold text-green-800 mb-2">
          Payment Successful!
        </h1>
        <p className="text-slate-600 mb-6">
          Thank you for ordering from HOMELY Meals. Your homely meal is on its
          way!
        </p>
        <Link
          to="/"
          className="inline-block bg-red-500 hover:bg-red-600 text-white font-medium px-6 py-2 rounded-full"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default Success;

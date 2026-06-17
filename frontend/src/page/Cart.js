import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import CartProduct from "../component/cartProduct";
import emptyCartImage from "../assest/empty.gif";
import { toast } from "react-hot-toast";
import { loadStripe } from "@stripe/stripe-js";
import { useNavigate } from "react-router-dom";

const PHONE_REGEX = /^[6-9]\d{9}$/;

const Cart = () => {
  const productCartItem = useSelector((state) => state.product.cartItem);
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();

  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [touched, setTouched] = useState({ address: false, contact: false });

  useEffect(() => {
    if (user.isAdmin) {
      navigate("/", { replace: true });
    }
  }, [user.isAdmin, navigate]);

  if (user.isAdmin) {
    return null;
  }

  const totalPrice = productCartItem.reduce(
    (acc, curr) => acc + parseInt(curr.total),
    0
  );
  const totalQty = productCartItem.reduce(
    (acc, curr) => acc + parseInt(curr.qty),
    0
  );

  const isAddressValid = deliveryAddress.trim().length >= 10;
  const isContactValid = PHONE_REGEX.test(contactNumber.trim());
  const canPay = isAddressValid && isContactValid;

  const addressError =
    touched.address && !isAddressValid
      ? "Please enter a valid delivery address (at least 10 characters)."
      : "";

  const contactError =
    touched.contact && !isContactValid
      ? "Please enter a valid 10-digit Indian mobile number."
      : "";

  const handlePayment = async () => {
    setTouched({ address: true, contact: true });

    if (!canPay) return;

    if (!user.email) {
      toast("You are not logged in!");
      setTimeout(() => navigate("/login"), 1000);
      return;
    }

    const stripePromise = await loadStripe(
      process.env.REACT_APP_STRIPE_PUBLIC_KEY
    );
    const res = await fetch(
      `${process.env.REACT_APP_SERVER_DOMIN}/create-checkout-session`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(productCartItem),
      }
    );
    if (res.statusCode === 500) return;

    const data = await res.json();
    toast("Redirecting to payment gateway…");
    stripePromise.redirectToCheckout({ sessionId: data });
  };

  return (
    <div className="p-2 md:p-4">
      <h2 className="text-lg md:text-2xl font-bold text-slate-600 mb-4">
        Your Cart Items
      </h2>

      {productCartItem[0] ? (
        <div className="my-4 flex flex-col lg:flex-row gap-4">
          {/* Cart items */}
          <div className="w-full max-w-3xl flex flex-col gap-3">
            {productCartItem.map((el) => (
              <CartProduct
                key={el._id}
                id={el._id}
                name={el.name}
                image={el.image}
                category={el.category}
                qty={el.qty}
                total={el.total}
                price={el.price}
              />
            ))}
          </div>

          {/* Sidebar */}
          <div className="w-full lg:max-w-md ml-auto flex flex-col gap-4">
            {/* Delivery details */}
            <div className="bg-white rounded-lg shadow p-4 flex flex-col gap-3">
              <h3 className="text-lg font-semibold text-slate-700">
                Delivery Details
              </h3>

              <div>
                <label
                  htmlFor="deliveryAddress"
                  className="block text-sm font-medium text-slate-600 mb-1"
                >
                  Delivery Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="deliveryAddress"
                  rows={3}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, address: true }))
                  }
                  placeholder="House no., street, area, city, PIN code…"
                  className={`w-full bg-slate-100 rounded px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 ${
                    addressError
                      ? "ring-2 ring-red-400"
                      : "focus:ring-blue-300"
                  }`}
                />
                {addressError && (
                  <p className="text-red-500 text-xs mt-1">{addressError}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="contactNumber"
                  className="block text-sm font-medium text-slate-600 mb-1"
                >
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <input
                  id="contactNumber"
                  type="tel"
                  maxLength={10}
                  value={contactNumber}
                  onChange={(e) =>
                    setContactNumber(e.target.value.replace(/\D/g, ""))
                  }
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, contact: true }))
                  }
                  placeholder="10-digit mobile number"
                  className={`w-full bg-slate-100 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                    contactError
                      ? "ring-2 ring-red-400"
                      : "focus:ring-blue-300"
                  }`}
                />
                {contactError && (
                  <p className="text-red-500 text-xs mt-1">{contactError}</p>
                )}
              </div>
            </div>

            {/* Order summary */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <h2 className="bg-blue-500 text-white p-3 text-lg font-semibold">
                Summary
              </h2>
              <div className="p-3 flex flex-col gap-2">
                <div className="flex w-full py-2 text-base border-b">
                  <p>Total Qty</p>
                  <p className="ml-auto font-bold">{totalQty}</p>
                </div>
                <div className="flex w-full py-2 text-base border-b">
                  <p>Total Price</p>
                  <p className="ml-auto font-bold">
                    <span className="text-red-500">₹</span> {totalPrice}
                  </p>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={!canPay}
                  className={`w-full text-lg font-bold py-2 mt-2 rounded transition-colors ${
                    canPay
                      ? "bg-red-500 hover:bg-red-600 text-white cursor-pointer"
                      : "bg-slate-300 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  Pay Now
                </button>
                {!canPay && (
                  <p className="text-xs text-slate-500 text-center">
                    Fill in delivery address and contact number to proceed.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex w-full justify-center items-center flex-col py-10">
          <img src={emptyCartImage} alt="Empty cart" className="w-full max-w-sm" />
          <p className="text-slate-500 text-3xl font-bold">Empty Cart</p>
        </div>
      )}
    </div>
  );
};

export default Cart;

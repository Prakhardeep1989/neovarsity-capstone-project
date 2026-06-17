import React from "react";
import { Link } from "react-router-dom";
import { BUSINESS_INFO } from "../utility/businessInfo";

const About = () => {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
        About HOMELY Meals
      </h1>
      <p className="text-red-600 font-medium mb-6">
        A cloud kitchen serving fresh, homely food in {BUSINESS_INFO.city}
      </p>

      <div className="bg-white rounded-lg shadow p-6 mb-6 space-y-4">
        <h2 className="text-xl font-semibold text-slate-700">Our Story</h2>
        <p className="text-slate-600 leading-relaxed">
          HOMELY Meals is a cloud kitchen based in {BUSINESS_INFO.fullAddress}.
          We believe everyone deserves the comfort of home-cooked food — without
          the hassle of cooking. From fresh vegetables and wholesome rice dishes
          to dosas, paneer curries, and more, our menu is crafted to bring
          authentic homely flavours straight to your doorstep across{" "}
          {BUSINESS_INFO.deliveryArea.toLowerCase()}.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-5 text-center">
          <p className="text-3xl font-bold text-red-500">100%</p>
          <p className="text-slate-600 mt-1">Fresh Ingredients</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5 text-center">
          <p className="text-3xl font-bold text-red-500">Fast</p>
          <p className="text-slate-600 mt-1">Home Delivery</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5 text-center">
          <p className="text-3xl font-bold text-red-500">Secure</p>
          <p className="text-slate-600 mt-1">Online Payments</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-slate-700 mb-3">
          How It Works
        </h2>
        <ol className="list-decimal list-inside space-y-2 text-slate-600">
          <li>Browse our menu and filter by category</li>
          <li>Add items to your cart and adjust quantities</li>
          <li>Sign in and pay securely via Razorpay</li>
          <li>Enjoy fresh homely meals delivered to your home</li>
        </ol>
      </div>

      <div className="text-center">
        <Link
          to="/"
          className="inline-block bg-red-500 hover:bg-red-600 text-white font-medium px-6 py-2 rounded-full"
        >
          Browse Menu
        </Link>
      </div>
    </div>
  );
};

export default About;

import React from "react";
import AllProduct from "../component/AllProduct";

const MenuBrowse = () => {
  return (
    <div className="p-2 md:p-4">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Our Menu</h1>
      <p className="text-slate-600 mb-4">
        Browse homely meals from HOMELY Meals cloud kitchen. Click any dish for
        details.
      </p>
      <AllProduct heading={"All Dishes"} />
    </div>
  );
};

export default MenuBrowse;

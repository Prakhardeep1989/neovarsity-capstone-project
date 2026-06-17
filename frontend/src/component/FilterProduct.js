import React from "react";
import { CiForkAndKnife } from "react-icons/ci";

const FilterProduct = ({ label, onClick, isActive }) => {
  return (
    <div onClick={onClick} className="cursor-pointer shrink-0">
      <div
        className={`text-3xl p-5 rounded-full ${
          isActive ? "bg-red-600 text-white" : "bg-yellow-500"
        }`}
      >
        <CiForkAndKnife />
      </div>
      <p className="text-center font-medium my-1 text-sm">{label}</p>
    </div>
  );
};

export default FilterProduct;

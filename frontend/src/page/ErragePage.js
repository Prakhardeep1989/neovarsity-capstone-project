import React from "react";
import { ERROR_404_IMAGE } from "../utility/productImages";
import { Link } from "react-router-dom";
import PageLayout from "../component/PageLayout";
import FoodImage from "../component/FoodImage";

const ErragePage = () => {
  return (
    <PageLayout centered>
      <div className="flex flex-col items-center gap-6">
        <FoodImage
          src={ERROR_404_IMAGE}
          alt="Page not found"
          className="max-w-xl w-full h-72 md:h-96 object-cover"
          rounded="rounded-2xl"
        />
        <Link
          to="/"
          className="inline-flex items-center justify-center min-w-[100px] h-10 bg-red-500 hover:bg-red-600 text-white text-lg font-medium rounded-full px-6"
        >
          Back
        </Link>
      </div>
    </PageLayout>
  );
};

export default ErragePage;

import React from "react";
import { ERROR_404_IMAGE } from "../utility/productImages";
import { Link } from "react-router-dom";
import PageLayout from "../component/PageLayout";

const ErragePage = () => {
  return (
    <PageLayout centered>
      <div className="flex flex-col items-center gap-6">
        <img
          src={ERROR_404_IMAGE}
          alt="404"
          className="max-w-xl w-full rounded-lg shadow-xl"
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

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import CardFeature from "./CardFeature";
import FilterProduct from "./FilterProduct";
import { PRODUCT_CATEGORIES, formatCategory } from "../utility/productConstants";

const AllProduct = ({ heading }) => {
  const productData = useSelector((state) => state.product.productList);
  const [filterby, setFilterBy] = useState("ALL");
  const [dataFilter, setDataFilter] = useState([]);

  useEffect(() => {
    setDataFilter(productData);
    setFilterBy("ALL");
  }, [productData]);

  const handleFilterProduct = (category) => {
    setFilterBy(category);
    if (category === "ALL") {
      setDataFilter(productData);
      return;
    }
    setDataFilter(productData.filter((el) => el.category === category));
  };

  const loadingArrayFeature = new Array(6).fill(null);

  return (
    <div className="my-5">
      <h2 className="font-bold text-2xl text-slate-800 mb-4">{heading}</h2>

      <div className="flex gap-4 justify-center overflow-scroll scrollbar-none">
        {productData.length ? (
          <>
            <FilterProduct
              category="ALL"
              label="All"
              isActive={filterby === "ALL"}
              onClick={() => handleFilterProduct("ALL")}
            />
            {PRODUCT_CATEGORIES.map((category) => (
              <FilterProduct
                category={category}
                label={formatCategory(category)}
                key={category}
                isActive={filterby === category}
                onClick={() => handleFilterProduct(category)}
              />
            ))}
          </>
        ) : (
          <div className="min-h-[150px] flex justify-center items-center">
            <p>Loading...</p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-4 my-4">
        {dataFilter.length
          ? dataFilter.map((el) => (
              <CardFeature
                key={el._id}
                id={el._id}
                image={el.image}
                name={el.name}
                category={el.category}
                price={el.price}
                status={el.status}
              />
            ))
          : loadingArrayFeature.map((el, index) => (
              <CardFeature loading="Loading..." key={index + "allProduct"} />
            ))}
      </div>
    </div>
  );
};

export default AllProduct;

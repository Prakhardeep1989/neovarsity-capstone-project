import React, { useEffect, useState } from "react";
import { DEFAULT_FOOD_IMAGE } from "../utility/productImages";

const FoodImage = ({
  src,
  alt,
  className = "w-full h-full object-cover rounded-xl",
  rounded = "rounded-xl",
  lazy = true,
  priority = false,
  overlay = false,
  fallbackSrc = DEFAULT_FOOD_IMAGE,
  showPlaceholderOnError = true,
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setFailed(false);
  }, [src]);

  const handleError = () => {
    if (!failed && fallbackSrc && imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
      return;
    }
    setFailed(true);
  };

  if (failed && showPlaceholderOnError) {
    return (
      <div
        className={`${className} ${rounded} bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center`}
        aria-label={alt}
      >
        <span className="text-amber-800/60 text-sm font-medium px-4 text-center">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${rounded}`}>
      <img
        src={imgSrc}
        alt={alt}
        className={`${className} ${rounded}`}
        loading={priority ? "eager" : lazy ? "lazy" : undefined}
        decoding="async"
        onError={handleError}
      />
      {overlay && (
        <div
          className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-stone-900/20 to-transparent"
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default FoodImage;

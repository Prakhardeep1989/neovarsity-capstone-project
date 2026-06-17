import React, { useRef, useState, useEffect } from "react";
import { GrPrevious, GrNext } from "react-icons/gr";
import {
  FaUtensils,
  FaUserTie,
  FaLeaf,
  FaMotorcycle,
  FaCreditCard,
  FaRupeeSign,
} from "react-icons/fa";
import FoodImage from "./FoodImage";

const ICON_MAP = {
  kitchen: FaUtensils,
  chef: FaUserTie,
  vegetables: FaLeaf,
  delivery: FaMotorcycle,
  payment: FaCreditCard,
  price: FaRupeeSign,
};

const HighlightCarousel = ({ items }) => {
  const trackRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollToIndex = (index) => {
    const track = trackRef.current;
    if (!track || !track.children[index]) return;
    const card = track.children[index];
    track.scrollTo({ left: card.offsetLeft, behavior: "smooth" });
    setActiveIndex(index);
  };

  const handlePrev = () => {
    const next = activeIndex <= 0 ? items.length - 1 : activeIndex - 1;
    scrollToIndex(next);
  };

  const handleNext = () => {
    const next = activeIndex >= items.length - 1 ? 0 : activeIndex + 1;
    scrollToIndex(next);
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const onScroll = () => {
      const cards = Array.from(track.children);
      const scrollLeft = track.scrollLeft;
      let closest = 0;
      let minDist = Infinity;
      cards.forEach((card, i) => {
        const dist = Math.abs(card.offsetLeft - scrollLeft);
        if (dist < minDist) {
          minDist = dist;
          closest = i;
        }
      });
      setActiveIndex(closest);
    };

    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, [items.length]);

  return (
    <section className="py-6 md:py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-stone-800">
          Why Choose HOMELY Meals
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous highlight"
            className="bg-stone-200 hover:bg-stone-300 text-stone-700 p-2 rounded-full transition-colors"
          >
            <GrPrevious />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next highlight"
            className="bg-stone-200 hover:bg-stone-300 text-stone-700 p-2 rounded-full transition-colors"
          >
            <GrNext />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        className="flex gap-4 md:gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none pb-2"
      >
        {items.map((item) => {
          const Icon = ICON_MAP[item.icon] || FaUtensils;
          return (
            <article
              key={item.title}
              className="snap-start shrink-0 w-[85%] sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-1rem)] bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden"
            >
              <FoodImage
                src={item.image}
                alt={item.title}
                className="w-full h-40 md:h-44 object-cover"
                rounded="rounded-t-2xl"
                fallbackSrc=""
                showPlaceholderOnError
              />
              <div className="p-4 md:p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-700">
                    <Icon size={14} />
                  </span>
                  <h3 className="font-semibold text-stone-800">{item.title}</h3>
                </div>
                <p className="text-sm text-stone-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </article>
          );
        })}
      </div>

      <div className="flex justify-center gap-2 mt-5">
        {items.map((item, index) => (
          <button
            key={item.title}
            type="button"
            aria-label={`Go to ${item.title}`}
            onClick={() => scrollToIndex(index)}
            className={`h-2 rounded-full transition-all ${
              index === activeIndex
                ? "w-6 bg-orange-600"
                : "w-2 bg-stone-300 hover:bg-stone-400"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HighlightCarousel;

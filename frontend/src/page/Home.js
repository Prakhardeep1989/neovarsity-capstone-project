import React from "react";
import { Link } from "react-router-dom";
import HighlightCarousel from "../component/HighlightCarousel";
import PageLayout from "../component/PageLayout";
import FoodImage from "../component/FoodImage";
import { LANDING_HIGHLIGHTS, LANDING_IMAGES } from "../utility/landingImages";
import { BUSINESS_INFO } from "../utility/businessInfo";
import { FaBookOpen, FaShoppingBag, FaSmile, FaMotorcycle, FaClock } from "react-icons/fa";

const HOW_IT_WORKS = [
  {
    step: 1,
    title: "Browse Menu",
    description: "Explore our simple menu of thalis, combos, and add-ons.",
    icon: FaBookOpen,
  },
  {
    step: 2,
    title: "Place Order",
    description: "Add items to cart and checkout with secure digital payment.",
    icon: FaShoppingBag,
  },
  {
    step: 3,
    title: "Enjoy Fresh Food",
    description: "Receive hygienic, home-style meals delivered to your door.",
    icon: FaSmile,
  },
];

const Home = () => {
  return (
    <PageLayout className="bg-gradient-to-b from-orange-50 via-stone-50 to-white">
        {/* Hero */}
        <section className="mb-8 md:mb-10">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            <div className="w-full lg:w-1/2 text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-stone-900 leading-tight">
                HOMELY Meals
              </h1>
              <p className="mt-3 text-lg md:text-xl text-orange-700 font-medium">
                Ghar Jaisa Khana
              </p>
              <p className="mt-4 text-base md:text-lg text-stone-600 max-w-xl mx-auto lg:mx-0">
                Fresh, hygienic, home-style meals delivered to your doorstep.
              </p>
              <p className="mt-3 inline-flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1 mx-auto lg:mx-0">
                <span className="font-medium">{BUSINESS_INFO.fssaiLabel}</span>
              </p>
              <p className="mt-3 text-xs text-stone-500 max-w-xl mx-auto lg:mx-0">
                A digital service of {BUSINESS_INFO.parentCompany.name}, our parent
                company.
              </p>
              <div className="mt-3 flex flex-col items-center lg:items-start gap-1 text-sm">
                <p className="flex items-center gap-2 text-stone-700 font-semibold">
                  <FaClock className="text-orange-600 shrink-0" />
                  {BUSINESS_INFO.hoursSummary}
                </p>
                <p className="text-stone-500 font-medium pl-6 lg:pl-0 lg:ml-6">
                  {BUSINESS_INFO.closedDay}
                </p>
              </div>
              <div className="mt-8 lg:mt-10">
                <Link
                  to="/menu"
                  className="inline-block font-semibold bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg shadow-sm transition-colors"
                >
                  Order Now
                </Link>
              </div>
            </div>
            <div className="w-full lg:w-1/2">
              <FoodImage
                src={LANDING_IMAGES.hero}
                alt="Fresh home-style Indian thali meal"
                className="w-full h-64 md:h-80 lg:h-96 object-cover"
                rounded="rounded-2xl"
                priority
                lazy={false}
              />
            </div>
          </div>
        </section>

        {/* Free delivery banner */}
        <section className="mb-8 md:mb-10">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 px-6 py-5 md:px-8 md:py-6 shadow-lg">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
            <div className="absolute -left-4 -bottom-8 h-20 w-20 rounded-full bg-white/10" />
            <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3 text-white">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                  <FaMotorcycle size={22} />
                </span>
                <div>
                  <p className="text-xl md:text-2xl font-bold tracking-tight">
                    {BUSINESS_INFO.freeDeliveryLabel}
                  </p>
                  <p className="text-sm md:text-base text-orange-50 font-medium">
                    On every order within our delivery area
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-1 rounded-lg bg-white/15 px-4 py-2 text-white self-start sm:self-center">
                <div className="flex items-center gap-2">
                  <FaClock size={16} />
                  <span className="text-sm md:text-base font-bold">
                    {BUSINESS_INFO.hoursSummary}
                  </span>
                </div>
                <span className="text-xs md:text-sm font-semibold text-orange-100 pl-6">
                  {BUSINESS_INFO.closedDay}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Highlights carousel */}
        <HighlightCarousel items={LANDING_HIGHLIGHTS} />

        {/* How it works */}
        <section className="pt-6 md:pt-8">
          <h2 className="text-2xl md:text-3xl font-bold text-stone-800 text-center mb-8 md:mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {HOW_IT_WORKS.map(({ step, title, description, icon: Icon }) => (
              <div
                key={step}
                className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 text-center"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-lg font-bold">
                  {step}
                </div>
                <Icon className="mx-auto text-orange-600 mb-3" size={28} />
                <h3 className="font-semibold text-stone-800 text-lg mb-2">
                  {title}
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>
    </PageLayout>
  );
};

export default Home;

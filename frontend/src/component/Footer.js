import React from "react";
import { FaFacebookF, FaTwitter, FaYoutube, FaInstagram } from "react-icons/fa";
import { Link } from "react-router-dom";
import Wrapper from "./Wrapper";
import { BUSINESS_INFO } from "../utility/businessInfo";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-red-800 via-yellow-600 to-yellow-500 text-white pt-14 pb-3">
      <Wrapper className="flex justify-between flex-col md:flex-row gap-[50px] md:gap-0">
        <div className="flex gap-[50px] md:gap-[75px] lg:gap-[100px] flex-col md:flex-row">
          <div className="flex flex-col gap-3 shrink-0">
            <div className="font-oswald font-medium uppercase text-sm">
              HOMELY Meals
            </div>
            <div className="font-oswald font-medium uppercase text-sm">
              {BUSINESS_INFO.address}
            </div>
            <div className="font-oswald font-medium uppercase text-sm">
              PIN {BUSINESS_INFO.pin}
            </div>
            <div className="font-oswald font-medium uppercase text-sm">
              PH {BUSINESS_INFO.phone}
            </div>
            <div className="text-sm text-white/80">
              {BUSINESS_INFO.hours}
            </div>
            <div className="text-sm text-white/80">
              Delivery: {BUSINESS_INFO.deliveryArea}
            </div>
          </div>

          <div className="flex gap-[50px] md:gap-[75px] lg:gap-[100px] shrink-0">
            <div className="flex flex-col gap-3">
              <div className="font-oswald font-medium uppercase text-sm">
                Quick Links
              </div>
              <Link
                to="/"
                className="text-sm text-white/[0.5] hover:text-white"
              >
                Home
              </Link>
              <Link
                to="/about"
                className="text-sm text-white/[0.5] hover:text-white"
              >
                About Us
              </Link>
              <Link
                to="/contact"
                className="text-sm text-white/[0.5] hover:text-white"
              >
                Contact
              </Link>
              <Link
                to="/cart"
                className="text-sm text-white/[0.5] hover:text-white"
              >
                Your Cart
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              <div className="font-oswald font-medium uppercase text-sm">
                Services
              </div>
              <div className="text-sm text-white/[0.5]">Cloud Kitchen</div>
              <div className="text-sm text-white/[0.5]">Home Delivery</div>
              <div className="text-sm text-white/[0.5]">Online Ordering</div>
              <div className="text-sm text-white/[0.5]">Secure Payments</div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-center md:justify-start">
          <div
            onClick={() => window.open("https://facebook.com", "_blank")}
            className="w-10 h-10 rounded-full bg-white/[0.25] flex items-center justify-center bg-gradient-to-r from-red-800 to-yellow-500 hover:via-yellow-600 cursor-pointer"
          >
            <FaFacebookF size={20} />
          </div>
          <div
            onClick={() => window.open("https://twitter.com", "_blank")}
            className="w-10 h-10 rounded-full bg-white/[0.25] flex items-center justify-center bg-gradient-to-r from-red-800 to-yellow-500 hover:via-yellow-600 cursor-pointer"
          >
            <FaTwitter size={20} />
          </div>
          <div className="w-10 h-10 rounded-full bg-white/[0.25] flex items-center justify-center bg-gradient-to-r from-red-800 to-yellow-500 hover:via-yellow-600 cursor-pointer">
            <FaYoutube size={20} />
          </div>
          <div className="w-10 h-10 rounded-full bg-white/[0.25] flex items-center justify-center bg-gradient-to-r from-red-800 to-yellow-500 hover:via-yellow-600 cursor-pointer">
            <FaInstagram size={20} />
          </div>
        </div>
      </Wrapper>
      <Wrapper className="flex justify-between mt-10 flex-col md:flex-row gap-[10px] md:gap-0">
        <div className="text-[12px] text-white/[0.5] text-center md:text-left">
          © {new Date().getFullYear()} HOMELY Meals. All Rights Reserved
        </div>
        <div className="flex gap-2 md:gap-5 text-center md:text-left flex-wrap justify-center">
          <div className="text-[12px] text-white/[0.5] hover:text-white cursor-pointer">
            Privacy Policy
          </div>
          <div className="text-[12px] text-white/[0.5] hover:text-white cursor-pointer">
            Terms of Use
          </div>
        </div>
      </Wrapper>
    </footer>
  );
};

export default Footer;

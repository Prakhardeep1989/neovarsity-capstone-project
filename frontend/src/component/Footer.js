import React from "react";
import { FaFacebookF, FaInstagram, FaYoutube, FaCertificate, FaClock } from "react-icons/fa";
import Wrapper from "./Wrapper";
import { BUSINESS_INFO, SOCIAL_LINKS } from "../utility/businessInfo";

const HOMELY_LOGO = `${process.env.PUBLIC_URL || ""}/assets/homely-logo.png`;

const socialItems = [
  { label: "Facebook", href: SOCIAL_LINKS.facebook, icon: FaFacebookF },
  { label: "Instagram", href: SOCIAL_LINKS.instagram, icon: FaInstagram },
  { label: "YouTube", href: SOCIAL_LINKS.youtube, icon: FaYoutube },
];

const Footer = () => {
  const { parentCompany, fssaiLabel, name, tagline, hoursSummary, closedDay } =
    BUSINESS_INFO;

  return (
    <footer className="bg-stone-950 text-stone-300">
      <Wrapper className="py-5 md:py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 md:gap-8">
          <div className="flex items-center gap-3 md:gap-4 min-w-0">
            <img
              src={HOMELY_LOGO}
              alt={`${parentCompany.name} — ${parentCompany.tagline}`}
              className="h-16 md:h-[4.5rem] w-auto shrink-0 object-contain rounded-lg"
              loading="lazy"
              decoding="async"
            />
            <div className="text-left min-w-0">
              <p className="text-white font-bold text-base md:text-lg leading-tight">
                {name}
              </p>
              <p className="text-orange-400 font-semibold text-sm md:text-base">
                {tagline}
              </p>
              <p className="text-stone-400 text-sm mt-1 leading-snug">
                Digital service of{" "}
                <span className="text-stone-200 font-semibold">
                  {parentCompany.name}
                </span>
              </p>
              <div className="mt-1.5 text-sm font-semibold">
                <p className="flex items-center gap-1.5 text-stone-300">
                  <FaClock size={13} className="text-orange-400 shrink-0" />
                  {hoursSummary}
                </p>
                <p className="text-stone-500 font-medium mt-0.5 pl-5">
                  {closedDay}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-start sm:items-center md:items-end lg:items-center gap-3 md:gap-4 shrink-0">
            <div className="inline-flex items-center gap-2 rounded-md border border-emerald-700/50 bg-emerald-950/50 px-3 py-1.5 text-emerald-300">
              <FaCertificate size={15} aria-hidden="true" />
              <span className="text-sm font-semibold whitespace-nowrap">
                {fssaiLabel}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {socialItems.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-full border border-stone-600 text-stone-200 flex items-center justify-center hover:border-orange-500 hover:text-orange-400 hover:bg-stone-900 transition-colors"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </Wrapper>

      <div className="border-t border-stone-800">
        <Wrapper className="py-2.5 flex justify-center md:justify-start">
          <p className="text-sm text-stone-500 font-medium">
            © {new Date().getFullYear()} {name} · {parentCompany.name}. All rights
            reserved.
          </p>
        </Wrapper>
      </div>
    </footer>
  );
};

export default Footer;

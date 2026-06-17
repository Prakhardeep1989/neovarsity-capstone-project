import React from "react";
import Wrapper from "./Wrapper";

/**
 * Shared page shell — consistent vertical padding and horizontal gutters.
 * Use `narrow` for text-heavy pages, `centered` for forms and status cards.
 */
const PageLayout = ({
  children,
  className = "",
  contentClassName = "",
  narrow = false,
  centered = false,
}) => {
  const wrapperClass = [narrow ? "max-w-4xl" : "", contentClassName]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={`py-6 md:py-8 ${className}`}>
      <Wrapper className={wrapperClass || undefined}>
        {centered ? (
          <div className="flex justify-center">{children}</div>
        ) : (
          children
        )}
      </Wrapper>
    </section>
  );
};

export default PageLayout;

import React, { useEffect } from "react";

/**
 * Reusable Modal component.
 *
 * Props:
 *  - isOpen (bool)       : whether the modal is visible
 *  - onClose (fn)        : called when backdrop or × is clicked
 *  - title (string)      : optional header title
 *  - maxWidth (string)   : Tailwind max-w-* class, default "max-w-lg"
 *  - children (node)     : modal body content
 */
const Modal = ({ isOpen, onClose, title, maxWidth = "max-w-lg", children }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className={`relative bg-white rounded-xl shadow-xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || true) && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
            {title && (
              <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
            )}
            <button
              type="button"
              onClick={onClose}
              className="ml-auto text-slate-500 hover:text-slate-800 text-2xl leading-none"
              aria-label="Close"
            >
              &times;
            </button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

export default Modal;

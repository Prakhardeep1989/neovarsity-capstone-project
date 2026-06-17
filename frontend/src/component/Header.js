import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BRAND_LOGO } from "../utility/productImages";
import { HiOutlineUserCircle } from "react-icons/hi";
import { BsCartFill } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { logoutRedux } from "../redux/userSlice";
import { toast } from "react-hot-toast";

const Header = () => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const userData = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isLoggedIn = Boolean(userData.email);
  const isAdmin = Boolean(userData.isAdmin);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  const handleShowMenu = () => {
    setShowMenu((preve) => !preve);
  };

  const handleLogout = () => {
    dispatch(logoutRedux());
    setShowMenu(false);
    toast("Logout successfully");
    navigate("/");
  };

  const cartItemNumber = useSelector((state) => state.product.cartItem);

  const navLinkClass =
    "text-stone-700 hover:text-orange-700 transition-colors font-medium";

  return (
    <header className="fixed shadow-sm w-full h-16 px-3 md:px-6 z-50 bg-white/95 backdrop-blur-sm border-b border-stone-100">
      <div className="max-w-[1280px] mx-auto flex items-center h-full justify-between gap-2">
        <Link to="/" className="shrink-0 min-w-0">
          <div className="flex items-center gap-2 md:gap-3">
            <img
              src={BRAND_LOGO}
              alt="HOMELY Meals"
              className="rounded-full h-10 w-10 md:h-12 md:w-12 object-cover border border-orange-100"
              loading="lazy"
              decoding="async"
            />
            <div className="hidden sm:block min-w-0">
              <h2 className="font-bold text-lg md:text-xl text-stone-900 leading-tight truncate">
                HOMELY Meals
              </h2>
              <p className="text-xs text-orange-700 font-medium truncate">
                Ghar Jaisa Khana
              </p>
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-3 md:gap-5 shrink-0">
          <nav className="gap-4 md:gap-6 text-sm md:text-base hidden md:flex items-center">
            <Link to="/" className={navLinkClass}>
              Home
            </Link>
            <Link to="/about" className={navLinkClass}>
              About
            </Link>
            <Link to="/menu" className={navLinkClass}>
              Menu
            </Link>
            {!isAdmin && (
              <Link to="/contact" className={navLinkClass}>
                Contact
              </Link>
            )}
            {isLoggedIn && (
              <Link
                to="/orders"
                className="text-orange-700 hover:text-orange-800 font-semibold transition-colors"
              >
                {isAdmin ? "Orders" : "My Orders"}
              </Link>
            )}
          </nav>

          {!isAdmin && (
            <div className="text-xl md:text-2xl text-stone-600 relative">
              <Link to="/cart" aria-label="Cart">
                <BsCartFill />
                <div className="absolute -top-1 -right-1 text-white bg-orange-600 h-4 w-4 rounded-full text-xs flex items-center justify-center">
                  {cartItemNumber.length}
                </div>
              </Link>
            </div>
          )}

          <div className="text-slate-600 relative" ref={menuRef}>
            <div
              className="text-2xl md:text-3xl cursor-pointer w-8 h-8 rounded-full overflow-hidden text-stone-500 hover:text-orange-700 transition-colors"
              onClick={handleShowMenu}
              role="button"
              tabIndex={0}
              aria-label="User menu"
              onKeyDown={(e) => e.key === "Enter" && handleShowMenu()}
            >
              {userData.image ? (
                <img
                  src={userData.image}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <HiOutlineUserCircle className="h-full w-full" />
              )}
            </div>
            {showMenu && (
              <div className="absolute right-0 top-11 bg-white py-2 shadow-lg rounded-lg border border-stone-100 flex flex-col min-w-[180px] text-left z-50">
                {isLoggedIn ? (
                  <>
                    <div className="px-3 py-2 border-b border-stone-100">
                      <p className="text-sm font-semibold text-stone-800">
                        Profile
                      </p>
                      <p className="text-sm text-stone-600 mt-1">
                        {userData.firstName} {userData.lastName}
                      </p>
                      <p className="text-xs text-stone-500 break-all">
                        {userData.email}
                      </p>
                      <p className="text-xs text-stone-500 mt-1 capitalize">
                        {userData.role?.toLowerCase() || "customer"}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="cursor-pointer text-white px-3 py-2 bg-orange-600 hover:bg-orange-700 text-sm text-center transition-colors"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="whitespace-nowrap cursor-pointer px-3 py-2 hover:bg-orange-50 text-sm text-stone-700"
                    onClick={() => setShowMenu(false)}
                  >
                    Login
                  </Link>
                )}
                <nav className="text-sm flex flex-col md:hidden border-t border-stone-100 mt-1 pt-1">
                  <Link
                    to="/"
                    className="px-3 py-2 hover:bg-orange-50 text-stone-700"
                    onClick={() => setShowMenu(false)}
                  >
                    Home
                  </Link>
                  <Link
                    to="/menu"
                    className="px-3 py-2 hover:bg-orange-50 text-stone-700"
                    onClick={() => setShowMenu(false)}
                  >
                    Menu
                  </Link>
                  <Link
                    to="/about"
                    className="px-3 py-2 hover:bg-orange-50 text-stone-700"
                    onClick={() => setShowMenu(false)}
                  >
                    About
                  </Link>
                  {!isAdmin && (
                    <Link
                      to="/contact"
                      className="px-3 py-2 hover:bg-orange-50 text-stone-700"
                      onClick={() => setShowMenu(false)}
                    >
                      Contact
                    </Link>
                  )}
                  {isLoggedIn && (
                    <Link
                      to="/orders"
                      className="px-3 py-2 hover:bg-orange-50 text-stone-700"
                      onClick={() => setShowMenu(false)}
                    >
                      {isAdmin ? "Orders" : "My Orders"}
                    </Link>
                  )}
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

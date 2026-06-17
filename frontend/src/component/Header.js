import React, { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { BRAND_LOGO } from "../utility/productImages";
import { HiOutlineUserCircle } from "react-icons/hi";
import { BsCartFill } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { logoutRedux } from "../redux/userSlice";
import { toast } from "react-hot-toast";

const desktopNavClass = ({ isActive }) =>
  `px-3 py-1.5 rounded-lg text-sm md:text-base font-medium transition-colors ${
    isActive
      ? "bg-orange-600 text-white shadow-sm"
      : "text-stone-700 hover:bg-white hover:text-orange-700"
  }`;

const mobileNavClass = ({ isActive }) =>
  `px-3 py-2 rounded-md text-sm transition-colors ${
    isActive
      ? "bg-orange-100 text-orange-800 font-semibold"
      : "text-stone-700 hover:bg-orange-50"
  }`;

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

        <div className="flex items-center gap-3 md:gap-4 shrink-0">
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-stone-100 border border-stone-200/80">
            <NavLink to="/" end className={desktopNavClass}>
              Home
            </NavLink>
            <NavLink to="/about" className={desktopNavClass}>
              About
            </NavLink>
            <NavLink to="/menu" className={desktopNavClass}>
              Menu
            </NavLink>
            {!isAdmin && (
              <NavLink to="/contact" className={desktopNavClass}>
                Contact
              </NavLink>
            )}
            {isLoggedIn && (
              <NavLink to="/orders" className={desktopNavClass}>
                {isAdmin ? "Orders" : "My Orders"}
              </NavLink>
            )}
          </nav>

          {!isAdmin && (
            <NavLink
              to="/cart"
              aria-label="Cart"
              className={({ isActive }) =>
                `relative text-xl md:text-2xl p-1.5 rounded-lg transition-colors ${
                  isActive
                    ? "bg-orange-100 text-orange-700"
                    : "text-stone-600 hover:bg-stone-100 hover:text-orange-700"
                }`
              }
            >
              <BsCartFill />
              <div className="absolute -top-0.5 -right-0.5 text-white bg-orange-600 h-4 w-4 rounded-full text-xs flex items-center justify-center">
                {cartItemNumber.length}
              </div>
            </NavLink>
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
                  <NavLink
                    to="/login"
                    className={({ isActive }) =>
                      `whitespace-nowrap cursor-pointer px-3 py-2 text-sm transition-colors ${
                        isActive
                          ? "bg-orange-100 text-orange-800 font-semibold"
                          : "text-stone-700 hover:bg-orange-50"
                      }`
                    }
                    onClick={() => setShowMenu(false)}
                  >
                    Login
                  </NavLink>
                )}
                <nav className="text-sm flex flex-col md:hidden border-t border-stone-100 mt-1 pt-1 px-1">
                  <NavLink
                    to="/"
                    end
                    className={mobileNavClass}
                    onClick={() => setShowMenu(false)}
                  >
                    Home
                  </NavLink>
                  <NavLink
                    to="/menu"
                    className={mobileNavClass}
                    onClick={() => setShowMenu(false)}
                  >
                    Menu
                  </NavLink>
                  <NavLink
                    to="/about"
                    className={mobileNavClass}
                    onClick={() => setShowMenu(false)}
                  >
                    About
                  </NavLink>
                  {!isAdmin && (
                    <NavLink
                      to="/contact"
                      className={mobileNavClass}
                      onClick={() => setShowMenu(false)}
                    >
                      Contact
                    </NavLink>
                  )}
                  {isLoggedIn && (
                    <NavLink
                      to="/orders"
                      className={mobileNavClass}
                      onClick={() => setShowMenu(false)}
                    >
                      {isAdmin ? "Orders" : "My Orders"}
                    </NavLink>
                  )}
                  {!isAdmin && (
                    <NavLink
                      to="/cart"
                      className={mobileNavClass}
                      onClick={() => setShowMenu(false)}
                    >
                      Cart
                    </NavLink>
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

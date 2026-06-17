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

  return (
    <header className="fixed shadow-md w-full h-16 px-2 md:px-4 z-50 bg-white">
      <div className="flex items-center h-full justify-between">
        <Link to={""}>
          <div className="flex max-w-4xl mx-auto ">
            <img
              src={BRAND_LOGO}
              alt="HOMELY Meals"
              className="rounded-full h-20 object-cover"
            />
            <h2 className=" font-bold text-2xl dark:text-red-700  p-4  md: hidden md:flex  ">
              HOMELY Meals
            </h2>
          </div>
        </Link>

        <div className="flex items-center gap-4 md:gap-7">
          <nav className="gap-4 md:gap-6 text-base md:text-lg hidden md:flex items-center">
            <Link to={""}>Home</Link>
            <Link to={"about"}>About</Link>
            <Link to={"menu"}>Menu</Link>
            <Link to={"contact"}>Contact</Link>
            {isLoggedIn && (
              <Link to={"orders"} className="text-red-600 font-medium">
                Orders
              </Link>
            )}
          </nav>
          {!isAdmin && (
            <div className="text-2xl text-slate-600 relative">
              <Link to={"cart"}>
                <BsCartFill />
                <div className="absolute -top-1 -right-1 text-white bg-red-500 h-4 w-4 rounded-full m-0 p-0 text-sm text-center ">
                  {cartItemNumber.length}
                </div>
              </Link>
            </div>
          )}
          <div className=" text-slate-600 relative" ref={menuRef}>
            <div
              className="text-3xl cursor-pointer w-8 h-8 rounded-full overflow-hidden drop-shadow-md"
              onClick={handleShowMenu}
            >
              {userData.image ? (
                <img
                  src={userData.image}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <HiOutlineUserCircle />
              )}
            </div>
            {showMenu && (
              <div className="absolute right-2 top-12 bg-white py-2 shadow drop-shadow-md flex flex-col min-w-[180px] text-left z-50">
                {isLoggedIn ? (
                  <>
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-800">Profile</p>
                      <p className="text-sm text-slate-600 mt-1">
                        {userData.firstName} {userData.lastName}
                      </p>
                      <p className="text-xs text-slate-500 break-all">{userData.email}</p>
                      <p className="text-xs text-slate-500 mt-1 capitalize">
                        {userData.role?.toLowerCase() || "customer"}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="cursor-pointer text-white px-3 py-2 bg-red-500 hover:bg-red-600 text-sm text-center"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    to={"login"}
                    className="whitespace-nowrap cursor-pointer px-3 py-2 hover:bg-slate-100 text-sm"
                    onClick={() => setShowMenu(false)}
                  >
                    Login
                  </Link>
                )}
                <nav className="text-base md:text-lg flex flex-col md:hidden border-t mt-1 pt-1">
                  <Link to={""} className="px-3 py-1 hover:bg-slate-100">
                    Home
                  </Link>
                  <Link to={"menu"} className="px-3 py-1 hover:bg-slate-100">
                    Menu
                  </Link>
                  <Link to={"about"} className="px-3 py-1 hover:bg-slate-100">
                    About
                  </Link>
                  <Link to={"contact"} className="px-3 py-1 hover:bg-slate-100">
                    Contact
                  </Link>
                  {isLoggedIn && (
                    <Link to={"orders"} className="px-3 py-1 hover:bg-slate-100">
                      Orders
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

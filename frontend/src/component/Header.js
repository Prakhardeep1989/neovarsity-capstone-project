import React, { useState } from "react";
import { Link } from "react-router-dom";
import { BRAND_LOGO } from "../utility/productImages";
import { HiOutlineUserCircle } from "react-icons/hi";
import { BsCartFill } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { logoutRedux } from "../redux/userSlice";
import { toast } from "react-hot-toast";

const Header = () => {
  const [showMenu, setShowMenu] = useState(false);
  const userData = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const isLoggedIn = Boolean(userData.email);
  const isAdmin = Boolean(userData.isAdmin);

  const handleShowMenu = () => {
    setShowMenu((preve) => !preve);
  };

  const handleLogout = () => {
    dispatch(logoutRedux());
    setShowMenu(false);
    toast("Logout successfully");
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
            <Link to={"menu"}>Menu</Link>
            <Link to={"about"}>About</Link>
            <Link to={"contact"}>Contact</Link>
            {isLoggedIn && isAdmin && (
              <Link to={"newproduct"} className="text-red-600 font-medium">
                New Product
              </Link>
            )}
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="text-red-500 hover:text-red-600 font-medium"
              >
                Logout ({userData.firstName})
              </button>
            ) : (
              <Link to={"login"} className="text-red-500 font-medium">
                Login
              </Link>
            )}
          </nav>
          <div className="text-2xl text-slate-600 relative">
            <Link to={"cart"}>
              <BsCartFill />
              <div className="absolute -top-1 -right-1 text-white bg-red-500 h-4 w-4 rounded-full m-0 p-0 text-sm text-center ">
                {cartItemNumber.length}
              </div>
            </Link>
          </div>
          <div className=" text-slate-600" onClick={handleShowMenu}>
            <div className="text-3xl cursor-pointer w-8 h-8 rounded-full overflow-hidden drop-shadow-md">
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
              <div className="absolute right-2 top-12 bg-white py-2 shadow drop-shadow-md flex flex-col min-w-[140px] text-center z-50">
                {isLoggedIn && isAdmin && (
                  <Link
                    to={"newproduct"}
                    className="whitespace-nowrap cursor-pointer px-2 py-1 hover:bg-slate-100"
                    onClick={() => setShowMenu(false)}
                  >
                    New Product
                  </Link>
                )}

                {isLoggedIn ? (
                  <p
                    className="cursor-pointer text-white px-2 py-1 bg-red-500 hover:bg-red-600"
                    onClick={handleLogout}
                  >
                    Logout ({userData.firstName})
                  </p>
                ) : (
                  <Link
                    to={"login"}
                    className="whitespace-nowrap cursor-pointer px-2 py-1 hover:bg-slate-100"
                    onClick={() => setShowMenu(false)}
                  >
                    Login
                  </Link>
                )}
                <nav className="text-base md:text-lg flex flex-col md:hidden border-t mt-1 pt-1">
                  <Link to={""} className="px-2 py-1 hover:bg-slate-100">
                    Home
                  </Link>
                  <Link to={"menu"} className="px-2 py-1 hover:bg-slate-100">
                    Menu
                  </Link>
                  <Link to={"about"} className="px-2 py-1 hover:bg-slate-100">
                    About
                  </Link>
                  <Link to={"contact"} className="px-2 py-1 hover:bg-slate-100">
                    Contact
                  </Link>
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

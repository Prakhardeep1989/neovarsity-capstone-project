import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import Home from "./page/Home";
import Menu from "./page/Menu";
import MenuBrowse from "./page/MenuBrowse";
import About from "./page/About";
import Contact from "./page/Contact";
import Login from "./page/login";
import Newproduct from "./page/Newproduct";
import Signup from "./page/Signup";
import ForgotPassword from "./page/ForgotPassword";
import ResetPassword from "./page/ResetPassword";
import ChangePassword from "./page/ChangePassword";
import { Provider } from "react-redux";
import { store } from "./redux/index";
import Cart from "./page/Cart";
import ErragePage from "./page/ErragePage";
import PaymentSuccessPage from "./page/PaymentSuccess";
import Orders from "./page/Orders";
import Cancel from "./page/Cancel";

const paymentSuccessElement = <PaymentSuccessPage />;

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route index element={<Home />} />
      <Route path="menu" element={<MenuBrowse />} />
      <Route path="menu/:filterby" element={<Menu />} />
      <Route path="about" element={<About />} />
      <Route path="contact" element={<Contact />} />
      <Route path="login" element={<Login />} />
      <Route path="forgot-password" element={<ForgotPassword />} />
      <Route path="reset-password" element={<ResetPassword />} />
      <Route path="change-password" element={<ChangePassword />} />
      <Route path="newproduct" element={<Newproduct />} />
      <Route path="signup" element={<Signup />} />
      <Route path="cart" element={<Cart />} />
      <Route path="payment-success" element={paymentSuccessElement} />
      <Route path="orders" element={<Orders />} />
      <Route path="success" element={paymentSuccessElement} />
      <Route path="cancel" element={<Cancel />} />

      <Route path="*" element={<ErragePage />} />
    </Route>
  )
);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <RouterProvider router={router} />
  </Provider>
);

reportWebVitals();

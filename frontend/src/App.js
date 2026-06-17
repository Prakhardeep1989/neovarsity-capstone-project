import "./App.css";
import Header from "./component/Header";
import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setDataProduct } from "./redux/productSlide";
import Footer from "./component/Footer";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_SERVER_DOMIN}/product`);
        const resData = await res.json();
        const products = Array.isArray(resData) ? resData : [];
        dispatch(setDataProduct(products));
      } catch {
        dispatch(setDataProduct([]));
      }
    })();
  }, [dispatch]);
  //  console.log(productData); // {productList: Array(0), cartItem: Array(0)}
  return (
    <>
      <Toaster />
      <div>
        <Header />
        <main className="pt-16 bg-slate-100 min-h-[calc(100vh)]">
          <Outlet />
        </main>
        <Footer />
      </div>
    </>
  );
}

export default App;

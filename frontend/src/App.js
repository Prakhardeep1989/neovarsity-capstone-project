import "./App.css";
import Header from "./component/Header";
import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setDataProduct } from "./redux/productSlide";
import Footer from "./component/Footer";
import { fetchProducts } from "./utility/productApi";

function App() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.user.token);

  useEffect(() => {
    (async () => {
      try {
        const products = await fetchProducts(token);
        dispatch(setDataProduct(products));
      } catch {
        dispatch(setDataProduct([]));
      }
    })();
  }, [dispatch, token]);

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

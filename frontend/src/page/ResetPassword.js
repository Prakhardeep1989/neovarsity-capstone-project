import { useState } from "react";
import { LOGIN_IMAGE } from "../utility/productImages";
import { BiShow, BiHide } from "react-icons/bi";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import PageLayout from "../component/PageLayout";
import FoodImage from "../component/FoodImage";
import { resetPassword } from "../utility/authApi";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    password: "",
    confirmPassword: "",
  });

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setData((preve) => ({ ...preve, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { password, confirmPassword } = data;

    if (!token) {
      toast("Invalid reset link. Please request a new one.");
      return;
    }

    if (!password || !confirmPassword) {
      toast("Please enter all required fields");
      return;
    }

    if (password !== confirmPassword) {
      toast("Password and confirm password do not match");
      return;
    }

    setLoading(true);
    try {
      const dataRes = await resetPassword({ token, password, confirmPassword });
      toast(dataRes.message);

      if (dataRes.alert) {
        setTimeout(() => navigate("/login"), 1000);
      }
    } catch {
      toast("Password reset failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <PageLayout centered>
        <div className="w-full max-w-sm bg-white flex flex-col p-4 rounded-lg shadow text-center">
          <p className="text-stone-700 mb-4">This reset link is invalid or missing.</p>
          <Link to="/forgot-password" className="text-red-500 underline">
            Request a new reset link
          </Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout centered>
      <div className="w-full max-w-sm bg-white flex flex-col p-4 rounded-lg shadow">
        <div className="w-20 h-20 overflow-hidden rounded-full drop-shadow-md shadow-md m-auto relative">
          <FoodImage
            src={LOGIN_IMAGE}
            alt="Reset password"
            className="h-full w-full object-cover"
            rounded="rounded-full"
            priority
            lazy={false}
          />
        </div>

        <h2 className="text-lg font-semibold text-center mt-3 text-stone-800">
          Set new password
        </h2>

        <form className="w-full py-3 flex flex-col" onSubmit={handleSubmit}>
          <label htmlFor="password">New password</label>
          <div className="flex px-2 py-1 bg-slate-200 rounded mt-1 mb-2 focus-within:outline focus-within:outline-blue-300">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              className="w-full bg-slate-200 border-none outline-none"
              value={data.password}
              onChange={handleOnChange}
            />
            <span
              className="flex text-xl cursor-pointer"
              onClick={() => setShowPassword((preve) => !preve)}
            >
              {showPassword ? <BiShow /> : <BiHide />}
            </span>
          </div>

          <label htmlFor="confirmPassword">Confirm new password</label>
          <div className="flex px-2 py-1 bg-slate-200 rounded mt-1 mb-2 focus-within:outline focus-within:outline-blue-300">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              className="w-full bg-slate-200 border-none outline-none"
              value={data.confirmPassword}
              onChange={handleOnChange}
            />
            <span
              className="flex text-xl cursor-pointer"
              onClick={() => setShowConfirmPassword((preve) => !preve)}
            >
              {showConfirmPassword ? <BiShow /> : <BiHide />}
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full max-w-[180px] m-auto bg-red-500 hover:bg-red-600 disabled:opacity-60 cursor-pointer text-white text-xl font-medium text-center py-1 rounded-full mt-4"
          >
            {loading ? "Saving..." : "Reset password"}
          </button>
        </form>

        <p className="text-left text-sm mt-2">
          <Link to="/login" className="text-red-500 underline">
            Back to login
          </Link>
        </p>
      </div>
    </PageLayout>
  );
};

export default ResetPassword;

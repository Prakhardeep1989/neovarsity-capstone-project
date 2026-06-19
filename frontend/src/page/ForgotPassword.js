import { useState } from "react";
import { LOGIN_IMAGE } from "../utility/productImages";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import PageLayout from "../component/PageLayout";
import FoodImage from "../component/FoodImage";
import { forgotPassword } from "../utility/authApi";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      const dataRes = await forgotPassword({ email });
      toast(dataRes.message);
      if (dataRes.alert) {
        setSubmitted(true);
      }
    } catch {
      toast("Unable to send reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout centered>
      <div className="w-full max-w-sm bg-white flex flex-col p-4 rounded-lg shadow">
        <div className="w-20 h-20 overflow-hidden rounded-full drop-shadow-md shadow-md m-auto relative">
          <FoodImage
            src={LOGIN_IMAGE}
            alt="Forgot password"
            className="h-full w-full object-cover"
            rounded="rounded-full"
            priority
            lazy={false}
          />
        </div>

        <h2 className="text-lg font-semibold text-center mt-3 text-stone-800">
          Forgot password
        </h2>
        {!submitted && (
          <p className="text-sm text-stone-600 text-center mt-1 mb-2">
            Enter your account email and we will send you a reset link.
          </p>
        )}

        {submitted ? (
          <div className="py-3 text-sm text-stone-700 text-center">
            <p>Check your inbox for the reset link. It expires in 1 hour.</p>
            <Link to="/login" className="text-red-500 underline mt-4 inline-block">
              Back to login
            </Link>
          </div>
        ) : (
          <form className="w-full py-3 flex flex-col" onSubmit={handleSubmit}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="mt-1 mb-2 w-full bg-slate-200 px-2 py-1 rounded focus-within:outline-blue-300"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full max-w-[180px] m-auto bg-red-500 hover:bg-red-600 disabled:opacity-60 cursor-pointer text-white text-xl font-medium text-center py-1 rounded-full mt-4"
            >
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </form>
        )}

        {!submitted && (
          <p className="text-left text-sm mt-2">
            Remember your password?{" "}
            <Link to="/login" className="text-red-500 underline">
              Login
            </Link>
          </p>
        )}
      </div>
    </PageLayout>
  );
};

export default ForgotPassword;

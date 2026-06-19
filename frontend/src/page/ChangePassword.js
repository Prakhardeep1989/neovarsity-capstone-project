import { useState } from "react";
import { BiShow, BiHide } from "react-icons/bi";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import PageLayout from "../component/PageLayout";
import { changePassword } from "../utility/authApi";

const ChangePassword = () => {
  const navigate = useNavigate();
  const userData = useSelector((state) => state.user);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setData((preve) => ({ ...preve, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = data;

    if (!userData.token) {
      toast("Please log in to change your password");
      navigate("/login");
      return;
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast("Please enter all required fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast("New password and confirm password do not match");
      return;
    }

    setLoading(true);
    try {
      const dataRes = await changePassword(
        { currentPassword, newPassword, confirmPassword },
        userData.token
      );
      toast(dataRes.message);

      if (dataRes.alert) {
        setData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setTimeout(() => navigate("/"), 1000);
      }
    } catch {
      toast("Password change failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!userData.email) {
    return (
      <PageLayout centered>
        <div className="w-full max-w-sm bg-white flex flex-col p-4 rounded-lg shadow text-center">
          <p className="text-stone-700 mb-4">Please log in to change your password.</p>
          <Link to="/login" className="text-red-500 underline">
            Go to login
          </Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout centered>
      <div className="w-full max-w-sm bg-white flex flex-col p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-center text-stone-800">
          Change password
        </h2>
        <p className="text-sm text-stone-600 text-center mt-1 mb-2">
          Signed in as {userData.email}
        </p>

        <form className="w-full py-3 flex flex-col" onSubmit={handleSubmit}>
          <label htmlFor="currentPassword">Current password</label>
          <div className="flex px-2 py-1 bg-slate-200 rounded mt-1 mb-2 focus-within:outline focus-within:outline-blue-300">
            <input
              type={showCurrent ? "text" : "password"}
              id="currentPassword"
              name="currentPassword"
              className="w-full bg-slate-200 border-none outline-none"
              value={data.currentPassword}
              onChange={handleOnChange}
            />
            <span
              className="flex text-xl cursor-pointer"
              onClick={() => setShowCurrent((preve) => !preve)}
            >
              {showCurrent ? <BiShow /> : <BiHide />}
            </span>
          </div>

          <label htmlFor="newPassword">New password</label>
          <div className="flex px-2 py-1 bg-slate-200 rounded mt-1 mb-2 focus-within:outline focus-within:outline-blue-300">
            <input
              type={showNew ? "text" : "password"}
              id="newPassword"
              name="newPassword"
              className="w-full bg-slate-200 border-none outline-none"
              value={data.newPassword}
              onChange={handleOnChange}
            />
            <span
              className="flex text-xl cursor-pointer"
              onClick={() => setShowNew((preve) => !preve)}
            >
              {showNew ? <BiShow /> : <BiHide />}
            </span>
          </div>

          <label htmlFor="confirmPassword">Confirm new password</label>
          <div className="flex px-2 py-1 bg-slate-200 rounded mt-1 mb-2 focus-within:outline focus-within:outline-blue-300">
            <input
              type={showConfirm ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              className="w-full bg-slate-200 border-none outline-none"
              value={data.confirmPassword}
              onChange={handleOnChange}
            />
            <span
              className="flex text-xl cursor-pointer"
              onClick={() => setShowConfirm((preve) => !preve)}
            >
              {showConfirm ? <BiShow /> : <BiHide />}
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full max-w-[180px] m-auto bg-red-500 hover:bg-red-600 disabled:opacity-60 cursor-pointer text-white text-xl font-medium text-center py-1 rounded-full mt-4"
          >
            {loading ? "Saving..." : "Update password"}
          </button>
        </form>

        <p className="text-left text-sm mt-2">
          <Link to="/" className="text-red-500 underline">
            Back to home
          </Link>
        </p>
      </div>
    </PageLayout>
  );
};

export default ChangePassword;

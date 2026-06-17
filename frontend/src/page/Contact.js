import React, { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { BUSINESS_INFO } from "../utility/businessInfo";
import { sendContactMessage } from "../utility/contactApi";
import PageLayout from "../component/PageLayout";

const getPrefilledFields = (user, message = "") => ({
  name: user.email
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
    : "",
  email: user.email || "",
  message,
});

const Contact = () => {
  const user = useSelector((state) => state.user);
  const [form, setForm] = useState(() => getPrefilledFields(user));
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast("Please fill in all fields");
      return;
    }

    setSubmitting(true);
    try {
      const response = await sendContactMessage({
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
      });

      toast(response.message);
      if (response.alert) {
        setForm(getPrefilledFields(user));
      }
    } catch {
      toast("Failed to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageLayout narrow>
      <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
        Contact Us
      </h1>
      <p className="text-slate-600 mb-8">
        Have a question or feedback? Reach out to HOMELY Meals — we would love
        to hear from you.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold text-slate-700">
            Get in Touch
          </h2>
          <div>
            <p className="font-medium text-slate-700">Address</p>
            <p className="text-slate-600">{BUSINESS_INFO.fullAddress}</p>
          </div>
          <div>
            <p className="font-medium text-slate-700">Phone</p>
            <p className="text-slate-600">{BUSINESS_INFO.phone}</p>
          </div>
          <div>
            <p className="font-medium text-slate-700">Hours</p>
            <p className="text-slate-600">{BUSINESS_INFO.hoursSummary}</p>
            <p className="text-slate-500 text-sm">{BUSINESS_INFO.closedDay}</p>
          </div>
          <div>
            <p className="font-medium text-slate-700">Delivery Area</p>
            <p className="text-slate-600">{BUSINESS_INFO.deliveryArea}</p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow p-6 flex flex-col gap-3"
        >
          <h2 className="text-xl font-semibold text-slate-700 mb-1">
            Send a Message
          </h2>
          <label htmlFor="name" className="text-sm font-medium text-slate-700">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            disabled={submitting}
            className="bg-slate-200 px-3 py-2 rounded focus:outline-blue-300 disabled:opacity-60"
          />
          <label
            htmlFor="email"
            className="text-sm font-medium text-slate-700"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            disabled={submitting}
            className="bg-slate-200 px-3 py-2 rounded focus:outline-blue-300 disabled:opacity-60"
          />
          <label
            htmlFor="message"
            className="text-sm font-medium text-slate-700"
          >
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            value={form.message}
            onChange={handleChange}
            disabled={submitting}
            className="bg-slate-200 px-3 py-2 rounded resize-none focus:outline-blue-300 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={submitting}
            className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-medium py-2 rounded mt-2"
          >
            {submitting ? "Sending…" : "Send Message"}
          </button>
        </form>
      </div>
    </PageLayout>
  );
};

export default Contact;

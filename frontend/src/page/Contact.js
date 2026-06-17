import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { BUSINESS_INFO } from "../utility/businessInfo";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.name && form.email && form.message) {
      toast("Thank you! We will get back to you soon.");
      setForm({ name: "", email: "", message: "" });
    } else {
      toast("Please fill in all fields");
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
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
            <p className="text-slate-600">{BUSINESS_INFO.hours}</p>
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
            className="bg-slate-200 px-3 py-2 rounded focus:outline-blue-300"
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
            className="bg-slate-200 px-3 py-2 rounded focus:outline-blue-300"
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
            className="bg-slate-200 px-3 py-2 rounded resize-none focus:outline-blue-300"
          />
          <button
            type="submit"
            className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 rounded mt-2"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;

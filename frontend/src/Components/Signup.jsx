import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "user",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "https://creatordashboardbackend-7px3.onrender.com/api/auth/register",
        form
      );
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      toast.success("Signup successful!", { autoClose: 2000 });

      setTimeout(() => {
        navigate(res.data.user.role === "admin" ? "/admin" : "/dashboard");
      }, 2000);
    } catch (err) {
      toast.error(err.response?.data || "Signup failed", { autoClose: 3000 });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 via-white to-purple-200">
      <ToastContainer />
      <div className="bg-white/70 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md border border-purple-200">
        <h2 className="text-2xl font-extrabold text-center text-gray-800 mb-5">
          Create an Account
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            name="username"
            placeholder="Username"
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-purple-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/90 placeholder-gray-600"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-purple-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/90 placeholder-gray-600"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-purple-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/90 placeholder-gray-600"
          />
          <select
            name="role"
            onChange={handleChange}
            className="w-full px-3 py-2 border border-purple-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/90 text-gray-700"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 rounded-md font-medium transition-all hover:bg-purple-700 active:scale-95 shadow-sm"
          >
            Register
          </button>
        </form>
        <p className="text-center text-sm text-gray-700 mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-purple-600 font-medium hover:underline">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
};

export default Signup;

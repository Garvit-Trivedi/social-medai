import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../lib/api";
import loginImage from "../assets/login.png";
import AuthWrapper from "../components/AuthWrapper";

/**
 * NOTE: This file is currently not used. 
 * The project uses the shared 'Auth.jsx' component for both /login and /signup routes.
 */
export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(form),
      });

      localStorage.setItem("token", res.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthWrapper>
      <div className="w-full max-w-[800px] glass rounded-2xl overflow-hidden flex flex-col md:flex-row text-white shadow-xl">

        {/* LEFT FORM */}
        <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-center">
          <h1 className="text-3xl font-semibold mb-6 text-white">Welcome Back</h1>

          {error && <div className="mb-3 text-sm text-red-400">{error}</div>}

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="block text-sm mb-1 text-gray-300">Email</label>
              <input
                className="w-full rounded-md bg-white/10 border border-white/20 px-4 py-2.5 outline-none"
                type="email"
                name="email"
                required
                value={form.email}
                onChange={onChange}
              />
            </div>

            <div>
              <label className="block text-sm mb-1 text-gray-300">Password</label>
              <input
                className="w-full rounded-md bg-white/10 border border-white/20 px-4 py-2.5 outline-none"
                type="password"
                name="password"
                required
                value={form.password}
                onChange={onChange}
              />
            </div>

            <button
              disabled={loading}
              className="w-full py-2.5 rounded-md font-semibold text-black bg-white hover:bg-gray-300 transition"
            >
              {loading ? "Logging in..." : "Login In"}
            </button>
          </form>

          <p className="mt-5 text-sm text-gray-400 text-center">
            Don’t have an account?{" "}
            <Link className="underline text-white" to="/signup" state={{ dir: 1 }}>
              Sign up
            </Link>
          </p>
        </div>

        {/* RIGHT IMAGE */}
        <div className="hidden md:block md:w-1/2">
          <img src={loginImage} className="w-full h-full object-cover" alt="Login visual" />
        </div>

      </div>
    </AuthWrapper>
  );
}

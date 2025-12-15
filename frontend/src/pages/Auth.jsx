import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../lib/api";
import authImage from "../assets/login.png";
import AuthWrapper from "../components/AuthWrapper";

export default function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // login | signup

  const isSignup = mode === "signup";

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const switchMode = (next) => {
    setError("");
    setMode(next);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isSignup && form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await apiRequest(
        isSignup ? "/api/auth/signup" : "/api/auth/login",
        {
          method: "POST",
          body: JSON.stringify(
            isSignup
              ? {
                  username: form.username,
                  email: form.email,
                  password: form.password,
                }
              : {
                  email: form.email,
                  password: form.password,
                }
          ),
        }
      );

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
    {/* ===== Background ===== */}
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <div className="auth-orb purple" />
      <div className="auth-orb red" />
      <div className="auth-grid" />
    </div>

    <div className="relative w-full max-w-[1040px] mx-auto glass rounded-[32px] overflow-hidden shadow-2xl flex flex-col md:flex-row">

      {/* ===== LEFT VISUAL (lighter presence) ===== */}
      <div className="hidden md:flex md:w-[46%] relative items-center">
        <img
          src={authImage}
          alt="Auth visual"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-800/40 via-black/30 to-red-800/40" />

        <div className="relative z-10 px-14">
          <h2 className="text-4xl font-bold leading-tight">
            {isSignup ? "Join Pulse" : "Welcome back"}
          </h2>

          <p className="mt-6 text-[#d6ddeb] text-lg leading-relaxed max-w-sm">
            {isSignup
              ? "A calm, photo-first social platform built for creators who value mood over noise."
              : "Log back in to continue shaping your visual world."}
          </p>
        </div>
      </div>

      {/* ===== FORM PANEL ===== */}
      <div className="w-full md:w-[54%] px-8 py-12 md:px-16 md:py-16 text-white">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight">
            {isSignup ? "Create your account" : "Log in to Pulse"}
          </h1>

          <p className="mt-3 text-gray-400 text-base leading-relaxed max-w-md">
            {isSignup
              ? "Set up your profile in under a minute. No pressure, no noise."
              : "Welcome back — let’s get you where you left off."}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-8 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-7">

          {/* Username (animated space, not cramped) */}
          <div
            className={`transition-all duration-300 overflow-hidden ${
              isSignup ? "max-h-28 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <Input
              label="Username"
              name="username"
              value={form.username}
              onChange={onChange}
            />
          </div>

          <Input
            label="Email address"
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
          />

          <Input
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={onChange}
          />

          {/* Confirm password */}
          <div
            className={`transition-all duration-300 overflow-hidden ${
              isSignup ? "max-h-28 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <Input
              label="Confirm password"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={onChange}
            />
          </div>
          

          {/* CTA */}
          <div className="pt-4">
            <button
              disabled={loading}
              className="w-full py-3.5 rounded-lg font-semibold text-black
                         bg-gradient-to-r from-purple-400 to-red-400
                         hover:brightness-110 transition disabled:opacity-60"
            >
              {loading
                ? isSignup
                  ? "Creating account…"
                  : "Logging in…"
                : isSignup
                ? "Create account"
                : "Log in"}
            </button>
          </div>
        </form>

        {/* Switch */}
        <div className="mt-10 pt-6 border-t border-white/10 text-center">
          <p className="text-sm text-gray-400">
            {isSignup ? "Already have an account?" : "Don’t have an account?"}{" "}
            <button
              onClick={() => setMode(isSignup ? "login" : "signup")}
              className="text-white underline underline-offset-4 hover:text-purple-300 transition"
            >
              {isSignup ? "Log in" : "Sign up"}
            </button>
          </p>
        </div>
      </div>
    </div>

    {/* ===== Styles (unchanged logic, smoother feel) ===== */}
    <style>{`
      .auth-orb {
        position: absolute;
        width: 460px;
        height: 460px;
        border-radius: 50%;
        filter: blur(180px);
        opacity: .22;
        animation: float 24s ease-in-out infinite;
      }

      .auth-orb.purple {
        background: #b76bff;
        top: -220px;
        left: -220px;
      }

      .auth-orb.red {
        background: #ff6b6b;
        bottom: -240px;
        right: -220px;
        animation-duration: 30s;
      }

      @keyframes float {
        0% { transform: translateY(0); }
        50% { transform: translateY(-90px); }
        100% { transform: translateY(0); }
      }

      .auth-grid {
        position: absolute;
        inset: 0;
        background-image:
          linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px);
        background-size: 90px 90px;
        animation: gridMove 36s linear infinite;
        opacity: .15;
      }

      @keyframes gridMove {
        from { background-position: 0 0; }
        to { background-position: 180px 180px; }
      }

      @media (prefers-reduced-motion: reduce) {
        * { animation: none !important; }
      }
    `}</style>
  </AuthWrapper>
);
}
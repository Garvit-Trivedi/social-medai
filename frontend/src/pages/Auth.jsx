import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "../lib/api";
import { supabase } from "../lib/supabaseClient";
import authImage from "../assets/login.png";
import AuthWrapper from "../components/AuthWrapper";

/**
 * Compact Premium Input Component
 */
function Input({ label, name, type = "text", value, onChange, required = true }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#52606d] ml-1">
        {label}
      </label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full rounded-xl bg-black/40 border border-white/5
                   px-4 py-2.5 text-sm text-[#e6eef3] outline-none
                   focus:border-[#b76bff]/50 focus:ring-4 focus:ring-[#b76bff]/5
                   transition-all duration-300 placeholder:text-[#3a444d]"
      />
    </div>
  );  
}

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const isSignup = location.pathname === "/signup";

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function checkSupabaseSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) handleSocialSync(session);
    }
    checkSupabaseSession();
  }, []);

  async function handleSocialSync(supabaseSession) {
    try {
      setLoading(true);
      const res = await apiRequest("/api/auth/social-sync", {
        method: "POST",
        body: JSON.stringify({ accessToken: supabaseSession.access_token }),
      });
      localStorage.setItem("token", res.token);
      await supabase.auth.signOut(); 
      navigate("/dashboard");
    } catch (err) {
      setError("Sync failed: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + location.pathname }
    });
    if (error) setError(error.message);
  };

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

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
               ? { username: form.username, email: form.email, password: form.password, confirmPassword: form.confirmPassword }
               : { email: form.email, password: form.password }
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
      {/* Persistent Cinematic Background */}
      <div className="fixed inset-0 -z-10 bg-[#0b0f14] overflow-hidden">
        <div className="auth-orb purple" />
        <div className="auth-orb red" />
        <div className="auth-grid" />
      </div>

      <div className="relative w-full max-w-4xl mx-auto px-4 flex flex-col items-center justify-center min-h-screen">
        
        <div className="w-full glass rounded-3xl overflow-hidden shadow-2xl border border-white/5 flex flex-col lg:flex-row backdrop-blur-2xl">
          
          {/* LEFT: Compact Hero */}
          <div className="hidden lg:flex lg:w-[38%] relative overflow-hidden bg-[#070b0e] border-r border-white/5">
            <img src={authImage} alt="Pulse" className="absolute inset-0 w-full h-full object-cover opacity-40 grayscale" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f14] via-[#0b0f14]/20 to-transparent" />
            
            <div className="relative z-10 p-10 flex flex-col justify-end h-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={isSignup ? "signup-hero" : "login-hero"}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-3"
                >
                  <div className="inline-block px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold uppercase tracking-widest text-purple-400">
                    Pulse Pro
                  </div>
                  <h2 className="text-2xl font-black text-white leading-tight">
                    {isSignup ? "Join the nocturnal." : "Welcome back."}
                  </h2>
                  <p className="text-gray-500 text-xs font-medium leading-relaxed max-w-[200px]">
                    {isSignup ? "Create your creative sanctuary today." : "Your feed misses your cinematic perspective."}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* RIGHT: Compact Form */}
          <div className="flex-1 bg-black/20 p-6 sm:p-10 lg:p-12 flex flex-col justify-center min-h-[500px]">
            
            <AnimatePresence mode="wait">
              <motion.div
                key={isSignup ? "signup-form" : "login-form"}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-white tracking-tight">
                    {isSignup ? "Create account" : "Sign in"}
                  </h1>
                  <p className="text-xs text-gray-500 font-medium mt-1">
                    {isSignup ? "Enter your details to join Pulse." : "Log in to access your cinematic feed."}
                  </p>
                </div>

                {error && (
                  <div className="mb-6 p-3 rounded-xl bg-red-400/5 border border-red-400/20 text-[11px] text-red-400 font-bold text-center">
                    {error}
                  </div>
                )}

                <form onSubmit={onSubmit} className="space-y-4">
                  {isSignup && (
                    <Input label="Username" name="username" value={form.username} onChange={onChange} />
                  )}
                  <Input label="Email Address" name="email" type="email" value={form.email} onChange={onChange} />
                  <Input label="Password" name="password" type="password" value={form.password} onChange={onChange} />
                  {isSignup && (
                    <Input label="Confirm Password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={onChange} />
                  )}

                  <div className="pt-2">
                    <button
                      disabled={loading}
                      className="w-full py-3 rounded-xl font-black text-[11px] uppercase tracking-widest text-black
                                 bg-gradient-to-r from-[#b76bff] via-[#ff6b6b] to-[#ff9a8a]
                                 hover:shadow-[0_0_20px_-5px_rgba(255,107,107,0.5)] 
                                 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                    >
                      {loading ? "Syncing..." : isSignup ? "Register Account" : "Access Feed"}
                    </button>
                  </div>
                </form>

                <div className="relative my-6 flex items-center">
                  <div className="flex-grow border-t border-white/5"></div>
                  <span className="mx-4 text-[9px] font-black tracking-widest text-gray-700">OR</span>
                  <div className="flex-grow border-t border-white/5"></div>
                </div>

                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full py-3 rounded-xl text-xs font-bold text-gray-300 border border-white/5 
                             bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center gap-3"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  Continue with Google
                </button>

                <div className="mt-6 text-center">
                  <p className="text-[11px] text-gray-500 font-medium">
                    {isSignup ? "Already joined?" : "New curator?"}{" "}
                    <Link
                      to={isSignup ? "/login" : "/signup"}
                      className="text-white hover:text-purple-400 transition-colors ml-1 font-bold underline underline-offset-4 decoration-purple-500/30"
                    >
                      {isSignup ? "Sign In" : "Register Now"}
                    </Link>
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-6 flex gap-6 text-[9px] font-bold uppercase tracking-widest text-[#3a444d]">
          <Link to="/" className="hover:text-white">Home</Link>
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
        </div>
      </div>

      <style>{`
        .auth-orb { position: absolute; width: 500px; height: 500px; border-radius: 50%; filter: blur(150px); opacity: .12; animation: float 15s ease-in-out infinite; }
        .auth-orb.purple { background: #b76bff; top: -200px; left: -200px; }
        .auth-orb.red { background: #ff6b6b; bottom: -200px; right: -200px; animation-duration: 20s; }
        @keyframes float { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(30px, -40px); } }
        .auth-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.02) 1px, transparent 1px); background-size: 60px 60px; mask-image: radial-gradient(circle at center, black, transparent 90%); }
        .glass { background: rgba(10, 15, 20, 0.7); box-shadow: 0 20px 50px rgba(0, 0, 0, 0.9); }
      `}</style>
    </AuthWrapper>
  );
}
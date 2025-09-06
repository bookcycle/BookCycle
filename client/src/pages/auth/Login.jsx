import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../features/auth/authSlice";
import { api } from "../../lib/api"
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

const LoginPage = () => {

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // optional: support redirect query (?redirect=/somewhere)
  const redirectTo =
    new URLSearchParams(location.search).get("redirect") || "/profile";
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleGoogleSignin = () => {
    if (isLoading) return; // prevent double click
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert("Google login would be initiated here!");
    }, 800);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return; // prevent double submit
    setIsLoading(true);
    try {
      const payload = {
        email: formData.email.trim(),
        password: formData.password,
      };

      const { user, token } = await api("/auth/login", {
        method: "POST",
        body: payload,
      });

      localStorage.setItem("ptb_token", token);
      dispatch(setCredentials({ user, token }));
      alert(`Welcome, ${user.email}!`);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      alert(err.message || "Login failed");
    }
    finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F3F8F4]">
      {/* Left Section - Hero (Hidden on mobile) */}
      <section className="hidden lg:flex lg:flex-1 relative overflow-hidden">
        {/* Background image - decorative */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <img
            src="https://images.unsplash.com/photo-1652259432747-2adff09254a6?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.1.0"
            alt=""
            className="w-full h-full object-cover"
            loading="eager"
          />
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/70 pointer-events-none" aria-hidden="true" />

        {/* Top bar (ensure it's above the overlays) */}
        <div className="absolute top-0 left-0 right-0 p-8 pb-0 z-20">
          <Link
            to="/"
            className="text-sm inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors font-medium"
          >
            <FaArrowLeft className="h-3.5 w-3.5" />
            HOME
          </Link>
        </div>

        {/* Hero content */}
        <div className="relative z-10 flex items-center justify-center p-8 flex-1">
          <div className="text-center text-white max-w-md">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">Start Reading</h2>
            <p className="text-xl mb-6 text-white/90">Discover thousands of books</p>
            <p className="text-white/75 leading-relaxed">
              Join millions of readers and explore curated collections, get personalized
              recommendations, and track your reading journey.
            </p>
          </div>
        </div>
      </section>

      {/* Right Section - Form */}
      <section className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <div className="lg:hidden p-6 pb-0">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[#1C1C1C]/80 hover:text-[#1C1C1C] transition-colors text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            HOME
          </Link>
        </div>

        {/* Form container */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-8">
          <div className="w-full max-w-sm">
            {/* Header */}
            <header className="text-center mb-8">
              <h1 className="text-3xl lg:text-4xl font-bold text-[#1C1C1C] mb-2">Join PassTheBook</h1>
              <p className="text-[#1C1C1C]/70 text-lg">Start your reading adventure</p>
            </header>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Email */}
              <div>
                <label htmlFor="email" className="sr-only">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email address"
                  autoComplete="email"
                  required
                  className="w-full px-4 py-3.5 bg-white border border-[#1C1C1C]/15 rounded-lg text-[#1C1C1C] placeholder:text-[#1C1C1C]/50 focus:outline-none focus:ring-2 focus:ring-[#1C1C1C]/20 focus:border-[#1C1C1C]/40 transition-all"
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Password"
                    autoComplete="current-password"
                    minLength={6}
                    required
                    className="w-full px-4 py-3.5 pr-12 bg-white border border-[#1C1C1C]/15 rounded-lg text-[#1C1C1C] placeholder:text-[#1C1C1C]/50 focus:outline-none focus:ring-2 focus:ring-[#1C1C1C]/20 focus:border-[#1C1C1C]/40 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1C1C1C]/60 hover:text-[#1C1C1C] transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Google Sign In */}
              <button
                type="button"
                onClick={handleGoogleSignin}
                disabled={isLoading}
                aria-disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white border border-[#1C1C1C]/15 rounded-lg text-[#1C1C1C] hover:bg-[#1C1C1C]/5 hover:border-[#1C1C1C]/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#1C1C1C]/10" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-[#F3F8F4] text-[#1C1C1C]/60">or</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                aria-disabled={isLoading}
                className="w-full flex items-center justify-center font-semibold py-3.5 px-4 rounded-lg bg-[#1C1C1C] text-[#F3F8F4] hover:bg-[#1C1C1C]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="sr-only">Signing in...</span>
                    <div className="w-4 h-4 border-2 border-[#F3F8F4]/30 border-t-[#F3F8F4] rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>

              {/* Sign up link */}
              <p className="text-center text-sm text-[#1C1C1C]/70 mt-6">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-[#1C1C1C] font-semibold underline hover:opacity-80 transition-opacity"
                >
                  SIGN UP
                </Link>
              </p>

              {/* SR-only status */}
              <div role="status" aria-live="polite" className="sr-only">
                {isLoading ? "Loading" : "Idle"}
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LoginPage;

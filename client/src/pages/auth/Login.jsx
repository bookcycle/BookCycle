import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../features/auth/authSlice";
import { api } from "../../lib/api";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { renderGoogleButton } from "../../lib/googleAuth";

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectParam = new URLSearchParams(location.search).get("redirect");

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const googleBtnRef = useRef(null);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || !googleBtnRef.current) return;
    renderGoogleButton(clientId, googleBtnRef.current, async (idToken) => {
      try {
        setIsLoading(true);
        const data = await api.post("/auth/google", { idToken });
        const user = data?.user;
        const token = data?.token;
        if (!user || !token) throw new Error("Invalid server response");
        localStorage.setItem("ptb_token", token);
        dispatch(setCredentials({ user, token }));
        const fallback = user.role === "admin" ? "/admin" : "/profile";
        const target = redirectParam || fallback;
        navigate(target, { replace: true });
      } catch (err) {
        alert(err?.response?.data?.error || err.message || "Google sign-in failed");
      } finally {
        setIsLoading(false);
      }
    });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);

    try {
      const payload = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      };

      const data = await api.post("/auth/login", payload);
      const user = data?.user;
      const token = data?.token;
      if (!user || !token) throw new Error("Invalid server response");

      localStorage.setItem("ptb_token", token);
      dispatch(setCredentials({ user, token }));

      const fallback = user.role === "admin" ? "/admin" : "/profile";
      const target = redirectParam || fallback;
      navigate(target, { replace: true });
    } catch (err) {
      alert(err?.response?.data?.error || err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F3F8F4]">
      {/* Left Section - Hero (Hidden on mobile) */}
      <section className="hidden lg:flex lg:flex-1 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <img
            src="https://images.unsplash.com/photo-1652259432747-2adff09254a6?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.1.0"
            alt=""
            className="w-full h-full object-cover"
            loading="eager"
          />
        </div>

        <div
          className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/70 pointer-events-none"
          aria-hidden="true"
        />

        <div className="absolute top-0 left-0 right-0 p-8 pb-0 z-20">
          <Link
            to="/"
            className="text-sm inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors font-medium"
          >
            <FaArrowLeft className="h-3.5 w-3.5" />
            HOME
          </Link>
        </div>

        <div className="relative z-10 flex items-center justify-center p-8 flex-1">
          <div className="text-center text-white max-w-md">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              Start Reading
            </h2>
            <p className="text-xl mb-6 text-white/90">Discover thousands of books</p>
            <p className="text-white/75 leading-relaxed">
              Join millions of readers and explore curated collections, get
              personalized recommendations, and track your reading journey.
            </p>
          </div>
        </div>
      </section>

      {/* Right Section - Form */}
      <section className="flex-1 flex flex-col min-h-screen">
        <div className="lg:hidden p-6 pb-0">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[#1C1C1C]/80 hover:text-[#1C1C1C] transition-colors text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            HOME
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 lg:p-8">
          <div className="w-full max-w-sm">
            <header className="text-center mb-8">
              <h1 className="text-3xl lg:text-4xl font-bold text-[#1C1C1C] mb-2">
                Welcome Back
              </h1>
              <p className="text-[#1C1C1C]/70 text-lg">Access your BookCycle account</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Email */}
              <div>
                <label htmlFor="email" className="sr-only">
                  Email
                </label>
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
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
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
              <div
                ref={googleBtnRef}
                className="w-full flex items-center justify-center"
                aria-label="Continue with Google"
              />

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

              <p className="text-center text-sm text-[#1C1C1C]/70 mt-6">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-[#1C1C1C] font-semibold underline hover:opacity-80 transition-opacity"
                >
                  SIGN UP
                </Link>
              </p>

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

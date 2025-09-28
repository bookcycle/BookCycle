import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../features/auth/authSlice";
import { api } from "../../lib/api";
import { FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { renderGoogleButton } from "../../lib/googleAuth";

export default function SignupPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo =
    new URLSearchParams(location.search).get("redirect") || "/profile";

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });

  const googleBtnRef = useRef(null);

  // Render Google button (uses env VITE_GOOGLE_CLIENT_ID inside helper)
  useEffect(() => {
    const el = googleBtnRef.current;
    if (!el) return;

    renderGoogleButton(el, async (credential) => {
      try {
        setIsLoading(true);
        // IMPORTANT: send as { id_token } so server can verify against GOOGLE_CLIENT_ID
        const { data } = await api.post("/auth/google", { id_token: credential });

        const user = data?.user;
        const token = data?.token;
        if (!user || !token) throw new Error("Invalid server response");

        localStorage.setItem("ptb_token", token);
        dispatch(setCredentials({ user, token }));
        navigate(redirectTo, { replace: true });
      } catch (err) {
        alert(err?.response?.data?.error || err.message || "Google sign-up failed");
      } finally {
        setIsLoading(false);
      }
    });
  }, [dispatch, navigate, redirectTo]);

  const onChange = (e) => {
    const { name, type, checked, value } = e.target;
    setFormData((p) => ({
      ...p,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    if (!formData.acceptTerms) {
      alert("Please accept terms!");
      return;
    }
    if (formData.password.length < 8) {
      alert("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      };

      const { data } = await api.post("/auth/signup", payload);
      const user = data?.user;
      const token = data?.token;
      if (!user || !token) throw new Error("Invalid server response");

      localStorage.setItem("ptb_token", token);
      dispatch(setCredentials({ user, token }));
      navigate(redirectTo, { replace: true });
    } catch (err) {
      alert(err?.response?.data?.error || err.message || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F3F8F4]">
      {/* Left — Form */}
      <section className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between p-8 pb-0">
          <Link
            to="/"
            className="text-sm inline-flex items-center gap-2 text-[#1C1C1C] hover:opacity-80"
          >
            <FaArrowLeft className="h-3.5 w-3.5" />
            HOME
          </Link>
        </div>

        {/* Form card */}
        <div className="flex-1 flex items-center justify-center px-8">
          <div className="w-full max-w-sm">
            <header className="text-center mb-6">
              <h1 className="text-3xl font-bold text-[#1C1C1C]">Join BookCycle</h1>
              <p className="text-[#1C1C1C]/80">Start your reading adventure</p>
            </header>

            <form onSubmit={onSubmit} className="space-y-4" noValidate>
              {/* Name */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="firstName" className="sr-only">First name</label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={onChange}
                    placeholder="First name"
                    required
                    className="w-full px-4 py-3 bg-white border border-[#1C1C1C20] rounded-lg text-[#1C1C1C] placeholder:text-[#1C1C1C]/60 focus:outline-none focus:ring-2 focus:ring-[#1C1C1C33] focus:border-[#1C1C1C]"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="lastName" className="sr-only">Last name</label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={onChange}
                    placeholder="Last name"
                    required
                    className="w-full px-4 py-3 bg-white border border-[#1C1C1C20] rounded-lg text-[#1C1C1C] placeholder:text-[#1C1C1C]/60 focus:outline-none focus:ring-2 focus:ring-[#1C1C1C33] focus:border-[#1C1C1C]"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label htmlFor="email" className="sr-only">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={onChange}
                  placeholder="Email"
                  required
                  autoComplete="email"
                  className="w-full px-4 py-3 bg-white border border-[#1C1C1C20] rounded-lg text-[#1C1C1C] placeholder:text-[#1C1C1C]/60 focus:outline-none focus:ring-2 focus:ring-[#1C1C1C33] focus:border-[#1C1C1C]"
                />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label htmlFor="password" className="sr-only">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={onChange}
                    placeholder="Password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="w-full px-4 py-3 pr-12 bg-white border border-[#1C1C1C20] rounded-lg text-[#1C1C1C] placeholder:text-[#1C1C1C]/60 focus:outline-none focus:ring-2 focus:ring-[#1C1C1C33] focus:border-[#1C1C1C]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1C1C1C] hover:opacity-80"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label htmlFor="confirmPassword" className="sr-only">Confirm password</label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={onChange}
                    placeholder="Confirm password"
                    required
                    autoComplete="new-password"
                    className="w-full px-4 py-3 pr-12 bg-white border border-[#1C1C1C20] rounded-lg text-[#1C1C1C] placeholder:text-[#1C1C1C]/60 focus:outline-none focus:ring-2 focus:ring-[#1C1C1C33] focus:border-[#1C1C1C]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1C1C1C] hover:opacity-80"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                  </button>
                </div>
              </div>

              {/* Terms */}
              <label className="flex items-start gap-2">
                <input
                  id="acceptTerms"
                  name="acceptTerms"
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={onChange}
                  required
                  className="mt-1 h-4 w-4 rounded border-[#1C1C1C] accent-[#1C1C1C]"
                />
                <span className="text-sm text-[#1C1C1C] leading-relaxed">
                  I agree to the{" "}
                  <button type="button" className="underline hover:opacity-80">Terms</button>{" "}
                  and{" "}
                  <button type="button" className="underline hover:opacity-80">Privacy Policy</button>
                </span>
              </label>

              {/* Google */}
              <div
                ref={googleBtnRef}
                className="w-full flex items-center justify-center"
                style={{ minHeight: 44 }}
                aria-label="Continue with Google"
              />

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center font-semibold py-3 px-4 rounded-lg bg-[#1C1C1C] text-[#F3F8F4] hover:bg-[#1C1C1C]/90 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-[#F3F8F4]/40 border-t-[#F3F8F4] rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  "Create account"
                )}
              </button>

              <p className="text-center text-sm text-[#1C1C1C]">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-[#1C1C1C] font-semibold underline hover:opacity-80 transition-opacity"
                >
                  SIGN IN
                </Link>
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* Right — Image / Hero */}
      <section className="flex-1 relative overflow-hidden lg:border-l lg:border-[#1C1C1C20]">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1481415004805-b5b5c1e19e9f?w=1600&auto=format&fit=crop&q=80"
            alt=""
            className="w-full h-full object-cover"
            loading="eager"
            crossOrigin="anonymous"
          />
        </div>
        <div className="absolute inset-0 bg-[rgba(28,28,28,0.55)]" />
        <div className="relative z-10 flex min-h-full items-center justify-center px-8 py-24">
          <div className="text-center text-[#F3F8F4]">
            <h2 className="text-4xl font-bold mb-4">Start Reading</h2>
            <p className="text-xl mb-6 text-[#F3F8F4]/90">Discover thousands of books</p>
            <p className="max-w-sm mx-auto text-[#F3F8F4]/75">
              Join millions of readers and explore curated collections, get
              personalized recommendations, and track your reading journey.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

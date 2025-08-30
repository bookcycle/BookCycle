import React, { useState } from "react";
import { FaGoogle, FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function SignupPage() {
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

    const onChange = (e) => {
        const { name, type, checked, value } = e.target;
        setFormData((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    };

    const handleGoogleSignup = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            alert("Google registration would be initiated here!");
        }, 1000);
    };

    const onSubmit = (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }
        if (!formData.acceptTerms) {
            alert("Please accept the terms and conditions!");
            return;
        }
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            alert("Account created successfully!");
        }, 1000);
    };

    return (
        <div className="min-h-screen flex bg-[#F3F8F4]">
            {/* Left — Form */}
            <section className="flex-1 flex flex-col">
                {/* Top bar */}
                <div className="flex items-center justify-between p-8 pb-0">
                    <Link
                        to="/home"
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
                            <h1 className="text-3xl font-bold text-[#1C1C1C]">Join PassTheBook</h1>
                            <p className="text-[#1C1C1C]/80">Start your reading adventure</p>
                        </header>

                        <form onSubmit={onSubmit} className="space-y-4">
                            {/* Name */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label htmlFor="firstName" className="sr-only">
                                        First name
                                    </label>
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
                                    <label htmlFor="lastName" className="sr-only">
                                        Last name
                                    </label>
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
                                <label htmlFor="email" className="sr-only">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={onChange}
                                    placeholder="Email"
                                    required
                                    className="w-full px-4 py-3 bg-white border border-[#1C1C1C20] rounded-lg text-[#1C1C1C] placeholder:text-[#1C1C1C]/60 focus:outline-none focus:ring-2 focus:ring-[#1C1C1C33] focus:border-[#1C1C1C]"
                                />
                            </div>

                            {/* Password */}
                            <div className="space-y-1">
                                <label htmlFor="password" className="sr-only">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={onChange}
                                        placeholder="Password"
                                        required
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
                                <label htmlFor="confirmPassword" className="sr-only">
                                    Confirm password
                                </label>
                                <div className="relative">
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={formData.confirmPassword}
                                        onChange={onChange}
                                        placeholder="Confirm password"
                                        required
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
                                    <button type="button" className="underline hover:opacity-80">
                                        Terms
                                    </button>{" "}
                                    and{" "}
                                    <button type="button" className="underline hover:opacity-80">
                                        Privacy Policy
                                    </button>
                                </span>
                            </label>

                            {/* Google */}
                            <button
                                type="button"
                                onClick={handleGoogleSignup}
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white border border-[#1C1C1C]/15 rounded-lg text-[#1C1C1C] hover:bg-[#1C1C1C]/5 hover:border-[#1C1C1C]/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Continue with Google
                            </button>

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
                {/* Background image */}
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1481415004805-b5b5c1e19e9f?w=1600&auto=format&fit=crop&q=80"
                        alt=""
                        className="w-full h-full object-cover"
                        loading="eager"
                        crossOrigin="anonymous"
                    />
                </div>
                {/* Overlay tint */}
                <div className="absolute inset-0 bg-[rgba(28,28,28,0.55)]" />

                {/* Centered hero */}
                <div className="relative z-10 flex min-h-full items-center justify-center px-8 py-24">
                    <div className="text-center text-[#F3F8F4]">
                        <h2 className="text-4xl font-bold mb-4">Start Reading</h2>
                        <p className="text-xl mb-6 text-[#F3F8F4]/90">Discover thousands of books</p>
                        <p className="max-w-sm mx-auto text-[#F3F8F4]/75">
                            Join millions of readers and explore curated collections, get personalized recommendations, and track your
                            reading journey.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}

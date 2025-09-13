import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials } from "../features/auth/authSlice";
import { api } from "../lib/api";
import { useNavigate } from "react-router-dom";
import { FaSave, FaKey, FaEye, FaEyeSlash } from "react-icons/fa";

export default function SettingsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user: storeUser, token } = useSelector((s) => s.auth);

  const savedToken = token || localStorage.getItem("ptb_token");

  const [loading, setLoading] = useState(!storeUser);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Profile form
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "" });
  const [saving, setSaving] = useState(false);

  // Password form
  const [pwd, setPwd] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdError, setPwdError] = useState("");
  const [pwdNotice, setPwdNotice] = useState("");
  const [show, setShow] = useState({
    current: false,
    next: false,
    confirm: false,
  });

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        if (!savedToken) {
          navigate("/login?redirect=/settings", { replace: true });
          return;
        }

        if (!storeUser) {
          const data = await api.get("/auth/me");
          if (ignore) return;

          const user = data?.user;
          if (!user) throw new Error("No user data returned");

          dispatch(setCredentials({ user, token: savedToken }));
          setForm({
            firstName: user?.firstName ?? "",
            lastName: user?.lastName ?? "",
            email: user?.email ?? "",
          });
          setLoading(false);
          return;
        }

        // already have store user
        setForm({
          firstName: storeUser?.firstName ?? "",
          lastName: storeUser?.lastName ?? "",
          email: storeUser?.email ?? "",
        });
        setLoading(false);
      } catch (e) {
        if (!ignore) {
          setError(e.message || "Failed to load settings");
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, [dispatch, navigate, savedToken, storeUser]);

  /* ---------------- profile ---------------- */

  function onChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const data = await api.put("/auth/me", {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
      });

      const user = data?.user;
      if (!user) throw new Error("No user data returned");

      dispatch(setCredentials({ user, token: savedToken }));
      setNotice("Profile updated successfully.");
    } catch (e2) {
      setError(e2.message || "Update failed");
    } finally {
      setSaving(false);
    }
  }

  /* ---------------- password ---------------- */

  const strongEnough =
    pwd.newPassword.length >= 8 &&
    /[A-Za-z]/.test(pwd.newPassword) &&
    /\d/.test(pwd.newPassword);

  const matches = pwd.newPassword && pwd.newPassword === pwd.confirmPassword;

  function onPwdChange(e) {
    const { name, value } = e.target;
    setPwd((p) => ({ ...p, [name]: value }));
    setPwdError("");
    setPwdNotice("");
  }

  async function onPwdSubmit(e) {
    e.preventDefault();
    if (pwdSaving) return;

    // quick client-side checks
    if (!pwd.currentPassword || !pwd.newPassword || !pwd.confirmPassword) {
      setPwdError("All password fields are required.");
      return;
    }
    if (!strongEnough) {
      setPwdError(
        "New password must be at least 8 characters and include letters and numbers."
      );
      return;
    }
    if (!matches) {
      setPwdError("New password and confirmation do not match.");
      return;
    }

    setPwdSaving(true);
    setPwdError("");
    setPwdNotice("");

    try {
      await api.post("/auth/change-password", {
        currentPassword: pwd.currentPassword,
        newPassword: pwd.newPassword,
      });

      setPwdNotice("Password updated successfully.");
      setPwd({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (e2) {
      setPwdError(e2?.message || "Could not change password.");
    } finally {
      setPwdSaving(false);
    }
  }

  /* ---------------- render ---------------- */

  if (loading) {
    return (
      <Shell>
        <div className="h-40 rounded-2xl bg-white border border-[#1F2421]/10 animate-pulse" />
      </Shell>
    );
  }
  if (error) {
    return (
      <Shell>
        <Banner type="error" text={error} />
        <div className="mt-4">
          <button
            className="px-4 py-2 rounded-xl bg-[#1F2421] text-[#F7F5F2]"
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <header className="mb-6">
        <h1 className="text-2xl font-serif font-bold">Settings</h1>
        <p className="text-sm text-[#1F2421]/60">
          Update your profile and secure your account.
        </p>
      </header>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Profile card */}
        <Paper className="p-6">
          <h2 className="text-lg font-semibold font-serif">Profile</h2>
          <p className="text-sm text-[#1F2421]/60 mb-4">
            Your public name and contact email.
          </p>

          {notice && <Banner type="success" text={notice} className="mb-4" />}
          {error && <Banner type="error" text={error} className="mb-4" />}

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-3">
              <LabeledInput
                label="First name"
                name="firstName"
                value={form.firstName}
                onChange={onChange}
                placeholder="First name"
              />
              <LabeledInput
                label="Last name"
                name="lastName"
                value={form.lastName}
                onChange={onChange}
                placeholder="Last name"
              />
            </div>

            <LabeledInput
              label="Email"
              name="email"
              value={form.email}
              onChange={onChange}
              disabled
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="px-4 py-2 rounded-xl bg-white border border-[#1F2421]/10"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1F2421] text-[#F7F5F2] hover:bg-[#1F2421]/90 disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-[#F7F5F2]/40 border-t-[#F7F5F2] rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave /> Save changes
                  </>
                )}
              </button>
            </div>
          </form>
        </Paper>

        {/* Security card */}
        <Paper className="p-6">
          <h2 className="text-lg font-semibold font-serif flex items-center gap-2">
            <FaKey /> Security
          </h2>
          <p className="text-sm text-[#1F2421]/60 mb-4">
            Change your password. Use at least 8 characters with letters and numbers.
          </p>

          {pwdNotice ? (
            <Banner type="success" text={pwdNotice} className="mb-4" />
          ) : pwdError ? (
            <Banner type="error" text={pwdError} className="mb-4" />
          ) : null}

          <form onSubmit={onPwdSubmit} className="space-y-4">
            <PasswordInput
              label="Current password"
              name="currentPassword"
              value={pwd.currentPassword}
              onChange={onPwdChange}
              show={show.current}
              onToggle={() => setShow((s) => ({ ...s, current: !s.current }))}
            />
            <PasswordInput
              label="New password"
              name="newPassword"
              value={pwd.newPassword}
              onChange={onPwdChange}
              show={show.next}
              onToggle={() => setShow((s) => ({ ...s, next: !s.next }))}
              hint={
                pwd.newPassword
                  ? strongEnough
                    ? "Strength: good"
                    : "Use at least 8 characters, include letters and numbers."
                  : ""
              }
            />
            <PasswordInput
              label="Confirm new password"
              name="confirmPassword"
              value={pwd.confirmPassword}
              onChange={onPwdChange}
              show={show.confirm}
              onToggle={() => setShow((s) => ({ ...s, confirm: !s.confirm }))}
              hint={
                pwd.confirmPassword
                  ? matches
                    ? "Passwords match."
                    : "Does not match."
                  : ""
              }
            />

            <div className="flex items-center justify-end">
              <button
                type="submit"
                disabled={pwdSaving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1F2421] text-[#F7F5F2] hover:bg-[#1F2421]/90 disabled:opacity-60"
              >
                {pwdSaving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-[#F7F5F2]/40 border-t-[#F7F5F2] rounded-full animate-spin" />
                    Updating…
                  </>
                ) : (
                  <>
                    <FaKey /> Update password
                  </>
                )}
              </button>
            </div>
          </form>
        </Paper>
      </div>
    </Shell>
  );
}

/* ---------- tiny UI helpers ---------- */

function Shell({ children }) {
  return (
    <div
      className="min-h-screen text-[#1F2421]"
      style={{ background: "linear-gradient(180deg, #F7F5F2 0%, #F3F1EC 100%)" }}
    >
      <div className="max-w-5xl mx-auto px-4 py-8">{children}</div>
    </div>
  );
}

function Paper({ children, className = "" }) {
  return (
    <div
      className={`rounded-2xl bg-[#FCFBF9] border border-[#1F2421]/10 shadow-[0_6px_20px_rgba(31,36,33,0.05)] ${className}`}
      style={{
        backgroundImage:
          "radial-gradient(#ffffff 1px, transparent 1px), radial-gradient(#ffffff 1px, transparent 1px)",
        backgroundSize: "8px 8px, 8px 8px",
        backgroundPosition: "0 0, 4px 4px",
      }}
    >
      {children}
    </div>
  );
}

function LabeledInput({ label, hint, ...props }) {
  return (
    <label className="block">
      <span className="block text-sm mb-1 text-[#1F2421]/80">{label}</span>
      <input
        {...props}
        className="w-full px-4 py-3 rounded-xl bg-white border border-[#1F2421]/10 focus:outline-none focus:ring-2 focus:ring-[#1F2421]/20 disabled:bg-[#F2F1EE]"
      />
      {hint ? (
        <span className="mt-1 block text-xs text-[#1F2421]/50">{hint}</span>
      ) : null}
    </label>
  );
}

function PasswordInput({ label, show, onToggle, hint, ...props }) {
  return (
    <label className="block">
      <span className="block text-sm mb-1 text-[#1F2421]/80">{label}</span>
      <div className="relative">
        <input
          {...props}
          type={show ? "text" : "password"}
          className="w-full px-4 py-3 pr-11 rounded-xl bg-white border border-[#1F2421]/10 focus:outline-none focus:ring-2 focus:ring-[#1F2421]/20"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1F2421]/60 hover:text-[#1F2421]"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
      {hint ? (
        <span className="mt-1 block text-xs text-[#1F2421]/50">{hint}</span>
      ) : null}
    </label>
  );
}

function Banner({ type = "info", text, className = "" }) {
  const styles =
    type === "success"
      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
      : type === "error"
      ? "bg-rose-50 border-rose-200 text-rose-800"
      : "bg-[#FFF9E6] border-[#F0E6BF] text-[#6B5E32]";
  return (
    <div
      className={`rounded-xl border px-4 py-3 text-sm ${styles} ${className}`}
      role={type === "error" ? "alert" : "status"}
    >
      {text}
    </div>
  );
}

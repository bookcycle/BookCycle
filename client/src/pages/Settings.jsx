import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials } from "../features/auth/authSlice";
import { api } from "../lib/api";
import { useNavigate } from "react-router-dom";
import { FaSave } from "react-icons/fa";

export default function SettingsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user: storeUser, token } = useSelector((s) => s.auth);

  const savedToken = token || localStorage.getItem("ptb_token");

  const [loading, setLoading] = useState(!storeUser);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "" });
  const [saving, setSaving] = useState(false);

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

  function onChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");

    try {
      const data = await api.put("/auth/me", {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
      });

      const user = data?.user;
      if (!user) throw new Error("No user data returned");

      dispatch(setCredentials({ user, token: savedToken }));
      alert("Profile updated!");
    } catch (e2) {
      setError(e2.message || "Update failed");
    } finally {
      setSaving(false);
    }
  }

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
        <div className="bg-white border border-[#1F2421]/10 rounded-2xl p-6 text-center">
          <p className="mb-3 text-[#1F2421]">⚠️ {error}</p>
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
      <div className="max-w-xl mx-auto">
        <Paper className="p-6">
          <form onSubmit={onSubmit} className="space-y-5">
            {/* Names */}
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

            <LabeledInput label="Email" name="email" value={form.email} onChange={onChange} disabled />

            <div className="flex items-center justify-end gap-2">
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

function LabeledInput({ label, ...props }) {
  return (
    <label className="block">
      <span className="block text-sm mb-1 text-[#1F2421]/80">{label}</span>
      <input
        {...props}
        className="w-full px-4 py-3 rounded-xl bg-white border border-[#1F2421]/10 focus:outline-none focus:ring-2 focus:ring-[#1F2421]/20 disabled:bg-[#F2F1EE]"
      />
    </label>
  );
}

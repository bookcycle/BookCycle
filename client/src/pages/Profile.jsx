import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials } from "../features/auth/authSlice";
import { api } from "../lib/api";
import { useNavigate } from "react-router-dom";
import UploadBookModal from "../components/UploadBookModal";

export default function ProfilePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user: storeUser, token } = useSelector((s) => s.auth);

  const savedToken = useMemo(
    () => token || localStorage.getItem("ptb_token"),
    //if token changes only then useMemo() hook will update; otherwise stays same
    [token]
  );

  const [loading, setLoading] = useState(!storeUser);
  const [error, setError] = useState("");
  const [openUpload, setOpenUpload] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function fetchMe() {
      if (!savedToken) {
        navigate("/login?redirect=/profile", { replace: true });
        return;
      }
      if (storeUser) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await api.get("/auth/me");
        if (ignore) return;
        //.? is optional chaining operator
        const user = data?.user;
        if (!user) throw new Error("No user data returned");
        dispatch(setCredentials({ user, token: savedToken }));
        setLoading(false);
      } catch (e) {
        if (!ignore) {
          setError(e.message || "Failed to load profile");
          setLoading(false);
        }
      }
    }

    fetchMe();
    return () => {
      ignore = true;
    };
  }, [dispatch, navigate, savedToken, storeUser]);

  const user = storeUser;

  if (loading) return <Skeleton />;
  if (error) return <ErrorCard error={error} />;

  const initials =
    (user?.firstName?.[0] || "?") + (user?.lastName?.[0] || "");
  const joined = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString()
    : "—";

  return (
    <div
      className="min-h-screen text-[#1F2421]"
      style={{ background: "linear-gradient(180deg, #F7F5F2 0%, #F3F1EC 100%)" }}
    >
      <main className="max-w-6xl mx-auto px-4 py-10 md:py-14">
        {/* Header: identity */}
        <section className="grid lg:grid-cols-[1.3fr_0.7fr] gap-6">
          <PaperCard className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar (initials fallback only) */}
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl bg-[#1F2421] text-[#F7F5F2] grid place-items-center text-3xl font-semibold ring-4 ring-white shadow">
                {initials}
              </div>

              {/* Info */}
              <div className="flex-1">
                <h2 className="text-2xl md:text-3xl font-serif font-bold">
                  {user?.firstName ?? ""} {user?.lastName ?? ""}
                </h2>
                <p className="text-[#1F2421]/70 mt-1 font-medium">
                  {user?.email ?? ""}
                </p>

                <div className="mt-3 text-sm text-[#1F2421]/60">
                  Joined: {joined}
                </div>

                <div className="mt-5">
                  <button
                    onClick={() => navigate("/settings")}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#1F2421]/10 hover:shadow transition"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>
          </PaperCard>

          {/* CTA: Upload books (opens modal; no hardcoded copy besides label) */}
          <PaperCard className="p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-semibold font-serif">Share your books</h3>
              <p className="text-[#1F2421]/70 mt-1">
                List books to borrow, exchange, or give away.
              </p>
            </div>
            <div>
              <button
                onClick={() => setOpenUpload(true)}
                className="w-full mt-6 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#1F2421] text-[#F7F5F2] hover:bg-[#1F2421]/90 transition shadow-sm"
              >
                Upload Books
              </button>
            </div>
          </PaperCard>
        </section>

        {/* Activity (empty state, no hardcoded items) */}
        <section className="grid lg:grid-cols-3 gap-6 mt-8">
          <PaperCard className="p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold font-serif">Recent Activity</h3>
            <EmptyState text="No activity yet." />
          </PaperCard>

          {/* Stats (empty state, ready for real data later) */}
          <PaperCard className="p-6">
            <h3 className="text-lg font-semibold font-serif">Reading Stats</h3>
            <div className="mt-4 space-y-2">
              <StatRow label="Books Borrowed" value="—" />
              <StatRow label="My Shelf" value="—" />
              <StatRow label="Favorites" value="—" />
            </div>
          </PaperCard>
        </section>
      </main>

      {openUpload && (
        <UploadBookModal
          onClose={() => setOpenUpload(false)}
          onSuccess={() => setOpenUpload(false)}
        />
      )}
    </div>
  );
}

/* ========= small UI bits ========= */

function PaperCard({ children, className = "" }) {
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

function StatRow({ label, value }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white border border-[#1F2421]/10">
      <span className="text-[#1F2421]/70">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function EmptyState({ text = "Nothing here yet." }) {
  return (
    <div className="mt-4 px-4 py-10 rounded-xl bg-white border border-[#1F2421]/10 text-center text-[#1F2421]/60">
      {text}
    </div>
  );
}

function Skeleton() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "linear-gradient(180deg,#F7F5F2 0%,#F3F1EC 100%)" }}
    >
      <div className="w-full max-w-5xl p-6 grid gap-6">
        <div className="h-40 rounded-2xl bg-white border border-[#1F2421]/10 animate-pulse" />
        <div className="grid grid-cols-3 gap-6">
          <div className="h-28 rounded-2xl bg-white border border-[#1F2421]/10 animate-pulse" />
          <div className="h-28 rounded-2xl bg-white border border-[#1F2421]/10 animate-pulse" />
          <div className="h-28 rounded-2xl bg-white border border-[#1F2421]/10 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function ErrorCard({ error }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "linear-gradient(180deg,#F7F5F2 0%,#F3F1EC 100%)" }}
    >
      <div className="bg-white border border-[#1F2421]/10 rounded-2xl p-6 max-w-md w-full text-center shadow-sm">
        <p className="mb-3 text-[#1F2421]">⚠️ {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-xl bg-[#1F2421] text-[#F7F5F2] hover:bg-[#1F2421]/90"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

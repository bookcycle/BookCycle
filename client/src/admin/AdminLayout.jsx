import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { BookOpen, XCircle, User, LogOut } from "lucide-react";
import { logout } from "../features/auth/authSlice";

const linkBase =
    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden";
const linkActive =
    "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg transform scale-105";
const linkIdle =
    "text-slate-400 hover:text-white hover:bg-slate-700/50 hover:transform hover:scale-102";

export default function AdminLayout() {
    const { user } = useSelector((s) => s.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        try {
            localStorage.removeItem("ptb_token");

            dispatch(logout());


            navigate("/login?redirect=/admin", { replace: true });
        } catch {
            navigate("/login", { replace: true });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Animated background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            {/* Shell: sidebar + content */}
            <div className="relative z-10 mx-auto max-w-[1600px] grid grid-cols-[280px_1fr] gap-6 p-6">
                {/* Sidebar */}
                <aside className="h-[calc(100vh-3rem)] sticky top-6 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-2xl flex flex-col">
                    {/* Logo */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <div className="text-white font-bold text-xl tracking-tight">
                                    Book
                                </div>
                                <div className="text-slate-400 text-xs font-medium">
                                    Admin Console
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* User Profile */}
                    <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-slate-700/30 to-slate-600/30 border border-slate-600/30">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                                <User className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-white font-semibold text-sm truncate">
                                    {user?.firstName} {user?.lastName}
                                </div>
                                <div className="text-slate-400 text-xs truncate">
                                    {user?.email}
                                </div>
                                <div className="inline-flex items-center gap-1 mt-1">
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                                    <span className="text-emerald-400 text-xs font-medium uppercase tracking-wide">
                                        {user?.role || "Admin"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex flex-col gap-2 mb-8">
                        <div className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-3 px-4">
                            Navigation
                        </div>



                        <NavLink
                            to="/admin/pending"
                            className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}
                        >
                            <BookOpen size={20} className="flex-shrink-0" />
                            <span className="font-medium">Pending Reviews</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 to-purple-600/0 group-hover:from-indigo-500/10 group-hover:to-purple-600/10 transition-all duration-300"></div>
                        </NavLink>

                        <NavLink
                            to="/admin/rejected"
                            className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}
                        >
                            <XCircle size={20} className="flex-shrink-0" />
                            <span className="font-medium">Rejected Items</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 to-purple-600/0 group-hover:from-indigo-500/10 group-hover:to-purple-600/10 transition-all duration-300"></div>
                        </NavLink>
                    </nav>

                    {/* Bottom actions */}
                    <div className="mt-auto pt-6 border-t border-slate-700/50 space-y-3">
                        <button
                            onClick={handleLogout}
                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-100 border border-slate-600/60 transition-all"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="font-medium">Logout</span>
                        </button>

                        <div className="text-slate-500 text-xs text-center font-medium tracking-wide">
                            Connecting readers
                        </div>
                        <div className="flex justify-center gap-1">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-300"></div>
                            <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse delay-700"></div>
                        </div>
                    </div>
                </aside>

                {/* Content */}
                <main className="flex flex-col min-h-[calc(100vh-3rem)]">
                    <div className="flex-1 bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-200/20 overflow-hidden">
                        <div className="p-8 h-full">
                            <Outlet />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

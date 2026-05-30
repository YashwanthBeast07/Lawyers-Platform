"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { useRouter } from "next/navigation";
import { logoutThunk } from "@/lib/store/authSlice";

interface NavItem {
  label: string;
  href: string;
  badge?: number;
  icon: React.ReactNode;
}

// ── Icons ──────────────────────────────────────────────────────────────────────
const DashboardIcon = () => (
  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
  </svg>
);

const CasesIcon = () => (
  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
);

const PaymentsIcon = () => (
  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
  </svg>
);

const BellIcon = () => (
  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
  </svg>
);

const ProfileIcon = () => (
  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
  </svg>
);

const AdminIcon = () => (
  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
);

const VerifyIcon = () => (
  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// ── Nav data ───────────────────────────────────────────────────────────────────

const CLIENT_NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <DashboardIcon /> },
  { label: "My Cases", href: "/cases", icon: <CasesIcon /> },
  { label: "Appointments", href: "/appointments", icon: <CalendarIcon /> },
  { label: "Payments", href: "/payments", icon: <PaymentsIcon /> },
  { label: "Notifications", href: "/notifications", icon: <BellIcon /> },
];

const ADMIN_NAV: NavItem[] = [
  { label: "Admin Dashboard", href: "/admin", icon: <AdminIcon /> },
  { label: "Lawyer Verifications", href: "/admin/verifications", icon: <VerifyIcon /> },
];

const BOTTOM_NAV: NavItem[] = [
  { label: "Profile", href: "/profile", icon: <ProfileIcon /> },
  { label: "Settings", href: "/settings", icon: <SettingsIcon /> },
];

// ── Component ──────────────────────────────────────────────────────────────────

export default function Sidebar({ onClose, className }: { onClose?: () => void; className?: string }) {
  const pathname = usePathname();
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const isAdmin = user?.role === "ADMIN";
  const navItems = isAdmin ? ADMIN_NAV : CLIENT_NAV;

  const fullName = user?.fullName || "User";
  const initials = fullName.substring(0, 2).toUpperCase();
  const role = user?.role || "GUEST";

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    router.push("/login");
  };

  const NavLink = ({ item }: { item: NavItem }) => {
    const active =
      pathname === item.href ||
      (item.href !== "/dashboard" && item.href !== "/admin" && pathname.startsWith(item.href + "/")) ||
      (item.href === "/dashboard" && pathname === "/dashboard") ||
      (item.href === "/admin" && pathname === "/admin");

    return (
      <Link
        href={item.href}
        onClick={onClose}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative ${
          active
            ? "text-white"
            : "text-white/50 hover:text-white/85 hover:bg-white/5"
        }`}
        style={
          active
            ? {
                background:
                  "linear-gradient(90deg, rgba(201,168,76,0.18) 0%, rgba(201,168,76,0.06) 100%)",
                borderLeft: "2px solid var(--gold)",
              }
            : { borderLeft: "2px solid transparent" }
        }
      >
        <span
          className={`transition-colors ${
            active ? "text-[#C9A84C]" : "text-white/40 group-hover:text-white/65"
          }`}
        >
          {item.icon}
        </span>
        <span className="flex-1 leading-none">{item.label}</span>
        {item.badge && (
          <span
            className="text-[10px] font-black px-1.5 py-0.5 rounded-full flex-shrink-0"
            style={{
              background: "var(--gold)",
              color: "var(--navy)",
            }}
          >
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <aside
      className={`w-[230px] flex flex-col min-h-screen flex-shrink-0 ${className ?? ""}`}
      style={{ background: "var(--navy)", borderRight: "1px solid rgba(255,255,255,0.06)" }}
    >
      {/* Logo */}
      <div
        className="px-5 h-16 flex items-center flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <Link
          href="/"
          onClick={onClose}
          className="flex items-center gap-1 text-xl font-black text-white"
        >
          Go<span style={{ color: "var(--gold)" }}>Lawyers</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-6 overflow-y-auto">
        {/* Main menu */}
        <div className="space-y-0.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/25 px-3 mb-3">
            Main Menu
          </p>
          {navItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </div>

        {/* Bottom nav */}
        <div
          className="space-y-0.5 pt-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/25 px-3 mb-3">
            Account
          </p>
          {BOTTOM_NAV.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-red-400 hover:bg-red-500/8 transition-all duration-150"
            style={{ borderLeft: "2px solid transparent" }}
          >
            <span className="text-white/40">
              <LogoutIcon />
            </span>
            Sign Out
          </button>
        </div>
      </nav>

      {/* User Profile Card */}
      <div
        className="px-3 py-4 flex-shrink-0"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div
          className="flex items-center gap-3 px-3 py-3 rounded-xl"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, var(--gold-dark), var(--gold))",
              color: "var(--navy)",
              boxShadow: "0 2px 8px rgba(201,168,76,0.3)",
            }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate leading-tight">
              {fullName}
            </p>
            <p
              className="text-[10px] font-bold uppercase tracking-wide mt-0.5 truncate"
              style={{ color: "var(--gold)" }}
            >
              {role === "LAWYER" && user?.isVerified ? "✓ Verified Lawyer" : role}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

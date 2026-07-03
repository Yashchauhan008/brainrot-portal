"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearSession, useSession } from "@/lib/auth";
import BrainLogo from "@/components/BrainLogo";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/friends", label: "Friends" },
  { href: "/settings", label: "Settings" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const session = useSession();

  if (!session) return null;

  function logout() {
    clearSession();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-borderline bg-background/80 backdrop-blur">
      <nav className="relative mx-auto flex max-w-5xl items-center gap-4 px-6 py-3">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold">
          <BrainLogo size={24} />
          <span>BrainRot</span>
        </Link>

        <div className="flex items-center gap-1 sm:hidden">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                pathname.startsWith(link.href)
                  ? "bg-surface-2 text-primary"
                  : "text-muted hover:text-secondary"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-full border border-borderline bg-surface p-1 sm:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                pathname.startsWith(link.href)
                  ? "border border-borderline bg-surface-2 text-primary"
                  : "border border-transparent text-muted hover:text-secondary"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-3">
          <span className="hidden text-sm text-secondary sm:block">
            {session.user.name}
          </span>
          <button onClick={logout} className="btn-ghost !px-4 !py-1.5 text-xs">
            Logout
          </button>
        </div>
      </nav>
    </header>
  );
}

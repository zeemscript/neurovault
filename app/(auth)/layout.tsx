export const dynamic = "force-dynamic";

import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Minimal header with logo */}
      <div className="absolute top-6 left-6 z-50">
        <Link
          href="/"
          className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent"
        >
          NeuroVault
        </Link>
      </div>
      {children}
    </div>
  );
}

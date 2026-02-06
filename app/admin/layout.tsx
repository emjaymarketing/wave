import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { AdminSidebar } from "@/components/admin-sidebar";
import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full flex justify-between items-center p-3 px-5 text-sm">
          <div className="flex gap-5 items-center font-semibold">
            <Link href="/" className="flex items-center">
              <Image
                src="/wave-logo.png"
                alt="Wave"
                width={120} // adjust to your logo
                height={40} // adjust to your logo
                priority
              />
            </Link>
            <span className="text-muted-foreground">|</span>

            <Link href="/admin">Admin</Link>
          </div>
          <Suspense>
            <AuthButton />
          </Suspense>
        </div>
      </nav>
      <div className="flex flex-1">
        <Suspense>
          <AdminSidebar />
        </Suspense>
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-8 h-full">{children}</div>
        </main>
      </div>
      <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-4">
        <ThemeSwitcher />
      </footer>
    </div>
  );
}

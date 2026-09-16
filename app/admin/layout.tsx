'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Heading } from '@/components/ui';

const adminNav = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Products', href: '/admin/products' },
  { label: 'Bake Sessions', href: '/admin/bake-sessions' },
  { label: 'Orders', href: '/admin/orders' },
  { label: 'Testimonials', href: '/admin/testimonials' },
  { label: 'Settings', href: '/admin/settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <div className="min-h-svh bg-background">
      <div className="layout-container py-8 md:py-12">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Heading level={1}>Admin</Heading>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="font-body text-small font-medium text-secondary hover:text-primary"
            >
              ← Back to site
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="font-body text-small font-medium text-secondary hover:text-primary"
            >
              Log out
            </button>
          </div>
        </div>
        <div className="grid gap-8 md:grid-cols-[240px_1fr]">
          <nav aria-label="Admin navigation" className="flex flex-col gap-2">
            {adminNav.map((link) => {
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg border px-4 py-3 font-body text-small font-medium transition-colors ${
                    isActive
                      ? 'border-button bg-button text-button-text'
                      : 'border-surfaceBorder bg-background text-primary hover:border-button hover:bg-accent/10'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}

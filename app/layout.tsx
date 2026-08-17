import type { Metadata } from 'next';
import { Lora, Montserrat } from 'next/font/google';
import NextTopLoader from 'nextjs-toploader';
import { CartDrawer, CartFlyover } from '@/components/cart';
import { AppShell } from '@/components/layout/AppShell';
import { CartProvider } from '@/context/CartContext';
import './globals.css';

const lora = Lora({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-lora',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-montserrat',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Izy's Sourdough",
  description: 'Mobile-first sourdough preorder website for a local micro-bakery.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${lora.variable} ${montserrat.variable}`}>
      <body className="bg-background font-body text-body text-primary">
        <NextTopLoader color="#5D5344" height={3} showSpinner={false} />
        <CartProvider>
          <AppShell>{children}</AppShell>
          <CartDrawer />
          <CartFlyover />
        </CartProvider>
      </body>
    </html>
  );
}


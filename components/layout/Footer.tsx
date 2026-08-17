import Link from 'next/link';
import { Button, InputField, Text } from '@/components/ui';

const footerLinks = [
  { label: 'Home', href: '/' },
  { label: 'Menu', href: '/menu' },
  { label: 'About', href: '/about' },
  { label: 'FAQ', href: '/faq' },
];

const footerClasses = 'border-t border-surfaceBorder bg-background-soft';
const innerClasses = 'layout-container grid gap-10 py-12 md:grid-cols-[1.2fr_0.7fr_0.9fr_1.2fr] md:gap-8 lg:py-16';
const brandClasses = 'flex max-w-sm flex-col gap-3';
const logoClasses = 'font-heading text-h3 font-bold tracking-[0.08em] text-primary';
const sectionClasses = 'flex flex-col gap-3';
const sectionTitleClasses = 'font-body text-small font-medium uppercase tracking-[0.18em] text-secondary';
const navClasses = 'flex flex-col items-start gap-3';
const linkClasses = 'rounded-lg font-body text-small font-medium text-primary transition-colors duration-200 hover:text-secondary';
const detailListClasses = 'grid gap-2';
const detailClasses = 'font-body text-small text-primary';
const formClasses = 'grid gap-3';
const finePrintClasses = 'border-t border-surfaceBorder py-5';
const finePrintInnerClasses = 'layout-container flex flex-col gap-2 font-body text-small text-primary/90 sm:flex-row sm:items-center sm:justify-between';

export function Footer() {
  return (
    <footer className={footerClasses}>
      <div className={innerClasses}>
        <section className={brandClasses} aria-label="Bakery information">
          <Link href="/" className={logoClasses}>
            IZY&apos;S SOURDOUGH
          </Link>
          <Text size="small" className="text-primary/90">
            Small-batch artisan sourdough baked fresh weekly for local pickup.
          </Text>
        </section>

        <nav className={sectionClasses} aria-label="Footer navigation">
          <p className={sectionTitleClasses}>Explore</p>
          <div className={navClasses}>
            {footerLinks.map((link) => (
              <Link key={link.href} href={link.href} className={linkClasses}>
                {link.label}
              </Link>
            ))}
          </div>
        </nav>

        <section className={sectionClasses} aria-label="Pickup information">
          <p className={sectionTitleClasses}>Pickup</p>
          <div className={detailListClasses}>
            <p className={detailClasses}>Wednesday Pickup</p>
            <p className={detailClasses}>Zephyrhills, Florida</p>
            <p className={detailClasses}>Pickup details sent after ordering</p>
          </div>
        </section>

        <section className={sectionClasses} aria-labelledby="footer-signup-heading">
          <p id="footer-signup-heading" className={sectionTitleClasses}>
            Stay Updated
          </p>
          <Text size="small" className="text-primary/90">
            Get weekly menu updates and pickup announcements.
          </Text>
          <form className={formClasses}>
            <InputField label="Email address" name="email" type="email" placeholder="you@example.com" className="!bg-background-soft" />
            <Button type="submit" fullWidth>
              Subscribe
            </Button>
          </form>
        </section>
      </div>

      <div className={finePrintClasses}>
        <div className={finePrintInnerClasses}>
          <p>© 2026 Izy&apos;s Sourdough.</p>
          <p>Handcrafted in small batches for local pickup.</p>
        </div>
      </div>
    </footer>
  );
}

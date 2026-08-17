import Link from 'next/link';
import { Button } from '@/components/ui';

export type NavigationLink = {
  label: string;
  href: string;
};

type MobileMenuProps = {
  links: NavigationLink[];
  isOpen: boolean;
  onLinkClick: () => void;
};

const panelClasses = 'absolute inset-x-0 top-full z-50 border-t border-surfaceBorder bg-background md:hidden';
const menuClasses = 'layout-container flex flex-col gap-3 py-4';
const linkClasses = 'rounded-lg px-2 py-3 font-body text-small font-medium text-primary transition-colors duration-200 hover:text-secondary';

export function MobileMenu({ links, isOpen, onLinkClick }: MobileMenuProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        className="absolute inset-x-0 top-full z-40 h-screen cursor-default"
        onClick={onLinkClick}
        aria-label="Close navigation menu"
      />
      <div className={panelClasses} id="mobile-navigation">
        <nav className={menuClasses} aria-label="Mobile navigation">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={linkClasses} onClick={onLinkClick}>
              {link.label}
            </Link>
          ))}
          <Link href="/menu" onClick={onLinkClick}>
            <Button fullWidth>Order Now</Button>
          </Link>
        </nav>
      </div>
    </>
  );
}

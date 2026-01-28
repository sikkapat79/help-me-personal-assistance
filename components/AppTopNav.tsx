'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LogoutButton } from '@/components/LogoutButton';
import { TaskCreateModal } from '@/components/TaskCreateModal';

interface NavLink {
  href: string;
  label: string;
}

const navLinks: NavLink[] = [
  { href: '/', label: 'Today' },
  { href: '/calibration', label: 'Calibration' },
];

interface AppTopNavProps {
  readonly profileName: string | null;
}

export function AppTopNav({ profileName }: AppTopNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActiveLink = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav
      id='app-top-nav'
      className='sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60'
    >
      <div className='container mx-auto max-w-5xl px-4 sm:px-6'>
        <div className='flex h-16 items-center justify-between'>
          {/* Brand + Desktop Nav */}
          <div className='flex items-center gap-6'>
            <Link
              href='/'
              id='nav-brand'
              className='text-xl font-bold text-primary hover:opacity-80 transition-opacity'
            >
              HelpMe
            </Link>

            {/* Desktop Navigation Links */}
            <div className='hidden sm:flex sm:gap-4'>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  id={`nav-link-${link.href.replace('/', '') || 'home'}`}
                  className={cn(
                    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActiveLink(link.href)
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right side actions */}
          <div className='flex items-center gap-3'>
            {/* Profile Name (desktop only) */}
            {profileName && (
              <span className='hidden sm:inline text-sm text-muted-foreground'>
                {profileName}
              </span>
            )}

            {/* Task Create Modal (only on home page) */}
            {pathname === '/' && (
              <div className='hidden sm:block'>
                <TaskCreateModal />
              </div>
            )}

            {/* Logout Button (desktop) */}
            <div className='hidden sm:block'>
              <LogoutButton />
            </div>

            {/* Mobile Menu Button */}
            <button
              id='mobile-menu-button'
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className='sm:hidden rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring'
              aria-expanded={mobileMenuOpen}
              aria-controls='mobile-menu'
              aria-label='Toggle menu'
            >
              {mobileMenuOpen ? (
                <X className='h-6 w-6' />
              ) : (
                <Menu className='h-6 w-6' />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div
            id='mobile-menu'
            className='border-t border-border py-4 sm:hidden'
          >
            <div className='space-y-1'>
              {/* Profile Name */}
              {profileName && (
                <div className='px-3 py-2 text-sm font-medium text-muted-foreground'>
                  {profileName}
                </div>
              )}

              {/* Nav Links */}
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'block rounded-md px-3 py-2 text-base font-medium transition-colors',
                    isActiveLink(link.href)
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  )}
                >
                  {link.label}
                </Link>
              ))}

              {/* Task Create Modal (only on home page) */}
              {pathname === '/' && (
                <div className='px-3 py-2'>
                  <TaskCreateModal />
                </div>
              )}

              {/* Logout */}
              <div className='px-3 py-2'>
                <LogoutButton />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

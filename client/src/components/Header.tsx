import { Link, useLocation } from "wouter";
import { useLanguage } from "../contexts/LanguageContext";
import LanguageToggle from "./LanguageToggle";
import { Menu, X, Bell, User, LogOut, LogIn, Shield } from "lucide-react"; // Added icons
import React, { useEffect, useState } from "react";
import NotificationBar from "./NotificationBar"; 
import { apiGet, apiPost } from "@/lib/api";

// --- ADDED: Self-contained Button component to resolve import error ---
const Button = ({ children, className, variant, size, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'outline' | 'ghost' | 'default', size?: 'sm' | 'icon' | 'default' }) => {
  const baseStyle = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";
  
  const sizeStyles = {
    default: "h-10 py-2 px-4",
    sm: "h-9 px-3 rounded-md",
    icon: "h-10 w-10",
  };

  const variantStyles = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    outline: "border border-input hover:bg-accent hover:text-accent-foreground",
  };

  const sizeClass = sizeStyles[size || 'default'];
  const variantClass = variantStyles[variant || 'default'];

  return (
    <button className={`${baseStyle} ${sizeClass} ${variantClass} ${className}`} {...props}>
      {children}
    </button>
  );
};

type SessionUser = { id: string; username: string; role: 'citizen' | 'governmental' } | null;

export default function Header() {
  const { t } = useLanguage();
  const [location, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [user, setUser] = useState<SessionUser>(null);

  useEffect(() => {
    let cancelled = false;
    const refetch = async () => {
      try {
        const data = await apiGet<any>('/api/auth/me');
        if (!cancelled) setUser(data);
      } catch {
        if (!cancelled) setUser(null);
      }
    };
    refetch();
    const onAuthChange = () => refetch();
    window.addEventListener('auth:changed', onAuthChange);
    return () => { cancelled = true; window.removeEventListener('auth:changed', onAuthChange); };
  }, []);
  
  const navItems = [
    { href: "/projects", labelBn: "প্রকল্প", labelEn: "Projects" },
    { href: "/events", labelBn: "ইভেন্ট", labelEn: "Events" },
    { href: "/threads", labelBn: "আলোচনা", labelEn: "Threads" },
    { href: "/service-locator", labelBn: "পরিষেবা কেন্দ্র", labelEn: "Service Locator" },
    { href: "/info", labelBn: "তথ্য কেন্দ্র", labelEn: "Information Desk" },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      setUser(null);
      window.dispatchEvent(new Event('auth:changed'));
      setLocation('/');
    } catch {}
  };

  return (
    <>
      <nav className="bg-card/95 backdrop-blur-sm shadow-lg border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-[auto,1fr,auto] items-center h-16 gap-8">
            {/* Logo */}
            <Link href="/" className="flex items-center animate-fade-in flex-shrink-0">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-primary" data-testid="logo">
                  {t("সিভিকমঞ্চ", "CivicMoncho")}
                </h1>
                <p className="text-xs text-muted-foreground -mt-1">
                  {t("নাগরিক সেবা প্ল্যাটফর্ম", "Civic Service Platform")}
                </p>
              </div>
            </Link>

            {/* Center: Desktop Navigation (centered, links only) */}
            <div className="hidden md:flex items-center justify-start col-start-2 overflow-hidden">
              <div className="flex items-center justify-start gap-2 whitespace-nowrap px-1 overflow-hidden">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`nav-link px-1.5 py-2 text-sm font-medium transition-all duration-300 relative whitespace-nowrap ${
                      location === item.href
                        ? "text-primary"
                        : "text-foreground hover:text-primary"
                    }`}
                    data-testid={`nav-${item.href.slice(1) || "home"}`}
                  >
                    {t(item.labelBn, item.labelEn)}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right: Auth buttons + Actions */}
            <div className="flex items-center justify-end gap-2 col-start-3">
              {/* Desktop auth controls */}
              <div className="hidden md:flex items-center gap-2">
                {user ? (
                  <>
                    {user.role === 'governmental' && (
                      <Link href="/account-approval">
                        <Button 
                          variant="outline"
                          size="sm"
                          className="whitespace-nowrap"
                          data-testid="approval-button"
                        >
                          <Shield className="w-4 h-4 mr-1" />
                          {t("অ্যাকাউন্ট অনুমোদন", "Account Approval")}
                        </Button>
                      </Link>
                    )}
                    <Link href="/myprofile">
                      <Button 
                        size="sm"
                        className="whitespace-nowrap"
                        data-testid="profile-button"
                      >
                        <User className="w-4 h-4 mr-1" />
                        {t("আমার প্রোফাইল", "My Profile")}
                      </Button>
                    </Link>
                    <Button 
                      variant="outline"
                      size="sm"
                      className="whitespace-nowrap"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4 mr-1" />
                      {t("লগআউট", "Logout")}
                    </Button>
                  </>
                ) : (
                  <Link href="/login">
                    <Button 
                      size="sm"
                      className="whitespace-nowrap"
                      data-testid="login-button"
                    >
                      <LogIn className="w-4 h-4 mr-1" />
                      {t("লগইন", "Login")}
                    </Button>
                  </Link>
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsNotificationPanelOpen(true)}
                aria-label={t("বিজ্ঞপ্তি দেখুন", "View notifications")}
                data-testid="notification-button"
              >
                <Bell className="h-6 w-6" />
              </Button>
              
              <LanguageToggle />
              
              <div className="md:hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  data-testid="mobile-menu-button"
                >
                  {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden animate-fade-in">
              <div className="px-2 pt-2 pb-3 space-y-1 border-t border-border">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block px-3 py-2 text-base font-medium transition-colors ${
                      location === item.href
                        ? "text-primary bg-primary/10"
                        : "text-foreground hover:text-primary hover:bg-muted"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    data-testid={`mobile-nav-${item.href.slice(1) || "home"}`}
                  >
                    {t(item.labelBn, item.labelEn)}
                  </Link>
                ))}
                {user ? (
                  <>
                    <Link href="/myprofile" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button 
                        className="w-full mt-2"
                        data-testid="mobile-profile-button"
                      >
                         <User className="w-4 h-4 mr-2" />
                        {t("আমার প্রোফাইল", "My Profile")}
                      </Button>
                    </Link>
                    {user.role === 'governmental' && (
                      <Link href="/account-approval" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button 
                          variant="outline"
                          className="w-full mt-2"
                          data-testid="mobile-approval-button"
                        >
                          <Shield className="w-4 h-4 mr-2" />
                          {t("অ্যাকাউন্ট অনুমোদন", "Account Approval")}
                        </Button>
                      </Link>
                    )}
                    <Button 
                      variant="outline"
                      className="w-full mt-2"
                      onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {t("লগআউট", "Logout")}
                    </Button>
                  </>
                ) : (
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button 
                      className="w-full mt-2"
                      data-testid="mobile-login-button"
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      {t("লগইন", "Login")}
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      <NotificationBar
        isOpen={isNotificationPanelOpen}
        onClose={() => setIsNotificationPanelOpen(false)}
      />
    </>
  );
}


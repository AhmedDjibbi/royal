import { useEffect, useState } from 'react';
import {
  BedDouble,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  Compass,
  Gift,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  MessageCircle,
  RefreshCw,
  Sparkles,
  UtensilsCrossed,
  X
} from 'lucide-react';
import { useUser } from '../../context/UserContext.jsx';
import { useHotel } from '../../context/HotelContext.jsx';

const guestNavigation = [
  { view: 'home', label: 'The resort', icon: Compass },
  { view: 'rooms', label: 'Stay', icon: BedDouble },
  { view: 'dining', label: 'Dining', icon: UtensilsCrossed },
  { view: 'activities', label: 'Experiences', icon: Sparkles }
];

const guestAccountNavigation = [
  { view: 'my-stay', label: 'My stay', icon: CalendarDays },
  { view: 'feedback', label: 'Guest care', icon: MessageCircle },
  { view: 'referral', label: 'Rewards', icon: Gift }
];

const adminNavigation = [
  { view: 'admin-dashboard', label: 'Overview', icon: LayoutDashboard },
  { view: 'admin-bookings', label: 'Bookings', icon: ClipboardList },
  { view: 'admin-rooms', label: 'Suites', icon: BedDouble },
  { view: 'admin-dining', label: 'Dining', icon: UtensilsCrossed },
  { view: 'admin-events', label: 'Events', icon: CalendarDays },
  { view: 'admin-feedback', label: 'Guest care', icon: MessageCircle }
];

export const Header = ({ activeView, setActiveView }) => {
  const { user, logout } = useUser();
  const { isOfflineMode, refresh } = useHotel();
  const [menuOpen, setMenuOpen] = useState(false);

  const navigation = user?.role === 'admin'
    ? adminNavigation
    : [...guestNavigation, ...(user ? guestAccountNavigation : [])];

  const goTo = (view) => {
    setActiveView(view);
    setMenuOpen(false);
  };

  const handleAccountAction = () => {
    if (user) {
      logout();
      goTo('home');
      return;
    }
    goTo('auth');
  };

  useEffect(() => {
    if (!menuOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [menuOpen]);

  useEffect(() => {
    const closeOnDesktop = () => {
      if (window.innerWidth >= 1280) setMenuOpen(false);
    };
    window.addEventListener('resize', closeOnDesktop);
    return () => window.removeEventListener('resize', closeOnDesktop);
  }, []);

  const renderNavigationItem = ({ view, label, icon: Icon }, compact = false) => (
    <button
      key={view}
      type="button"
      onClick={() => goTo(view)}
      aria-current={activeView === view ? 'page' : undefined}
      className={`${compact ? 'mobile-nav-item' : 'desktop-nav-item'}${activeView === view ? ' active' : ''}`}
    >
      {compact && <Icon size={17} strokeWidth={1.7} />}
      <span>{label}</span>
      {compact && <ChevronRight className="mobile-nav-chevron" size={15} />}
    </button>
  );

  return (
    <header className={`resort-header${menuOpen ? ' menu-is-open' : ''}`}>
      <div className="resort-header-inner">
        <button type="button" className="resort-brand" onClick={() => goTo('home')} aria-label="Royal Talassa home">
          <span className="resort-brand-logo"><img src="/images/logo.gif" alt="" /></span>
          <span className="resort-brand-copy">
            <strong>ROYAL TALASSA</strong>
            <small>MONASTIR · TUNISIA</small>
          </span>
        </button>

        <nav className="resort-desktop-nav" aria-label={user?.role === 'admin' ? 'Administrator navigation' : 'Main navigation'}>
          {navigation.map((item) => renderNavigationItem(item))}
        </nav>

        <div className="resort-header-actions">
          <button
            type="button"
            className={`resort-sync${isOfflineMode ? ' is-preview' : ''}`}
            onClick={isOfflineMode ? undefined : refresh}
            title={isOfflineMode ? 'Preview data is being used' : 'Refresh resort data'}
            aria-label={isOfflineMode ? 'Preview data mode' : 'Refresh resort data'}
            disabled={isOfflineMode}
          >
            {isOfflineMode ? <span className="sync-dot" /> : <RefreshCw size={15} />}
          </button>

          {!user && (
            <button type="button" className="resort-reserve-button" onClick={() => goTo('rooms')}>
              <span>Reserve</span><CalendarDays size={15} />
            </button>
          )}

          <button type="button" className="resort-account-button" onClick={handleAccountAction}>
            {user ? <LogOut size={15} /> : <LogIn size={15} />}
            <span>{user ? 'Sign out' : 'Sign in'}</span>
          </button>

          <button
            type="button"
            className="resort-menu-toggle"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            aria-controls="resort-mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <>
          <button type="button" className="resort-menu-backdrop" onClick={() => setMenuOpen(false)} aria-label="Close menu" />
          <nav id="resort-mobile-navigation" className="resort-mobile-nav" aria-label="Mobile navigation">
            <div className="mobile-nav-heading">
              <span>{user?.role === 'admin' ? 'HOTEL OPERATIONS' : 'YOUR MEDITERRANEAN ESCAPE'}</span>
              {user && <small>{user.name} · {user.role === 'admin' ? 'Administrator' : 'Guest'}</small>}
            </div>
            <div className="mobile-nav-links">
              {navigation.map((item) => renderNavigationItem(item, true))}
            </div>
            {!user && <button type="button" className="mobile-reserve-button" onClick={() => goTo('rooms')}>Explore your stay <CalendarDays size={16} /></button>}
            <div className="mobile-nav-footer">
              <span><span className={`sync-dot${isOfflineMode ? ' is-preview' : ' is-connected'}`} />{isOfflineMode ? 'Preview data' : 'Resort data connected'}</span>
              {!isOfflineMode && <button type="button" onClick={refresh}><RefreshCw size={14} /> Refresh</button>}
            </div>
          </nav>
        </>
      )}
    </header>
  );
};

export default Header;

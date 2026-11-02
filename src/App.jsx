import { useState } from 'react';
import { UserProvider, useUser } from './context/UserContext.jsx';
import { HotelProvider } from './context/HotelContext.jsx';
import Header from './components/common/Header.jsx';
import Footer from './components/common/Footer.jsx';

// Customer view pages
import Home from './views/customer/Home.jsx';
import Rooms from './views/customer/Rooms.jsx';
import Dining from './views/customer/Dining.jsx';
import Activities from './views/customer/Activities.jsx';
import Feedback from './views/customer/Feedback.jsx';
import Referral from './views/customer/Referral.jsx';
import Auth from './views/customer/Auth.jsx';
import MyStay from './views/customer/MyStay.jsx';

// Admin console pages
import Dashboard from './views/admin/Dashboard.jsx';
import RoomControl from './views/admin/RoomControl.jsx';
import RestaurantControl from './views/admin/RestaurantControl.jsx';
import FeedbackControl from './views/admin/FeedbackControl.jsx';
import BookingControl from './views/admin/BookingControl.jsx';
import EventControl from './views/admin/EventControl.jsx';

// Inside App Wrapper to access User Context and dynamic activeView switcher
function AppContent() {
  const [activeView, setActiveView] = useState('home'); // default guest home
  const [authReturnView, setAuthReturnView] = useState('home');
  const { user, authLoading } = useUser();

  const requireSignIn = (returnView) => {
    setAuthReturnView(returnView);
    setActiveView('auth');
  };

  if (authLoading) return <div className="session-loading">Preparing your guest experience…</div>;

  const adminView = (view, content) => {
    if (user?.role === 'admin') return content;
    if (user) {
      return (
        <div className="admin-page">
          <div className="auth-error" role="alert">This area is for hotel administrators. Your guest account does not have access.</div>
          <button type="button" className="event-publish mt-5 px-5" onClick={() => setActiveView('home')}>Return to the resort</button>
        </div>
      );
    }
    return <Auth onSuccess={(signedInUser) => setActiveView(signedInUser.role === 'admin' ? view : 'home')} />;
  };

  // Dispatch appropriate view element
  const renderActiveView = () => {
    switch (activeView) {
      // Customer Routes
      case 'home':
        return <Home setActiveView={setActiveView} />;
      case 'auth':
        return <Auth onSuccess={(signedInUser) => setActiveView(signedInUser.role === 'admin' ? 'admin-dashboard' : authReturnView)} />;
      case 'rooms':
        return <Rooms onRequireAuth={() => requireSignIn('rooms')} />;
      case 'dining':
        return <Dining onRequireAuth={() => requireSignIn('dining')} />;
      case 'activities':
        return <Activities onRequireAuth={() => requireSignIn('activities')} />;
      case 'feedback':
        return user ? <Feedback /> : <Auth onSuccess={() => setActiveView('feedback')} />;
      case 'referral':
        return user ? <Referral /> : <Auth onSuccess={() => setActiveView('referral')} />;
      case 'my-stay':
        return user ? <MyStay /> : <Auth onSuccess={() => setActiveView('my-stay')} />;

      // Administrator Routes
      case 'admin-dashboard':
        return adminView('admin-dashboard', <Dashboard setActiveView={setActiveView} />);
      case 'admin-rooms':
        return adminView('admin-rooms', <RoomControl />);
      case 'admin-dining':
        return adminView('admin-dining', <RestaurantControl />);
      case 'admin-feedback':
        return adminView('admin-feedback', <FeedbackControl />);
      case 'admin-bookings':
        return adminView('admin-bookings', <BookingControl />);
      case 'admin-events':
        return adminView('admin-events', <EventControl />);

      default:
        return <Home setActiveView={setActiveView} />;
    }
  };

  return (
    <div className="min-h-screen bg-deep text-text-rich flex flex-col font-sans relative overflow-hidden">
      {/* Ambient luxury glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle,rgba(225,173,36,0.03),transparent_70%)] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-[radial-gradient(circle,rgba(225,173,36,0.02),transparent_70%)] pointer-events-none z-0" />
      
      {/* Dynamic Header */}
      <div className="relative z-50">
        <Header activeView={activeView} setActiveView={setActiveView} />
      </div>

      {/* Dynamic Content Views */}
      <main className="grow w-full relative z-10">
        {renderActiveView()}
      </main>

      {/* Unified footer */}
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}

function App() {
  return (
    <UserProvider>
      <HotelProvider>
        <AppContent />
      </HotelProvider>
    </UserProvider>
  );
}

export default App;

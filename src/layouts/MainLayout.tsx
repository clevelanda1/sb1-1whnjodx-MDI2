import React, { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { Loader2 } from 'lucide-react';

// Loading fallback for nested routes
const ContentLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="flex flex-col items-center">
      <Loader2 className="w-10 h-10 text-violet-600 animate-spin mb-4" />
      <p className="text-slate-600 font-medium">Loading content...</p>
    </div>
  </div>
);

const MainLayout: React.FC = () => {
  const location = useLocation();
  
  // Add '/account' to the list of routes where footer should be hidden
  const hideFooterRoutes = ['/studio', '/curation', '/visionboard', '/upgrade', '/account'];
  const showFooter = !hideFooterRoutes.includes(location.pathname);

  return (
    <div>
      <Navbar />
      <main>
        <Suspense fallback={<ContentLoader />}>
          <Outlet />
        </Suspense>
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

export default MainLayout;
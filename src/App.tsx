import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { CatalogView } from './components/student/CatalogView';
import { PrintJobConfigurator } from './components/student/PrintJobConfigurator';
import { CartCheckoutModal } from './components/student/CartCheckoutModal';
import { OrderTrackingView } from './components/student/OrderTrackingView';
import { ShopkeeperDashboard } from './components/shopkeeper/ShopkeeperDashboard';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-paper-bg paper-grain">
      <Navbar />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<CatalogView />} />
          <Route path="/print" element={<PrintJobConfigurator />} />
          <Route path="/track" element={<OrderTrackingView />} />
          <Route path="/admin" element={<ShopkeeperDashboard />} />
          <Route path="*" element={<CatalogView />} />
        </Routes>
      </main>

      <CartCheckoutModal />

      {/* Footer */}
      <footer className="border-t border-paper-border bg-paper-surface py-6 text-center text-xs text-ink-muted">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="font-semibold">
            <span className="text-brand-primary">Pencil</span>{' '}
            <span className="text-ink">FX</span> — Campus Online Stationery & Printing
          </div>
          <div className="text-[11px] text-ink-faint">
            Academic Project • Hosted on GitHub Pages • Zero Server Backend
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;

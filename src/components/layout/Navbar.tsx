import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Printer, Search, Settings, FileText, CheckCircle2, User, RefreshCw } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { detectGitHubConfig, saveGitHubConfig } from '../../config/github';

export const Navbar: React.FC = () => {
  const { cartItemCount, setIsCartOpen, studentSession, resetSession, refreshData, lastSyncedAt } = useStore();
  const location = useLocation();
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [config, setConfig] = useState(detectGitHubConfig());
  const [savedNotice, setSavedNotice] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveGitHubConfig(config);
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      setShowConfigModal(false);
    }, 1000);
  };

  const handleManualSync = async () => {
    setIsRefreshing(true);
    await refreshData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-paper-surface border-b border-paper border-b-[#E5E3D8] shadow-paper">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Brand Logo & Wordmark */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-8 h-8 bg-brand-primary text-white flex items-center justify-center font-bold text-lg rounded-none border border-brand-deep shadow-sm">
              P
            </div>
            <div className="text-xl font-bold tracking-tight">
              <span className="text-brand-primary">Pencil</span>{' '}
              <span className="text-ink">FX</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 text-sm font-medium">
            <Link
              to="/"
              className={`px-3 py-1.5 transition-colors ${
                isActive('/')
                  ? 'bg-paper-warm text-brand-deep font-semibold border-b-2 border-brand-primary'
                  : 'text-ink-muted hover:text-ink hover:bg-paper-muted'
              }`}
            >
              Stationery Catalog
            </Link>

            <Link
              to="/print"
              className={`px-3 py-1.5 flex items-center space-x-1.5 transition-colors ${
                isActive('/print')
                  ? 'bg-paper-warm text-brand-deep font-semibold border-b-2 border-brand-primary'
                  : 'text-ink-muted hover:text-ink hover:bg-paper-muted'
              }`}
            >
              <Printer className="w-4 h-4 text-brand-primary" />
              <span>Print Order</span>
            </Link>

            <Link
              to="/track"
              className={`px-3 py-1.5 flex items-center space-x-1.5 transition-colors ${
                isActive('/track')
                  ? 'bg-paper-warm text-brand-deep font-semibold border-b-2 border-brand-primary'
                  : 'text-ink-muted hover:text-ink hover:bg-paper-muted'
              }`}
            >
              <Search className="w-4 h-4 text-ink-muted" />
              <span>Track Orders</span>
            </Link>

            <Link
              to="/admin"
              className={`px-3 py-1.5 flex items-center space-x-1.5 transition-colors ${
                isActive('/admin')
                  ? 'bg-brand-light text-brand-deep font-semibold border border-brand-primary'
                  : 'text-ink-muted hover:text-ink hover:bg-paper-muted'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Shopkeeper (Admin)</span>
            </Link>
          </nav>

          {/* Action Tools */}
          <div className="flex items-center space-x-2.5">
            {/* Student Session Chip */}
            <button
              onClick={() => setShowSessionModal(true)}
              title="Student Session Info"
              className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 bg-paper-warm border border-paper-border text-xs text-ink-muted hover:text-ink"
            >
              <User className="w-3.5 h-3.5 text-brand-primary" />
              <span className="font-mono">{studentSession.studentId.substring(0, 8)}</span>
            </button>

            {/* Sync Refresh Button */}
            <button
              onClick={handleManualSync}
              disabled={isRefreshing}
              title={`Last synced: ${lastSyncedAt ? lastSyncedAt.toLocaleTimeString() : 'Never'}`}
              className="p-1.5 text-ink-muted hover:text-ink hover:bg-paper-muted transition-colors border border-transparent hover:border-paper-border"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-brand-primary' : ''}`} />
            </button>

            {/* Repository Config Gear */}
            <button
              onClick={() => setShowConfigModal(true)}
              title="GitHub Gateway Settings"
              className="p-1.5 text-ink-muted hover:text-ink hover:bg-paper-muted transition-colors border border-transparent hover:border-paper-border"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center space-x-2 px-3 py-1.5 bg-paper-warm hover:bg-paper-muted border border-paper-borderStrong text-ink text-sm font-medium transition-colors"
            >
              <ShoppingBag className="w-4 h-4 text-brand-primary" />
              <span className="hidden sm:inline">Order Bag</span>
              {cartItemCount > 0 && (
                <span className="bg-brand-primary text-white text-xs px-1.5 py-0.2 font-mono font-bold">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile secondary tab bar */}
        <div className="flex md:hidden border-t border-paper-border bg-paper-warm text-xs font-medium divide-x divide-paper-border">
          <Link
            to="/"
            className={`flex-1 py-2 text-center ${isActive('/') ? 'text-brand-deep font-bold bg-paper-surface' : 'text-ink-muted'}`}
          >
            Catalog
          </Link>
          <Link
            to="/print"
            className={`flex-1 py-2 text-center ${isActive('/print') ? 'text-brand-deep font-bold bg-paper-surface' : 'text-ink-muted'}`}
          >
            Custom Print
          </Link>
          <Link
            to="/track"
            className={`flex-1 py-2 text-center ${isActive('/track') ? 'text-brand-deep font-bold bg-paper-surface' : 'text-ink-muted'}`}
          >
            Track
          </Link>
          <Link
            to="/admin"
            className={`flex-1 py-2 text-center ${isActive('/admin') ? 'text-brand-deep font-bold bg-paper-surface' : 'text-ink-muted'}`}
          >
            Admin
          </Link>
        </div>
      </header>

      {/* Student Session Modal */}
      {showSessionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-paper-surface border border-paper-borderStrong max-w-sm w-full p-5 shadow-paper-lg space-y-3">
            <h3 className="text-sm font-bold text-ink">Student Browser Session</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Your session is stored locally in your browser to remember your pre-orders without requiring account registration.
            </p>
            <div className="p-2.5 bg-paper-warm border border-paper-border text-xs space-y-1 font-mono">
              <div><strong>Session ID:</strong> {studentSession.studentId}</div>
              <div><strong>Orders Placed:</strong> {studentSession.sessionOrderIds.length}</div>
              <div><strong>First Created:</strong> {new Date(studentSession.createdAt).toLocaleDateString()}</div>
            </div>
            <div className="text-[11px] text-ink-faint">
              Note: This is a browser convenience, not formal authentication.
            </div>
            <div className="flex justify-between pt-2 border-t border-paper-border">
              <button
                type="button"
                onClick={() => {
                  if (confirm('Clear your local browser session and generated ID?')) {
                    resetSession();
                    setShowSessionModal(false);
                  }
                }}
                className="px-2.5 py-1 text-xs text-red-600 hover:text-red-800 border border-red-200 hover:bg-red-50"
              >
                Reset Session
              </button>
              <button
                type="button"
                onClick={() => setShowSessionModal(false)}
                className="px-3 py-1 text-xs bg-brand-primary text-white font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GitHub Config Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-paper-surface border border-paper-borderStrong max-w-md w-full p-6 shadow-paper-lg">
            <h3 className="text-base font-bold text-ink mb-2">GitHub Gateway Coordinates</h3>
            <p className="text-xs text-ink-muted mb-4 leading-relaxed">
              Pencil FX uses GitHub Issues & Actions as the database engine. Specify the target GitHub repository:
            </p>

            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">
                  Repository Owner / Username
                </label>
                <input
                  type="text"
                  value={config.owner}
                  onChange={(e) => setConfig({ ...config, owner: e.target.value })}
                  placeholder="e.g. prerithm"
                  required
                  className="w-full px-3 py-1.5 text-sm bg-white border border-paper-borderStrong text-ink focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">
                  Repository Name
                </label>
                <input
                  type="text"
                  value={config.repo}
                  onChange={(e) => setConfig({ ...config, repo: e.target.value })}
                  placeholder="e.g. PencilFX"
                  required
                  className="w-full px-3 py-1.5 text-sm bg-white border border-paper-borderStrong text-ink focus:outline-none focus:border-brand-primary"
                />
              </div>

              {savedNotice && (
                <div className="flex items-center space-x-1.5 text-brand-primary text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Repository settings saved!</span>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2 border-t border-paper-border">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-3 py-1.5 text-xs text-ink-muted hover:text-ink border border-paper-borderStrong hover:bg-paper-warm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-brand-primary hover:bg-brand-deep text-white font-semibold shadow-sm"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

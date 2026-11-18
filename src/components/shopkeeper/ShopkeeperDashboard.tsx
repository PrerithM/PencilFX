import React, { useState, useMemo } from 'react';
import { RefreshCw, ExternalLink, Filter, Clock, Printer, AlertTriangle, Lock, LogOut } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { buildIssueUrl, detectGitHubConfig } from '../../config/github';
import { isAdminAuthenticated, loginAdmin, logoutAdmin } from '../../services/sessionService';

export const ShopkeeperDashboard: React.FC = () => {
  const { orders, refreshData, isLoading, pickupSlots, settings } = useStore();
  const [selectedSlotFilter, setSelectedSlotFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Demonstration PIN authentication state
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    isAdminAuthenticated(settings.sessionExpiryMinutes || 30)
  );

  const { owner, repo } = detectGitHubConfig();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const validPin = settings.adminDemoPin || '1234';
    const success = loginAdmin(pinInput.trim(), validPin, settings.sessionExpiryMinutes || 30);
    if (success) {
      setIsAuthenticated(true);
      setPinError(false);
      setPinInput('');
    } else {
      setPinError(true);
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    setIsAuthenticated(false);
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSlot = selectedSlotFilter === 'All' || o.pickupSlot === selectedSlotFilter;
      const matchStatus = statusFilter === 'All' || o.orderStatus === statusFilter;
      return matchSlot && matchStatus;
    });
  }, [orders, selectedSlotFilter, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.orderStatus === 'NEW' || o.orderStatus === 'ACCEPTED').length;
    const inPrep = orders.filter((o) => o.orderStatus === 'PREPARING' || o.orderStatus === 'PRINTING').length;
    const ready = orders.filter((o) => o.orderStatus === 'READY_FOR_PICKUP').length;
    const completed = orders.filter((o) => o.orderStatus === 'COLLECTED').length;
    const revenue = orders
      .filter((o) => o.orderStatus !== 'CANCELLED' && o.orderStatus !== 'REJECTED')
      .reduce((sum, o) => sum + (o.pricing?.totalAmount || 0), 0);

    return { total, pending, inPrep, ready, completed, revenue };
  }, [orders]);

  // If not authenticated, render Demonstration PIN gate
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-paper-surface border border-paper-borderStrong p-6 shadow-paper-lg space-y-4">
          <div className="flex items-center space-x-2 text-brand-primary">
            <Lock className="w-5 h-5" />
            <h2 className="text-base font-bold text-ink">Shopkeeper Terminal Access</h2>
          </div>

          <p className="text-xs text-ink-muted leading-relaxed">
            Enter the demonstration PIN to access the counter order-fulfillment board.
          </p>

          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Demonstration PIN
              </label>
              <input
                type="password"
                maxLength={8}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(false);
                }}
                placeholder="Default: 1234"
                required
                className="w-full px-3 py-2 text-sm bg-paper-warm border border-paper-borderStrong text-ink font-mono focus:outline-none focus:border-brand-primary focus:bg-white text-center tracking-widest text-lg"
              />
              {pinError && (
                <p className="text-[11px] text-red-600 mt-1 font-medium">
                  Invalid PIN. (Demonstration PIN: <strong>{settings.adminDemoPin || '1234'}</strong>)
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-brand-primary hover:bg-brand-deep text-white font-bold text-xs uppercase tracking-wider border border-brand-deep shadow-sm"
            >
              Authenticate Demo Session
            </button>
          </form>

          {/* Academic disclaimer */}
          <div className="p-3 bg-paper-warm border border-paper-border text-[11px] text-ink-faint leading-normal">
            <strong>Demonstration Notice:</strong> Client-side PIN validation is for demonstration purposes only. Production changes are executed through authenticated GitHub Actions.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      
      {/* Demonstration Banner */}
      <div className="mb-4 p-3 bg-amber-50 border border-amber-300 text-xs text-amber-900 flex items-start space-x-2">
        <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Academic Demonstration Interface:</strong> This dashboard reads static JSON repository data from <code>data/orders.json</code>. Updating order statuses links to GitHub Issues, where the automated GitHub Action updates <code>orders.json</code> and appends notification records.
        </div>
      </div>

      {/* Header & Controls */}
      <div className="border border-paper-border bg-paper-surface p-5 mb-6 shadow-paper">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono uppercase tracking-wider bg-brand-light text-brand-deep border border-brand-primary/40 px-2 py-0.5 font-bold">
                Counter Administration
              </span>
              <span className="text-xs text-ink-muted">
                Repo: <code className="font-mono">{owner}/{repo}</code>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-ink tracking-tight mt-1">
              Shopkeeper Orders & Printing Terminal
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing || isLoading}
              className="px-3 py-1.5 bg-paper-warm hover:bg-paper-muted border border-paper-borderStrong text-xs font-semibold text-ink flex items-center space-x-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Syncing...' : 'Sync Data'}</span>
            </button>

            <a
              href={`https://github.com/${owner}/${repo}/issues`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-brand-primary hover:bg-brand-deep text-white border border-brand-deep text-xs font-semibold flex items-center space-x-1.5"
            >
              <span>GitHub Issues</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={handleLogout}
              title="Lock Admin Session"
              className="p-1.5 text-red-600 hover:text-red-800 border border-red-200 hover:bg-red-50 text-xs flex items-center space-x-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Daily Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mt-4 pt-4 border-t border-paper-border">
          <div className="p-2.5 bg-paper-warm border border-paper-border">
            <span className="text-[10px] text-ink-muted uppercase tracking-wider">Total Orders</span>
            <div className="text-lg font-bold text-ink font-mono">{stats.total}</div>
          </div>
          <div className="p-2.5 bg-paper-warm border border-paper-border">
            <span className="text-[10px] text-amber-800 uppercase tracking-wider">Pending Action</span>
            <div className="text-lg font-bold text-amber-900 font-mono">{stats.pending}</div>
          </div>
          <div className="p-2.5 bg-paper-warm border border-paper-border">
            <span className="text-[10px] text-blue-800 uppercase tracking-wider">Printing/Prep</span>
            <div className="text-lg font-bold text-blue-900 font-mono">{stats.inPrep}</div>
          </div>
          <div className="p-2.5 bg-brand-light border border-brand-primary/30">
            <span className="text-[10px] text-brand-deep uppercase tracking-wider font-bold">Ready at Counter</span>
            <div className="text-lg font-bold text-brand-deep font-mono">{stats.ready}</div>
          </div>
          <div className="p-2.5 bg-paper-warm border border-paper-border">
            <span className="text-[10px] text-ink-muted uppercase tracking-wider">Completed</span>
            <div className="text-lg font-bold text-ink font-mono">{stats.completed}</div>
          </div>
          <div className="p-2.5 bg-paper-warm border border-paper-border">
            <span className="text-[10px] text-ink-muted uppercase tracking-wider">Est. Revenue</span>
            <div className="text-lg font-bold text-brand-deep font-mono">₹{stats.revenue}</div>
          </div>
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="bg-paper-surface border border-paper-border p-4 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-paper">
        {/* Pickup Slot Filter */}
        <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none pb-1 md:pb-0">
          <span className="font-semibold text-ink flex items-center space-x-1 whitespace-nowrap">
            <Filter className="w-3.5 h-3.5 text-brand-primary" />
            <span>Pickup Slot:</span>
          </span>
          <button
            onClick={() => setSelectedSlotFilter('All')}
            className={`px-2.5 py-1 font-medium border whitespace-nowrap ${
              selectedSlotFilter === 'All'
                ? 'bg-brand-primary text-white border-brand-deep font-semibold'
                : 'bg-paper-warm text-ink-muted border-paper-border hover:bg-paper-muted'
            }`}
          >
            All Slots ({orders.length})
          </button>
          {pickupSlots.map((slot) => {
            const count = orders.filter((o) => o.pickupSlot === slot.label).length;
            return (
              <button
                key={slot.id}
                onClick={() => setSelectedSlotFilter(slot.label)}
                className={`px-2.5 py-1 font-medium border whitespace-nowrap ${
                  selectedSlotFilter === slot.label
                    ? 'bg-brand-primary text-white border-brand-deep font-semibold'
                    : 'bg-paper-warm text-ink-muted border-paper-border hover:bg-paper-muted'
                }`}
              >
                {slot.label.split('–')[0].trim()} ({count})
              </button>
            );
          })}
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-ink">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1 bg-paper-warm border border-paper-borderStrong text-ink focus:outline-none focus:border-brand-primary font-mono text-xs"
          >
            <option value="All">All Statuses</option>
            <option value="NEW">NEW</option>
            <option value="ACCEPTED">ACCEPTED</option>
            <option value="PRINTING">PRINTING</option>
            <option value="PREPARING">PREPARING</option>
            <option value="READY_FOR_PICKUP">READY_FOR_PICKUP</option>
            <option value="COLLECTED">COLLECTED</option>
            <option value="REJECTED">REJECTED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-paper-surface border border-paper-border shadow-paper overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-ink-muted text-xs">
            No orders match the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-paper-muted border-b border-paper-borderStrong text-[11px] font-semibold text-ink-muted uppercase">
                  <th className="p-3">Order ID & Type</th>
                  <th className="p-3">Student & Session</th>
                  <th className="p-3">Pickup Slot</th>
                  <th className="p-3">Items & Print Jobs</th>
                  <th className="p-3">Total (₹)</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paper-border">
                {filteredOrders.map((ord) => {
                  const issueLink = buildIssueUrl(ord.githubIssueNumber);
                  const isReady = ord.orderStatus === 'READY_FOR_PICKUP';
                  const isDone = ord.orderStatus === 'COLLECTED';

                  return (
                    <tr key={ord.orderId} className="hover:bg-paper-warm transition-colors">
                      {/* Order ID */}
                      <td className="p-3 font-mono font-bold text-ink whitespace-nowrap align-top">
                        <div>{ord.orderId}</div>
                        <span className="text-[10px] text-ink-muted font-normal uppercase bg-paper-warm px-1.5 py-0.5 border border-paper-border inline-block mt-0.5">
                          {ord.orderType}
                        </span>
                        {ord.githubIssueNumber && (
                          <div className="mt-1">
                            <a
                              href={issueLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-brand-primary hover:underline flex items-center space-x-0.5"
                            >
                              <span>Issue #{ord.githubIssueNumber}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        )}
                      </td>

                      {/* Student Info */}
                      <td className="p-3 align-top whitespace-nowrap">
                        <div className="font-semibold text-ink">{ord.studentName}</div>
                        <div className="text-[11px] text-ink-muted font-mono">
                          {ord.studentId}
                        </div>
                        <div className="text-[11px] text-ink-muted">
                          {ord.usn || 'No USN'} {ord.phone ? `• ${ord.phone}` : ''}
                        </div>
                        {ord.customNotes && (
                          <div className="mt-1 text-[10px] text-amber-800 bg-amber-50 p-1 border border-amber-200 max-w-xs truncate" title={ord.customNotes}>
                            Note: {ord.customNotes}
                          </div>
                        )}
                      </td>

                      {/* Pickup Slot */}
                      <td className="p-3 align-top whitespace-nowrap">
                        <span className="font-medium text-brand-deep flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-brand-primary" />
                          <span>{ord.pickupSlot}</span>
                        </span>
                      </td>

                      {/* Items & Print Jobs */}
                      <td className="p-3 align-top">
                        <div className="space-y-1.5 max-w-sm">
                          {ord.items.map((it, idx) => (
                            <div key={idx} className="text-ink">
                              • {it.name} <span className="font-semibold">(x{it.quantity})</span>
                            </div>
                          ))}

                          {ord.printJobs.map((pj, idx) => (
                            <div key={idx} className="p-2 bg-paper-warm border border-paper-border space-y-1">
                              <div className="font-semibold text-brand-deep flex items-center space-x-1">
                                <Printer className="w-3 h-3" />
                                <span>Print Job: {pj.colorMode.toUpperCase()} ({pj.sides}), {pj.paperSize}</span>
                              </div>
                              <div className="text-[11px] text-ink-muted">
                                {pj.estimatedPages} pages × {pj.copies} copies • {pj.finishing}
                              </div>
                              <div className="pt-1 flex flex-wrap gap-1">
                                {pj.driveUrls.map((url, linkIdx) => (
                                  <a
                                    key={linkIdx}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-2 py-0.5 bg-white border border-paper-borderStrong text-brand-primary hover:text-brand-deep font-semibold flex items-center space-x-1"
                                  >
                                    <span>Open Doc #{linkIdx + 1}</span>
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Total */}
                      <td className="p-3 align-top font-bold text-ink whitespace-nowrap">
                        ₹{ord.pricing?.totalAmount || 0}
                        <div className="text-[10px] font-normal text-ink-muted">Pay at pickup</div>
                      </td>

                      {/* Status */}
                      <td className="p-3 align-top whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 font-mono uppercase text-[10px] font-bold border ${
                            isReady
                              ? 'bg-brand-light text-brand-deep border-brand-primary'
                              : isDone
                              ? 'bg-paper-muted text-ink-muted border-paper-border'
                              : 'bg-amber-50 text-amber-900 border-amber-300'
                          }`}
                        >
                          {ord.orderStatus.replace(/_/g, ' ')}
                        </span>
                      </td>

                      {/* Action Links */}
                      <td className="p-3 align-top text-right whitespace-nowrap">
                        <a
                          href={issueLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 bg-paper-warm hover:bg-paper-muted border border-paper-borderStrong text-[11px] font-semibold text-ink inline-flex items-center space-x-1"
                          title="Manage or update status on GitHub Issue"
                        >
                          <span>Manage on GitHub</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

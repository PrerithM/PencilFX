import React, { useState } from 'react';
import { Search, ExternalLink, Clock, AlertCircle, ShieldCheck, Bell, User } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useStore } from '../../context/StoreContext';
import { buildIssueUrl } from '../../config/github';
import { Order, OrderStatus } from '../../types';

export const OrderTrackingView: React.FC = () => {
  const { orders, studentSession, notifications } = useStore();
  const [activeTab, setActiveTab] = useState<'my_orders' | 'search'>('my_orders');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Orders created in current browser session
  const sessionOrders = orders.filter((o) =>
    studentSession.sessionOrderIds.includes(o.orderId)
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setHasSearched(true);
    const found = orders.find(
      (o) =>
        o.orderId.toUpperCase() === query.toUpperCase() ||
        o.trackingToken.toLowerCase() === query.toLowerCase() ||
        (o.phone && o.phone.includes(query)) ||
        (o.usn && o.usn.toUpperCase() === query.toUpperCase())
    );
    setSearchedOrder(found || null);
  };

  const statusSteps: { key: OrderStatus; label: string }[] = [
    { key: 'NEW', label: 'Registered' },
    { key: 'ACCEPTED', label: 'Accepted' },
    { key: 'PRINTING', label: 'Prep / Printing' },
    { key: 'READY_FOR_PICKUP', label: 'Ready for Pickup' },
    { key: 'COLLECTED', label: 'Collected' },
  ];

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'NEW': return 0;
      case 'ACCEPTED': return 1;
      case 'PREPARING':
      case 'PRINTING': return 2;
      case 'READY_FOR_PICKUP': return 3;
      case 'COLLECTED': return 4;
      default: return 0;
    }
  };

  const renderOrderDetails = (order: Order) => {
    return (
      <div className="space-y-4">
        {/* Status Stepper Card */}
        <div className="bg-paper-surface border border-paper-border p-5 shadow-paper space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-paper-border gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono uppercase text-ink-muted bg-paper-warm px-2 py-0.5 border border-paper-border">
                  Order Status
                </span>
                <span className="text-[11px] text-ink-muted">
                  Type: <strong className="text-ink font-semibold">{order.orderType}</strong>
                </span>
              </div>
              <h2 className="text-lg font-bold font-mono text-ink mt-1">
                {order.orderId}
              </h2>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-xs font-semibold px-2.5 py-1 uppercase font-mono border ${
                order.orderStatus === 'READY_FOR_PICKUP'
                  ? 'bg-brand-light text-brand-deep border-brand-primary'
                  : order.orderStatus === 'COLLECTED'
                  ? 'bg-paper-muted text-ink-muted border-paper-border'
                  : 'bg-amber-50 text-amber-900 border-amber-300'
              }`}>
                {order.orderStatus.replace(/_/g, ' ')}
              </span>
              {order.githubIssueNumber && (
                <a
                  href={buildIssueUrl(order.githubIssueNumber)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-brand-primary hover:underline flex items-center space-x-1 border border-paper-border px-2 py-1 bg-paper-warm"
                >
                  <span>Issue #{order.githubIssueNumber}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {/* Stepper Progress */}
          <div className="grid grid-cols-5 gap-1 pt-2">
            {statusSteps.map((step, idx) => {
              const currentIdx = getStepIndex(order.orderStatus);
              const isCompleted = idx <= currentIdx;
              const isCurrent = idx === currentIdx;

              return (
                <div key={step.key} className="flex flex-col items-center text-center">
                  <div
                    className={`w-6 h-6 rounded-none flex items-center justify-center text-[10px] font-bold border transition-colors ${
                      isCompleted
                        ? 'bg-brand-primary text-white border-brand-deep'
                        : 'bg-paper-muted text-ink-faint border-paper-border'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <span
                    className={`text-[10px] mt-1.5 leading-tight ${
                      isCurrent
                        ? 'font-bold text-brand-deep'
                        : isCompleted
                        ? 'text-ink font-medium'
                        : 'text-ink-faint'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Details & QR Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-paper-surface border border-paper-border p-5 shadow-paper space-y-3 text-xs">
            <h3 className="font-bold text-ink uppercase tracking-wide border-b border-paper-border pb-1.5">
              Pickup & Verification Details
            </h3>

            <div className="grid grid-cols-2 gap-2 text-ink-muted">
              <div>
                <span className="block text-[10px] text-ink-faint">Student Name</span>
                <span className="font-semibold text-ink">{order.studentName}</span>
              </div>
              <div>
                <span className="block text-[10px] text-ink-faint">Pickup Slot</span>
                <span className="font-semibold text-brand-deep flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-brand-primary" />
                  <span>{order.pickupSlot}</span>
                </span>
              </div>
              {order.usn && (
                <div>
                  <span className="block text-[10px] text-ink-faint">USN / Roll</span>
                  <span className="font-semibold text-ink">{order.usn}</span>
                </div>
              )}
              <div>
                <span className="block text-[10px] text-ink-faint">Total Due at Counter</span>
                <span className="font-bold text-ink">₹{order.pricing.totalAmount} (Pay at Pickup)</span>
              </div>
            </div>

            {/* Items Summary */}
            <div className="pt-2 border-t border-paper-border">
              <span className="block text-[10px] text-ink-faint mb-1.5 uppercase tracking-wider font-semibold">
                Ordered Items:
              </span>
              <div className="space-y-1">
                {order.items.map((it, i) => (
                  <div key={i} className="flex justify-between p-1.5 bg-paper-warm border border-paper-border">
                    <span className="text-ink font-medium">{it.name} (x{it.quantity})</span>
                    <span className="font-semibold text-ink">₹{it.unitPrice * it.quantity}</span>
                  </div>
                ))}
                {order.printJobs.map((pj, i) => (
                  <div key={i} className="p-1.5 bg-paper-warm border border-paper-border">
                    <div className="flex justify-between font-medium text-ink">
                      <span>Printout: {pj.driveUrls.length} file(s) ({pj.colorMode.toUpperCase()}, {pj.sides})</span>
                      <span className="font-semibold">₹{pj.cost}</span>
                    </div>
                    <div className="text-[10px] text-ink-muted mt-0.5">
                      {pj.estimatedPages} pages × {pj.copies} copies • {pj.finishing}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {order.customNotes && (
              <div className="p-2 bg-amber-50/50 border border-amber-200 text-[11px] text-amber-900">
                <strong>Notes:</strong> {order.customNotes}
              </div>
            )}
          </div>

          {/* Token QR Card */}
          <div className="bg-paper-surface border border-paper-border p-5 shadow-paper flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-2">
              Counter Pickup Token
            </span>
            <div className="p-2 bg-white border border-paper-borderStrong">
              <QRCodeSVG
                value={`PENCILFX:${order.orderId}:${order.trackingToken}`}
                size={120}
                level="M"
              />
            </div>
            <span className="text-xs font-mono font-bold text-ink mt-2">
              {order.orderId}
            </span>
            <p className="text-[10px] text-ink-muted mt-1 leading-tight">
              Show this QR code or mention your Order ID at the counter to collect your order.
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Notifications Ribbon */}
      {notifications.length > 0 && (
        <div className="border border-paper-border bg-paper-surface p-4 shadow-paper">
          <div className="flex items-center space-x-1.5 mb-2 font-bold text-xs text-ink uppercase tracking-wide">
            <Bell className="w-3.5 h-3.5 text-brand-primary" />
            <span>Campus Order & Shop Notifications</span>
          </div>
          <div className="space-y-1.5 text-xs text-ink-muted">
            {notifications.slice(0, 3).map((notif) => (
              <div key={notif.notificationId} className="p-2 bg-paper-warm border border-paper-border flex items-start space-x-2">
                <span className="text-brand-primary font-bold">•</span>
                <div className="flex-1">
                  <span>{notif.message}</span>
                  <span className="text-[10px] text-ink-faint ml-2">
                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Header & Tabs */}
      <div className="border border-paper-border bg-paper-surface p-5 sm:p-6 shadow-paper">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">
              Track Campus Pre-Orders
            </h1>
            <p className="text-xs sm:text-sm text-ink-muted mt-1">
              View orders created in your current browser session or look up any order using its private tracking token.
            </p>
          </div>

          <div className="flex items-center space-x-1 bg-paper-warm p-1 border border-paper-border text-xs">
            <button
              onClick={() => setActiveTab('my_orders')}
              className={`px-3 py-1.5 font-medium transition-colors ${
                activeTab === 'my_orders'
                  ? 'bg-paper-surface text-brand-deep font-bold border border-paper-borderStrong shadow-sm'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              My Session Orders ({sessionOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`px-3 py-1.5 font-medium transition-colors ${
                activeTab === 'search'
                  ? 'bg-paper-surface text-brand-deep font-bold border border-paper-borderStrong shadow-sm'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              Search by Token / ID
            </button>
          </div>
        </div>

        {/* Tab 1: My Session Orders */}
        {activeTab === 'my_orders' ? (
          <div>
            {sessionOrders.length === 0 ? (
              <div className="p-8 text-center text-ink-muted border border-dashed border-paper-border">
                <User className="w-8 h-8 text-ink-muted mx-auto mb-2 opacity-50" />
                <h3 className="text-sm font-bold text-ink">No Orders in Current Session</h3>
                <p className="text-xs text-ink-faint mt-1">
                  Orders submitted from this device will appear here automatically.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sessionOrders.map((ord) => (
                  <div key={ord.orderId}>
                    {renderOrderDetails(ord)}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Tab 2: Search by Token or Order ID */
          <div className="space-y-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter Order ID (e.g. PFX-2026-90412) or Tracking Token (e.g. tok_...)"
                className="flex-1 px-3 py-2 text-xs bg-paper-warm border border-paper-borderStrong text-ink font-mono focus:outline-none focus:border-brand-primary focus:bg-white"
              />
              <button
                type="submit"
                className="px-5 py-2 bg-brand-primary hover:bg-brand-deep text-white font-semibold text-xs flex items-center space-x-1.5 border border-brand-deep shadow-paper"
              >
                <Search className="w-4 h-4" />
                <span>Track</span>
              </button>
            </form>

            {hasSearched && !searchedOrder ? (
              <div className="p-8 text-center text-ink-muted border border-paper-border bg-paper-warm">
                <AlertCircle className="w-8 h-8 text-amber-700 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-ink">Order Not Found</h3>
                <p className="text-xs text-ink-faint mt-1">
                  No order matches "{searchQuery}". Please verify that your GitHub Issue has been submitted and processed.
                </p>
              </div>
            ) : searchedOrder ? (
              renderOrderDetails(searchedOrder)
            ) : (
              <div className="p-4 bg-paper-warm border border-paper-border text-xs text-ink-muted flex items-start space-x-2">
                <ShieldCheck className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                <div>
                  <strong>Privacy Note:</strong> To protect student privacy, the general public cannot browse all orders. You must enter your exact Order ID or private tracking token to view details.
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

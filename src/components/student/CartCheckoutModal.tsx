import React, { useState } from 'react';
import { X, Trash2, Printer, CheckCircle2, ArrowRight, Clock, ShieldCheck } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { buildNewOrderIssueUrl } from '../../config/github';
import { generateOrderId, generateTrackingToken } from '../../services/sessionService';
import { Order, OrderItem, OrderType } from '../../types';

export const CartCheckoutModal: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartTotal,
    pickupSlots,
    studentSession,
    updateSession,
    addLocalOrder,
  } = useStore();

  const [studentName, setStudentName] = useState(studentSession.displayName || '');
  const [studentUSN, setStudentUSN] = useState(studentSession.usn || '');
  const [phone, setPhone] = useState(studentSession.phone || '');
  const [selectedSlot, setSelectedSlot] = useState(
    pickupSlots.find((s) => s.isEnabled)?.label || ''
  );
  const [customNotes, setCustomNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<{ order: Order; issueUrl: string } | null>(null);

  if (!isCartOpen) return null;

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) return;
    if (!studentName.trim()) {
      alert('Please enter your name.');
      return;
    }
    if (!selectedSlot) {
      alert('Please select a pickup time slot.');
      return;
    }

    setIsSubmitting(true);

    // Save student details in session for convenience
    updateSession({
      displayName: studentName.trim(),
      usn: studentUSN.trim() || undefined,
      phone: phone.trim() || undefined,
    });

    // 1. Generate unique Order ID & private tracking token
    const orderId = generateOrderId();
    const trackingToken = generateTrackingToken();

    // 2. Classify items & print jobs
    const stationeryItems: OrderItem[] = [];
    const printJobsData: Order['printJobs'] = [];
    const allDriveLinks: string[] = [];

    let stationerySubtotal = 0;
    let printSubtotal = 0;

    cart.forEach((item) => {
      if (item.type === 'stationery' && item.product) {
        stationeryItems.push({
          type: 'stationery',
          name: item.product.name,
          quantity: item.quantity,
          unitPrice: item.product.price,
        });
        stationerySubtotal += item.product.price * item.quantity;
      } else if (item.type === 'print' && item.printJob) {
        const pj = item.printJob;
        printJobsData.push(pj);
        pj.driveUrls.forEach((url) => {
          if (!allDriveLinks.includes(url)) allDriveLinks.push(url);
        });
        printSubtotal += pj.cost;
      }
    });

    let orderType: OrderType = 'MIXED';
    if (stationeryItems.length > 0 && printJobsData.length === 0) orderType = 'STATIONERY';
    if (stationeryItems.length === 0 && printJobsData.length > 0) orderType = 'PRINT_ONLY';

    const now = new Date().toISOString();

    const newOrder: Order = {
      orderId,
      trackingToken,
      studentId: studentSession.studentId,
      studentName: studentName.trim(),
      usn: studentUSN.trim() || undefined,
      phone: phone.trim() || undefined,
      orderType,
      items: stationeryItems,
      printJobs: printJobsData,
      driveLinks: allDriveLinks,
      customNotes: customNotes.trim() || undefined,
      pricing: {
        stationerySubtotal,
        printSubtotal,
        totalAmount: cartTotal,
        currency: 'INR',
      },
      pickupSlot: selectedSlot,
      orderStatus: 'NEW',
      createdAt: now,
      updatedAt: now,
    };

    // 3. Save order into local student session
    addLocalOrder(newOrder);

    // 4. Build prefilled GitHub Issue creation URL
    const payloadJson = JSON.stringify(newOrder, null, 2);
    const githubIssueUrl = buildNewOrderIssueUrl({
      orderId,
      trackingToken,
      studentId: newOrder.studentId,
      studentName: newOrder.studentName,
      pickupSlot: newOrder.pickupSlot,
      payloadJson,
      studentNotes: newOrder.customNotes,
    });

    setConfirmedOrder({ order: newOrder, issueUrl: githubIssueUrl });
    clearCart();
    setIsSubmitting(false);

    // Open prefilled GitHub Issue in new tab
    window.open(githubIssueUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-[1px]">
      <div className="bg-paper-surface w-full max-w-lg h-full flex flex-col border-l border-paper-borderStrong shadow-paper-lg">
        
        {/* Header */}
        <div className="p-4 border-b border-paper-border flex items-center justify-between bg-paper-warm">
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-ink">
              {confirmedOrder ? 'Order Ready for Registration' : 'Order Bag & Checkout'}
            </h2>
            <span className="text-xs text-ink-muted">
              ({cart.length} item{cart.length === 1 ? '' : 's'})
            </span>
          </div>
          <button
            onClick={() => {
              setIsCartOpen(false);
              setConfirmedOrder(null);
            }}
            className="p-1.5 text-ink-muted hover:text-ink hover:bg-paper-muted border border-transparent hover:border-paper-border"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
          
          {confirmedOrder ? (
            /* Post-Submission Instructions Screen */
            <div className="space-y-4 py-2">
              <div className="p-4 bg-brand-light border border-brand-primary text-brand-dark">
                <div className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-ink">Order Prepared! Complete on GitHub</h3>
                    <p className="mt-1 leading-relaxed text-ink-muted">
                      Your Order ID is <strong className="text-ink font-mono">{confirmedOrder.order.orderId}</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Explicit Submission Clarification */}
              <div className="p-4 bg-amber-50/70 border border-amber-300 space-y-2.5">
                <div className="flex items-center space-x-1.5 font-bold text-amber-900 uppercase tracking-wide">
                  <Clock className="w-4 h-4 text-amber-800" />
                  <span>Important: Action Required on GitHub</span>
                </div>
                <p className="text-amber-800 leading-relaxed">
                  A prefilled GitHub Issue page was opened in your browser. <strong>Your order is NOT officially recorded until you click "Submit new issue" on GitHub.</strong>
                </p>
                <div className="p-2.5 bg-white border border-amber-200 text-[11px] text-ink-muted space-y-1">
                  <div>1. Switch to the opened GitHub tab.</div>
                  <div>2. Review the prefilled order summary.</div>
                  <div>3. Click the green <strong>"Submit new issue"</strong> button.</div>
                  <div>4. The automated GitHub Action will register your order in <code>orders.json</code>.</div>
                </div>
                {confirmedOrder.issueUrl && (
                  <a
                    href={confirmedOrder.issueUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 text-brand-primary font-bold hover:underline pt-1"
                  >
                    <span>Re-open GitHub Issue submission page</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {/* Private Tracking Token Box */}
              <div className="p-3 bg-paper-warm border border-paper-borderStrong space-y-2">
                <div className="flex items-center space-x-1.5 text-ink font-bold">
                  <ShieldCheck className="w-4 h-4 text-brand-primary" />
                  <span>Your Private Tracking Token</span>
                </div>
                <div className="p-2 bg-white border border-paper-border font-mono text-center text-xs select-all font-bold text-ink">
                  {confirmedOrder.order.trackingToken}
                </div>
                <p className="text-[10px] text-ink-muted">
                  Saved automatically in your browser session. Save this token if you want to track this order from a different device.
                </p>
              </div>

              {/* Order Details Summary */}
              <div className="p-3 border border-paper-border bg-white space-y-2">
                <div className="flex justify-between border-b border-paper-border pb-1.5">
                  <span className="text-ink-muted">Order ID:</span>
                  <span className="font-mono font-bold text-ink">{confirmedOrder.order.orderId}</span>
                </div>
                <div className="flex justify-between border-b border-paper-border pb-1.5">
                  <span className="text-ink-muted">Pickup Slot:</span>
                  <span className="font-semibold text-brand-primary">{confirmedOrder.order.pickupSlot}</span>
                </div>
                <div className="flex justify-between border-b border-paper-border pb-1.5">
                  <span className="text-ink-muted">Student Name:</span>
                  <span className="font-semibold text-ink">{confirmedOrder.order.studentName}</span>
                </div>
                <div className="flex justify-between pt-1 font-bold text-sm text-ink">
                  <span>Total Amount:</span>
                  <span>₹{confirmedOrder.order.pricing.totalAmount} (Pay at Pickup)</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCartOpen(false);
                    setConfirmedOrder(null);
                  }}
                  className="w-full py-2 bg-paper-warm hover:bg-paper-muted border border-paper-borderStrong font-semibold text-ink"
                >
                  Done & Continue Browsing
                </button>
              </div>
            </div>
          ) : cart.length === 0 ? (
            <div className="py-16 text-center text-ink-muted space-y-2">
              <p className="font-medium">Your order bag is currently empty.</p>
              <p className="text-ink-faint">Add stationery from the catalog or configure a custom document printout.</p>
            </div>
          ) : (
            /* Checkout Form */
            <form onSubmit={handleCheckout} className="space-y-5">
              
              {/* Cart Items List */}
              <div className="space-y-2">
                <h3 className="font-bold text-ink uppercase tracking-wider text-[11px]">
                  Selected Items
                </h3>
                <div className="divide-y divide-paper-border border border-paper-border bg-white">
                  {cart.map((item) => (
                    <div key={item.id} className="p-3 flex items-start justify-between gap-3">
                      <div className="flex-1">
                        {item.type === 'stationery' && item.product ? (
                          <div>
                            <div className="font-semibold text-ink">{item.product.name}</div>
                            <div className="text-[11px] text-ink-muted">
                              ₹{item.product.price} × {item.quantity} = ₹{item.product.price * item.quantity}
                            </div>
                          </div>
                        ) : item.type === 'print' && item.printJob ? (
                          <div>
                            <div className="flex items-center space-x-1 font-semibold text-brand-deep">
                              <Printer className="w-3.5 h-3.5" />
                              <span>Custom Document Printout</span>
                            </div>
                            <div className="text-[11px] text-ink-muted mt-0.5 space-y-0.5">
                              <div>{item.printJob.driveUrls.length} file(s) • {item.printJob.colorMode.toUpperCase()} • {item.printJob.sides} • {item.printJob.paperSize}</div>
                              <div>{item.printJob.estimatedPages} pgs × {item.printJob.copies} copies ({item.printJob.finishing})</div>
                            </div>
                            <div className="font-semibold text-ink mt-1">₹{item.printJob.cost}</div>
                          </div>
                        ) : null}
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        {item.type === 'stationery' && (
                          <div className="flex items-center border border-paper-borderStrong">
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                              className="px-2 py-0.5 hover:bg-paper-warm"
                            >
                              -
                            </button>
                            <span className="px-2 py-0.5 font-mono font-semibold">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                              className="px-2 py-0.5 hover:bg-paper-warm"
                            >
                              +
                            </button>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 text-red-600 hover:text-red-800"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pickup Slot Selection */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-ink uppercase tracking-wider text-[11px] flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-brand-primary" />
                    <span>Select Scheduled Pickup Slot</span>
                  </label>
                  <span className="text-[10px] text-ink-faint">Live capacity</span>
                </div>
                
                <div className="space-y-1.5">
                  {pickupSlots.map((slot) => {
                    const isSelected = selectedSlot === slot.label;
                    const isFull = !slot.isEnabled || slot.currentBookings >= slot.capacity;

                    return (
                      <label
                        key={slot.id}
                        className={`block p-2.5 border transition-colors cursor-pointer ${
                          isFull
                            ? 'bg-paper-muted border-paper-border opacity-60 cursor-not-allowed'
                            : isSelected
                            ? 'bg-brand-light border-brand-primary'
                            : 'bg-white border-paper-border hover:bg-paper-warm'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="pickup_slot"
                              value={slot.label}
                              disabled={isFull}
                              checked={isSelected}
                              onChange={() => setSelectedSlot(slot.label)}
                              className="text-brand-primary focus:ring-brand-primary"
                            />
                            <span className={`font-semibold ${isSelected ? 'text-brand-deep' : 'text-ink'}`}>
                              {slot.label}
                            </span>
                          </div>
                          <span className={`text-[10px] px-1.5 py-0.2 font-mono ${isFull ? 'bg-red-100 text-red-700' : 'bg-paper-muted text-ink-muted'}`}>
                            {isFull ? 'SLOT FULL' : `${slot.currentBookings}/${slot.capacity} booked`}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Student Information Form */}
              <div className="space-y-2 pt-2 border-t border-paper-border">
                <h3 className="font-bold text-ink uppercase tracking-wider text-[11px]">
                  Student Details
                </h3>

                <div>
                  <label className="block text-ink font-semibold mb-1">
                    Student Full Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="e.g. Aditya Sharma"
                    required
                    className="w-full px-3 py-1.5 bg-paper-warm border border-paper-borderStrong text-ink focus:outline-none focus:border-brand-primary focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-ink font-semibold mb-1">
                      USN / Roll No. (Optional)
                    </label>
                    <input
                      type="text"
                      value={studentUSN}
                      onChange={(e) => setStudentUSN(e.target.value)}
                      placeholder="e.g. 1MS23CS014"
                      className="w-full px-3 py-1.5 bg-paper-warm border border-paper-borderStrong text-ink focus:outline-none focus:border-brand-primary focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-ink font-semibold mb-1">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full px-3 py-1.5 bg-paper-warm border border-paper-borderStrong text-ink focus:outline-none focus:border-brand-primary focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-ink font-semibold mb-1">
                    Custom Requests & Additional Notes
                  </label>
                  <textarea
                    rows={2}
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    placeholder="e.g. Need 1 extra pen if in stock, or specific staple placement."
                    className="w-full px-3 py-1.5 bg-paper-warm border border-paper-borderStrong text-ink focus:outline-none focus:border-brand-primary focus:bg-white resize-none"
                  />
                </div>
              </div>

              {/* Payment Mode Note */}
              <div className="p-3 bg-brand-light border border-brand-primary/30 text-[11px] text-brand-dark">
                <strong>Payment Mode:</strong> Pay at Pickup Counter (Cash / UPI). No advance online card payment required.
              </div>

              {/* Total & Submit Button */}
              <div className="pt-2 border-t border-paper-border space-y-3">
                <div className="flex items-baseline justify-between text-base">
                  <span className="font-semibold text-ink">Estimated Total:</span>
                  <span className="font-bold text-xl text-ink">₹{cartTotal}</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || cart.length === 0}
                  className="w-full py-2.5 bg-brand-primary hover:bg-brand-deep text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 border border-brand-deep shadow-paper disabled:opacity-50"
                >
                  <span>Prepare Order & Open GitHub Issue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-[10px] text-center text-ink-muted leading-tight">
                  This opens a prefilled GitHub Issue. Submitting that Issue completes your registration into the campus database.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

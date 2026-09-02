'use client';

import React, { useState } from 'react';
import { 
  CreditCard, 
  ShieldCheck, 
  Lock, 
  X, 
  CheckCircle2, 
  Loader2, 
  Sparkles, 
  ArrowRight, 
  Smartphone, 
  Building, 
  Wallet,
  AlertCircle
} from 'lucide-react';

interface PaymentCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: {
    orderId: string;
    amount: number;
    currency: string;
    tier: string;
    tierName: string;
    keyId: string;
    customer: {
      name: string;
      email: string;
      phone: string;
    };
  } | null;
  onPaymentSuccess: (paymentResult: {
    payment_id: string;
    order_id: string;
    signature: string;
  }) => Promise<void>;
}

export const PaymentCheckoutModal: React.FC<PaymentCheckoutModalProps> = ({
  isOpen,
  onClose,
  orderData,
  onPaymentSuccess,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking'>('card');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Card demo state
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('888');
  const [upiId, setUpiId] = useState(orderData ? `${orderData.customer.email.split('@')[0]}@okaxis` : '');

  if (!isOpen || !orderData) return null;

  const symbol = orderData.currency === 'USD' ? '$' : '₹';

  // Handle Payment Submit
  const handlePayNow = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setProcessing(true);

    try {
      // Simulate realistic secure gateway handshake & tokenization
      await new Promise((resolve) => setTimeout(resolve, 1400));

      const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const signature = `sig_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;

      await onPaymentSuccess({
        payment_id: paymentId,
        order_id: orderData.orderId,
        signature,
      });

      onClose();
    } catch (err: any) {
      setError(err?.message || 'Payment processing failed. Please try again.');
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Ambient warm glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-700/5 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={processing}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/10 transition disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-800 via-amber-700 to-amber-600 flex items-center justify-center text-amber-100 shadow-md shadow-amber-900/15">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-400" /> 256-Bit SSL Secure Gateway
              </span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Event Pass Checkout
            </h3>
          </div>
        </div>

        {/* Order Summary Box */}
        <div className="p-4 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 space-y-2.5">
          <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2">
            <span className="text-slate-400">Selected Tier:</span>
            <span className="font-bold text-white">{orderData.tier}</span>
          </div>

          <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2">
            <span className="text-slate-400">Attendee:</span>
            <span className="font-semibold text-white truncate max-w-[200px]">{orderData.customer.name}</span>
          </div>

          <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2">
            <span className="text-slate-400">Billing Email:</span>
            <span className="font-mono text-slate-200 truncate max-w-[200px]">{orderData.customer.email}</span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Total Payable:</span>
            <span className="text-2xl font-extrabold font-mono tracking-tight text-emerald-300">
              {symbol}{orderData.amount.toLocaleString()} <span className="text-xs text-slate-400 font-normal">{orderData.currency}</span>
            </span>
          </div>
        </div>

        {/* Payment Methods Tabs */}
        <div className="mt-4 grid grid-cols-3 gap-2 p-1 rounded-xl bg-white/10 border border-white/20">
          <button
            type="button"
            onClick={() => setPaymentMethod('card')}
            className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              paymentMethod === 'card'
                ? 'bg-white text-amber-50 shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Card</span>
          </button>

          <button
            type="button"
            onClick={() => setPaymentMethod('upi')}
            className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              paymentMethod === 'upi'
                ? 'bg-white text-amber-50 shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>UPI / QR</span>
          </button>

          <button
            type="button"
            onClick={() => setPaymentMethod('netbanking')}
            className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              paymentMethod === 'netbanking'
                ? 'bg-white text-amber-50 shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>NetBanking</span>
          </button>
        </div>

        {/* Form Fields */}
        <form onSubmit={handlePayNow} className="mt-4 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {paymentMethod === 'card' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                  Card Number
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="4242 •••• •••• 4242"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/60 backdrop-blur-xl border border-white/20 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                    Expiry (MM/YY)
                  </label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    placeholder="MM/YY"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/60 backdrop-blur-xl border border-white/20 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                    CVV / CVC
                  </label>
                  <input
                    type="password"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    placeholder="•••"
                    maxLength={4}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/60 backdrop-blur-xl border border-white/20 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-800"
                  />
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'upi' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                  Virtual Payment Address (VPA / UPI ID)
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="username@okhdfcbank"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/60 backdrop-blur-xl border border-white/20 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-800"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Supports Google Pay, PhonePe, Paytm, and BHIM UPI apps.
              </p>
            </div>
          )}

          {paymentMethod === 'netbanking' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                  Select Bank
                </label>
                <select
                  defaultValue="HDFC"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/60 backdrop-blur-xl border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
                >
                  <option value="HDFC">HDFC Bank</option>
                  <option value="ICICI">ICICI Bank</option>
                  <option value="SBI">State Bank of India</option>
                  <option value="AXIS">Axis Bank</option>
                  <option value="OTHER">Other Popular Banks</option>
                </select>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={processing}
              className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-semibold transition disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={processing}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-50 text-xs font-bold shadow-md shadow-stone-900/15 transition disabled:opacity-50"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                  <span>Authorizing Payment...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-300" />
                  <span>Pay {symbol}{orderData.amount.toLocaleString()} &amp; Confirm Pass</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};





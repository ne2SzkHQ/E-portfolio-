import React, { useState } from 'react';
import { Check, ShieldCheck, HardDrive, Smartphone, Sparkles, Loader2, CreditCard } from 'lucide-react';
import { StoragePlan, TraineeProfile } from '../types';
import { STORAGE_PLANS } from '../data';

interface StoragePlansProps {
  activeProfile: TraineeProfile | null;
  onUpgradePlan: (planId: string) => void;
  setCurrentView: (view: string) => void;
}

export default function StoragePlans({
  activeProfile,
  onUpgradePlan,
  setCurrentView
}: StoragePlansProps) {
  const [selectedPlan, setSelectedPlan] = useState<StoragePlan | null>(null);
  const [checkoutMode, setCheckoutMode] = useState(false);
  const [mpesaNumber, setMpesaNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const activePlan = activeProfile 
    ? STORAGE_PLANS.find(p => p.id === activeProfile.storagePlanId) 
    : STORAGE_PLANS[1]; // default standard plan as selected visually

  const handleOpenCheckout = (plan: StoragePlan) => {
    setSelectedPlan(plan);
    setCheckoutMode(true);
    setCheckoutSuccess(false);
    // Autofill Kenyan format phone number for demo convenience
    setMpesaNumber('0712345678');
  };

  const handleMpesaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mpesaNumber) return;

    setIsProcessing(true);

    // Simulate STK Push delay
    setTimeout(() => {
      setIsProcessing(false);
      setCheckoutSuccess(true);
      
      // Update global profile storage limit
      if (selectedPlan && activeProfile) {
        onUpgradePlan(selectedPlan.id);
      }

      // Hide checkout modal after success
      setTimeout(() => {
        setCheckoutMode(false);
        setSelectedPlan(null);
        setCheckoutSuccess(false);
      }, 2000);
    }, 2500);
  };

  return (
    <div id="storage-plans-section" className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-[10px] font-black text-purple-600 bg-purple-50 px-3 py-1 rounded-lg uppercase tracking-[0.2em] inline-block mb-3">
          ePortfolio Storage Tiers
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight animate-fadeIn">
          Cloud Repository Allocation Plans
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 font-medium">
          Select secure national cloud memory thresholds mandated for archiving industrial project files, heavy video evidence, and assessor records.
        </p>

        {activeProfile && activePlan && (
          <div className="mt-4 inline-flex items-center gap-2 bg-slate-900 text-white text-xs px-4 py-2 rounded-full font-bold shadow-md">
            <HardDrive className="h-4 w-4 text-purple-400" />
            Active Limit: {activePlan.name} ({activePlan.limitLabel})
          </div>
        )}
      </div>

      {/* Grid of plans - Bento Style */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {STORAGE_PLANS.map((plan) => {
          const isUserPlan = activeProfile && activeProfile.storagePlanId === plan.id;
          const isRecommended = plan.badge !== undefined;

          return (
            <div
              id={`plan-card-${plan.id}`}
              key={plan.id}
              className={`rounded-3xl bg-white p-8 relative flex flex-col justify-between transition-all duration-300 ${
                isUserPlan 
                  ? 'border-2 border-[#5D45D1] shadow-xl shadow-purple-500/5 ring-4 ring-purple-500/5' 
                  : isRecommended
                    ? 'border-2 border-purple-600 shadow-xl shadow-purple-500/10'
                    : 'border border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-white'
              }`}
            >
              {/* Badge label */}
              {isUserPlan && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#5D45D1] px-3 py-1 text-[9px] font-black uppercase tracking-widest text-white shadow-md flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Active Plan
                </span>
              )}

              {!isUserPlan && isRecommended && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-purple-600 text-white text-[9px] px-3 py-1 font-black uppercase tracking-widest shadow-md">
                  {plan.badge}
                </span>
              )}

              <div>
                {/* Plan Header */}
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${
                  isRecommended && !isUserPlan ? 'text-purple-600' : 'text-slate-400'
                }`}>
                  {plan.name}
                </p>
                
                <div className="mt-4 flex items-baseline text-slate-950">
                  <span className="text-3xl font-black tracking-tight">
                    KES {plan.priceKes.toLocaleString()}
                  </span>
                  <span className="ml-1 text-xs font-semibold text-slate-400">/yr</span>
                </div>

                <p className="text-xs text-slate-500 mt-2 font-medium">
                  Allocates <strong className="text-slate-800 font-bold">{plan.limitLabel}</strong> of compliant cloud vaults.
                </p>

                {/* Features List */}
                <ul className="mt-6 space-y-3 text-[11px] text-slate-600 uppercase font-bold border-t border-slate-100 pt-5">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-[#5D45D1] rounded-full mr-2.5 shrink-0"></div>
                      <span className="truncate">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action button */}
              <div className="mt-8">
                {isUserPlan ? (
                  <button
                    id={`plan-btn-active-${plan.id}`}
                    disabled
                    className="w-full text-center rounded-xl bg-purple-50 text-purple-700 py-3.5 text-xs font-black uppercase tracking-wider border border-purple-200 cursor-not-allowed"
                  >
                    Currently Operating
                  </button>
                ) : activeProfile ? (
                  <button
                    id={`plan-btn-upgrade-${plan.id}`}
                    onClick={() => handleOpenCheckout(plan)}
                    className={`w-full text-center rounded-xl py-3.5 text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                      isRecommended 
                        ? 'bg-[#5D45D1] text-white shadow-lg shadow-purple-500/20 hover:bg-purple-700 cursor-pointer'
                        : 'bg-slate-900 text-white hover:bg-slate-800 cursor-pointer'
                    }`}
                  >
                    Subscribe with M-Pesa
                  </button>
                ) : (
                  <button
                    id={`plan-btn-verify-${plan.id}`}
                    onClick={() => setCurrentView('activation')}
                    className="w-full text-center rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 py-3.5 text-xs font-black uppercase tracking-wider border border-slate-200 transition-colors cursor-pointer"
                  >
                    Verify Profile to Subscribe
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Simulated M-Pesa Checkout Overlay Modal */}
      {checkoutMode && selectedPlan && (
        <div id="checkout-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl p-6 sm:p-8">
            <div className="text-center">
              {/* Payment Brand Logo */}
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 font-black text-[#5D45D1] text-xl shadow-xs">
                M
              </div>
              <h3 className="mt-4 text-lg font-black text-slate-900 tracking-tight">
                Safaricom M-PESA STK Checkout
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Authorized payment gateway for EduBridge ePortfolio and TVET CDACC platform.
              </p>
            </div>

            {/* Price review */}
            <div className="mt-5 bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block font-bold uppercase tracking-wider text-[9px]">PLAN SELECTED</span>
                <span className="font-bold text-slate-800">{selectedPlan.name} ({selectedPlan.limitLabel})</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block font-bold uppercase tracking-wider text-[9px]">TOTAL AMOUNT</span>
                <span className="font-black text-slate-950 text-sm">KES {selectedPlan.priceKes.toLocaleString()}</span>
              </div>
            </div>

            {checkoutSuccess ? (
              <div className="mt-6 text-center py-6 space-y-3 animate-scaleIn">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-[#5D45D1]">
                  <Check className="h-6 w-6 stroke-[3]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Payment Successfully Received!</h4>
                  <p className="text-xs text-slate-500 mt-1">Your cloud storage has been expanded to {selectedPlan.limitLabel} immediately.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleMpesaSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    Safaricom M-Pesa Mobile Number
                  </label>
                  <div className="mt-2 relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 text-xs font-mono">
                      +254
                    </div>
                    <input
                      id="mpesa-phone-input"
                      type="tel"
                      pattern="[0-9]{9,10}"
                      placeholder="e.g., 712345678"
                      value={mpesaNumber}
                      onChange={(e) => setMpesaNumber(e.target.value)}
                      className="block w-full pl-14 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-mono text-slate-800 focus:border-purple-500 focus:bg-white focus:outline-hidden transition-all"
                      required
                      disabled={isProcessing}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1.5 block leading-relaxed font-medium">
                    Format: 07xxxxxxxx or 7xxxxxxxx. An M-Pesa PIN prompt will be sent instantly to your phone.
                  </span>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    id="btn-mpesa-cancel"
                    type="button"
                    onClick={() => {
                      setCheckoutMode(false);
                      setSelectedPlan(null);
                    }}
                    className="w-1/2 py-3.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                    disabled={isProcessing}
                  >
                    Cancel Checkout
                  </button>

                  <button
                    id="btn-mpesa-submit"
                    type="submit"
                    className="w-1/2 py-3.5 rounded-xl bg-[#5D45D1] text-white text-xs font-bold shadow-md shadow-purple-500/10 hover:bg-purple-700 transition flex items-center justify-center gap-2"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Awaiting PIN...
                      </>
                    ) : (
                      <>
                        <Smartphone className="h-4 w-4" />
                        Send STK Push
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { Heart, CreditCard, Gift, ShieldCheck } from 'lucide-react';

const Donation = () => {
  const [amount, setAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState<string>('');

  const handleDonate = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = customAmount ? parseInt(customAmount) : amount;
    alert(`Mock Payment Flow Initiated for ₹${finalAmount}. In production, this would redirect to Razorpay/Stripe.`);
  };

  return (
    <div className="flex-grow py-12 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <Heart className="w-20 h-20 text-amber-500 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
          <h1 className="text-5xl font-extrabold text-white tracking-tight drop-shadow-lg">Make a Donation</h1>
          <p className="mt-4 text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            Your support provides emergency relief, clean water, medical supplies, and temporary shelter to families affected by the floods.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Monetary Donation */}
          <div className="bg-black/40 backdrop-blur-2xl p-8 rounded-[2.5rem] shadow-2xl border border-white/20">
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-emerald-500/20 p-3 rounded-2xl text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                <CreditCard size={28} />
              </div>
              <h2 className="text-3xl font-bold text-white">Monetary Fund</h2>
            </div>
            
            <form onSubmit={handleDonate} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-3">Select Amount (INR)</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {[500, 1000, 2000, 5000].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => { setAmount(val); setCustomAmount(''); }}
                      className={`py-3 rounded-xl font-bold transition-all ${
                        amount === val && !customAmount
                          ? 'bg-emerald-500/30 border border-emerald-500/50 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                          : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      ₹{val}
                    </button>
                  ))}
                </div>
                <input 
                  type="number" 
                  placeholder="Custom Amount"
                  value={customAmount}
                  onChange={(e) => { setCustomAmount(e.target.value); setAmount(0); }}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 text-white placeholder-white/30 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Donor Name</label>
                <input type="text" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 text-white placeholder-white/30 transition-all" placeholder="John Doe" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Email (for receipt)</label>
                <input type="email" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 text-white placeholder-white/30 transition-all" placeholder="john@example.com" />
              </div>

              <button type="submit" className="w-full mt-4 bg-emerald-600/80 hover:bg-emerald-500 backdrop-blur-md border border-emerald-500/50 text-white font-extrabold py-4 px-4 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] hover:-translate-y-1 flex items-center justify-center gap-2 text-lg">
                Donate {customAmount ? `₹${customAmount}` : (amount ? `₹${amount}` : '')}
              </button>
              
              <div className="flex items-center justify-center gap-2 text-sm text-white/50 mt-6">
                <ShieldCheck size={16} className="text-emerald-400" /> 100% Secure Checkout
              </div>
            </form>
          </div>

          {/* Material Donation Info */}
          <div className="bg-white/5 backdrop-blur-2xl text-white p-8 rounded-[2.5rem] shadow-2xl border border-white/10 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute -right-10 -top-10 opacity-10 blur-[2px] transform rotate-12">
              <Gift size={200} />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-amber-500/20 p-3 rounded-2xl text-amber-400 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                  <Gift size={28} />
                </div>
                <h2 className="text-3xl font-bold text-white">Material Donations</h2>
              </div>
              
              <p className="text-white/70 mb-8 text-lg leading-relaxed">
                We are actively accepting physical relief materials at our designated collection centers across the state.
              </p>
              
              <h3 className="font-bold text-xl mb-4 text-amber-300">High Priority Items:</h3>
              <ul className="space-y-4 mb-8 text-white/80">
                <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.8)]"></span> Dry Rations & Bottled Water</li>
                <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.8)]"></span> Basic Medicines & ORS</li>
                <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.8)]"></span> Blankets, Tarpaulins & Tents</li>
                <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.8)]"></span> Sanitary Pads & Baby Food</li>
              </ul>
            </div>

            <div className="bg-black/30 backdrop-blur-md p-6 rounded-2xl border border-white/10 relative z-10 mt-auto">
              <p className="font-bold text-amber-300 mb-2">Primary Collection Center:</p>
              <p className="text-white/70 leading-relaxed">
                Cotton University Ground<br/>
                Pan Bazaar, Guwahati 781001<br/>
                Mon-Sun, 9 AM - 6 PM
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Donation;

import { useState, useEffect } from 'react';
import { Heart, CreditCard, Gift, ShieldCheck, CheckCircle2, Loader2, Sparkles, X, Printer, PackageCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { socket } from '../utils/socket';

interface DonationStats {
  totalAmount: number;
  monetaryDonorsCount: number;
  suppliesPledgedCount: number;
  totalContributions: number;
}

interface DonationReceipt {
  receiptNumber: string;
  transactionId: string;
  donorName: string;
  email: string;
  amount: number;
  paymentType: 'monetary' | 'supplies';
  supplyItem?: string;
  quantity?: number;
  createdAt: string;
}

const Donation = () => {
  const [activeTab, setActiveTab] = useState<'monetary' | 'supplies'>('monetary');
  const [amount, setAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [donorName, setDonorName] = useState('');
  const [email, setEmail] = useState('');
  const [supplyItem, setSupplyItem] = useState('Bottled Drinking Water & Tablets');
  const [supplyQuantity, setSupplyQuantity] = useState(10);
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState<DonationReceipt | null>(null);

  const [stats, setStats] = useState<DonationStats>({
    totalAmount: 148500,
    monetaryDonorsCount: 42,
    suppliesPledgedCount: 28,
    totalContributions: 70
  });

  const fetchStats = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/donations/stats`);
      const data = await res.json();
      if (data.success && data.data) {
        setStats(data.data);
      }
    } catch (err) {
      console.warn('Failed to load live donation telemetry:', err);
    }
  };

  useEffect(() => {
    fetchStats();

    const handleNewDonation = () => {
      fetchStats();
    };

    socket.on('donation-received', handleNewDonation);
    return () => {
      socket.off('donation-received', handleNewDonation);
    };
  }, []);

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorName || !email) {
      toast.error('Please enter your name and email');
      return;
    }

    const finalAmount = activeTab === 'monetary' 
      ? (customAmount ? parseInt(customAmount) : amount) 
      : 0;

    if (activeTab === 'monetary' && (!finalAmount || finalAmount < 10)) {
      toast.error('Minimum contribution amount is ₹10');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/donations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          donorName,
          email,
          paymentType: activeTab,
          amount: finalAmount,
          supplyItem: activeTab === 'supplies' ? supplyItem : undefined,
          quantity: activeTab === 'supplies' ? supplyQuantity : undefined
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Payment processing failed');
      }

      toast.success(data.message);
      setReceipt(data.data);
      fetchStats();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Could not process contribution');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative z-10 bg-[#0b0f19]">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto mb-3 text-amber-400">
            <Heart className="w-7 h-7" />
          </div>
          <div className="text-[10px] font-mono tracking-widest text-amber-400 uppercase font-bold mb-1">
            RELIEF SUPPLY &amp; RESOURCE DISPATCH
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Support Disaster Relief</h1>
          <p className="mt-2 text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
            Provide direct monetary contributions or supply essential rations, drinking water, and medical kits to active relief camps.
          </p>
        </div>

        {/* Live Operational Metrics Ribbon */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#0f172a] p-4 rounded-2xl border border-slate-800 text-center">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Total Aid Mobilized</div>
            <div className="text-2xl font-extrabold font-mono text-emerald-400 mt-1">₹{stats.totalAmount.toLocaleString('en-IN')}</div>
          </div>
          <div className="bg-[#0f172a] p-4 rounded-2xl border border-slate-800 text-center">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Monetary Donors</div>
            <div className="text-2xl font-extrabold font-mono text-cyan-400 mt-1">{stats.monetaryDonorsCount}</div>
          </div>
          <div className="bg-[#0f172a] p-4 rounded-2xl border border-slate-800 text-center">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Material Pledges</div>
            <div className="text-2xl font-extrabold font-mono text-amber-400 mt-1">{stats.suppliesPledgedCount}</div>
          </div>
          <div className="bg-[#0f172a] p-4 rounded-2xl border border-slate-800 text-center">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Total Contributions</div>
            <div className="text-2xl font-extrabold font-mono text-purple-400 mt-1">{stats.totalContributions}</div>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex justify-center">
          <div className="bg-slate-900 p-1.5 rounded-2xl border border-slate-800 flex gap-2">
            <button
              onClick={() => setActiveTab('monetary')}
              className={`px-5 py-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'monetary'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CreditCard size={16} />
              <span>Direct Relief Fund (INR)</span>
            </button>
            <button
              onClick={() => setActiveTab('supplies')}
              className={`px-5 py-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'supplies'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Gift size={16} />
              <span>Material Supply Pledge</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Active Contribution Form */}
          <div className="bg-[#0f172a] p-6 sm:p-8 rounded-2xl shadow-2xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-2.5 rounded-xl border ${activeTab === 'monetary' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}`}>
                  {activeTab === 'monetary' ? <CreditCard size={22} /> : <Gift size={22} />}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {activeTab === 'monetary' ? 'Direct Relief Fund' : 'Pledge Logistics Materials'}
                  </h2>
                  <span className={`text-[11px] font-mono ${activeTab === 'monetary' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {activeTab === 'monetary' ? 'INSTANT AID DEPLOYMENT' : 'PHYSICAL WAREHOUSE LOGISTICS'}
                  </span>
                </div>
              </div>
              
              <form onSubmit={handleDonate} className="space-y-4">
                {activeTab === 'monetary' ? (
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-2">Contribution Amount (INR)</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                      {[500, 1000, 2000, 5000].map(val => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => { setAmount(val); setCustomAmount(''); }}
                          className={`py-2 rounded-xl text-xs font-mono font-bold transition-all border ${
                            amount === val && !customAmount
                              ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          ₹{val}
                        </button>
                      ))}
                    </div>
                    <input 
                      type="number" 
                      placeholder="Enter custom amount (₹)"
                      value={customAmount}
                      onChange={(e) => { setCustomAmount(e.target.value); setAmount(0); }}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-white placeholder-slate-500 text-sm font-mono transition-all"
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1">Select Supply Type</label>
                      <select
                        value={supplyItem}
                        onChange={e => setSupplyItem(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:ring-1 focus:ring-amber-500 focus:border-amber-500 text-white text-sm transition-all font-mono"
                      >
                        <option value="Bottled Drinking Water & Tablets">Bottled Drinking Water &amp; Purification Tablets</option>
                        <option value="Dry Ready-to-Eat Rations & Baby Milk">Dry Ready-to-Eat Rations &amp; Baby Milk</option>
                        <option value="Tarpaulins & Sleeping Mats">Tarpaulins, Sleeping Mats &amp; Heavy Ropes</option>
                        <option value="First Aid Kits & Antiseptic Solutions">First Aid Kits &amp; Antiseptic Solutions</option>
                        <option value="Sanitary & Hygiene Care Packs">Sanitary &amp; Hygiene Care Packs</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1">Estimated Quantity (Units/Packs)</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={supplyQuantity}
                        onChange={e => setSupplyQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:ring-1 focus:ring-amber-500 focus:border-amber-500 text-white text-sm font-mono transition-all"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1">Donor Name *</label>
                  <input 
                    type="text" 
                    required 
                    value={donorName}
                    onChange={e => setDonorName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-white placeholder-slate-500 text-sm transition-all" 
                    placeholder="Your name or organization" 
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1">Email Address *</label>
                  <input 
                    type="email" 
                    required 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-white placeholder-slate-500 text-sm transition-all" 
                    placeholder="For instant 80G tax receipt" 
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className={`w-full mt-3 font-mono font-bold py-3.5 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm uppercase tracking-wider text-white ${
                    activeTab === 'monetary'
                      ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950'
                      : 'bg-amber-600 hover:bg-amber-500 shadow-amber-950'
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Transacting with EOC Gateway...</span>
                    </>
                  ) : activeTab === 'monetary' ? (
                    `Contribute ${customAmount ? `₹${customAmount}` : (amount ? `₹${amount}` : '')}`
                  ) : (
                    `Pledge ${supplyQuantity} Units to Warehouse`
                  )}
                </button>
                
                <div className="flex items-center justify-center gap-2 text-xs font-mono text-slate-500 mt-4">
                  <ShieldCheck size={14} className="text-emerald-400" /> ENCRYPTED SECURE CHANNEL • 80G TAX EXEMPTION
                </div>
              </form>
            </div>
          </div>

          {/* Material Donation Info & Warehouse Hub */}
          <div className="bg-[#0f172a] text-white p-6 sm:p-8 rounded-2xl shadow-2xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-amber-500/10 p-2.5 rounded-xl text-amber-400 border border-amber-500/30">
                  <Gift size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Logistics &amp; Warehouse Hub</h2>
                  <span className="text-[11px] font-mono text-amber-400">PHYSICAL SUPPLY CHAIN</span>
                </div>
              </div>
              
              <p className="text-slate-400 text-xs sm:text-sm mb-6 leading-relaxed">
                Collection centers are equipped to receive verified essential goods, store them securely, and dispatch them to cut-off flood districts.
              </p>
              
              <h3 className="font-bold text-xs font-mono uppercase tracking-wider text-slate-300 mb-3">Critical Shortage Items:</h3>
              <ul className="space-y-2.5 mb-6 text-xs font-mono text-slate-300">
                <li className="flex items-center gap-2.5"><span className="w-2 h-2 rounded-full bg-red-400"></span> Bottled Water &amp; Water Purification Tablets</li>
                <li className="flex items-center gap-2.5"><span className="w-2 h-2 rounded-full bg-amber-400"></span> Dry Ready-to-Eat Rations &amp; Baby Milk Powder</li>
                <li className="flex items-center gap-2.5"><span className="w-2 h-2 rounded-full bg-cyan-400"></span> Tarpaulins, Sleeping Mats &amp; Heavy-duty Ropes</li>
                <li className="flex items-center gap-2.5"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> First Aid Kits, ORS &amp; Antiseptic Solutions</li>
              </ul>
            </div>

            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 font-mono text-xs mt-4">
              <p className="font-bold text-amber-400 mb-1">CENTRAL RECEIVING WAREHOUSE:</p>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Cotton University Field Center<br/>
                Pan Bazaar, Guwahati 781001<br/>
                Operational Hours: 08:00 - 20:00 Daily<br/>
                Helpline: +91 361 223 7000
              </p>
            </div>
          </div>
        </div>

        {/* Receipt Modal */}
        {receipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-[#0f172a] rounded-2xl border border-slate-700 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Contribution Confirmed</h3>
                    <p className="text-xs font-mono text-emerald-400">OFFICIAL RELIEF DISASTER RECEIPT</p>
                  </div>
                </div>
                <button
                  onClick={() => setReceipt(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
                <div className="flex justify-between pb-2 border-b border-slate-800/80">
                  <span className="text-slate-400">RECEIPT NO:</span>
                  <span className="text-cyan-400 font-bold">{receipt.receiptNumber}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-800/80">
                  <span className="text-slate-400">TRANSACTION ID:</span>
                  <span className="text-slate-200">{receipt.transactionId}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-800/80">
                  <span className="text-slate-400">DONOR:</span>
                  <span className="text-white font-bold">{receipt.donorName}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-800/80">
                  <span className="text-slate-400">EMAIL:</span>
                  <span className="text-slate-300">{receipt.email}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-800/80">
                  <span className="text-slate-400">TYPE:</span>
                  <span className="text-white uppercase">{receipt.paymentType}</span>
                </div>
                {receipt.paymentType === 'monetary' ? (
                  <div className="flex justify-between pb-2 border-b border-slate-800/80">
                    <span className="text-slate-400">AMOUNT:</span>
                    <span className="text-emerald-400 font-bold text-base">₹{receipt.amount.toLocaleString('en-IN')}</span>
                  </div>
                ) : (
                  <div className="flex justify-between pb-2 border-b border-slate-800/80">
                    <span className="text-slate-400">PLEDGED SUPPLIES:</span>
                    <span className="text-amber-400 font-bold">{receipt.quantity}x {receipt.supplyItem}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1">
                  <span className="text-slate-400">STATUS:</span>
                  <span className="text-emerald-400 font-bold">ACKNOWLEDGED &amp; LOGGED</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                An electronic tax-exemption receipt has been dispatched to <strong className="text-white">{receipt.email}</strong>. Eligible for section 80G disaster relief tax benefits.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => window.print()}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors border border-slate-700"
                >
                  <Printer size={16} />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => setReceipt(null)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-950"
                >
                  <span>Done</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Donation;


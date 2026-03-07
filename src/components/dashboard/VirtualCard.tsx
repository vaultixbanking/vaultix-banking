import { useState, useEffect } from 'react';
import { CreditCard, Copy, Eye, EyeOff, Snowflake, Settings, Shield, Check } from 'lucide-react';
import { getUser } from '../../lib/api';

const VirtualCard = () => {
  const [showDetails, setShowDetails] = useState(false);
  const [frozen, setFrozen] = useState(false);
  const [copied, setCopied] = useState('');
  const [user, setUser] = useState<{ firstName?: string; lastName?: string } | null>(null);

  useEffect(() => {
    const u = getUser();
    if (u) setUser(u);
  }, []);

  // Generate deterministic card data from user
  const cardNumber = '4532 •••• •••• 7821';
  const cardNumberFull = '4532 8912 3456 7821';
  const expiry = '09/28';
  const cvv = '•••';
  const cvvFull = '482';
  const holderName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim().toUpperCase() : 'CARD HOLDER';

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text.replace(/\s/g, ''));
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Card Visual */}
      <div className="relative">
        <div className={`relative w-full max-w-md mx-auto aspect-[1.6/1] rounded-2xl p-6 flex flex-col justify-between overflow-hidden transition-all duration-500 ${
          frozen ? 'bg-secondary-400' : 'bg-linear-to-br from-primary-600 via-primary-700 to-primary-900'
        }`}>
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-4 w-32 h-32 rounded-full border-2 border-white" />
            <div className="absolute top-8 right-8 w-24 h-24 rounded-full border-2 border-white" />
            <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full border-2 border-white" />
          </div>

          {frozen && (
            <div className="absolute inset-0 bg-secondary-600/30 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="text-center text-white">
                <Snowflake className="w-10 h-10 mx-auto mb-2 animate-pulse" />
                <p className="font-semibold">Card Frozen</p>
              </div>
            </div>
          )}

          <div className="relative z-[5]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-7 bg-amber-400 rounded-md opacity-80" />
                <Shield className="w-5 h-5 text-white/60" />
              </div>
              <span className="text-white/80 text-sm font-medium tracking-wider">VAULTIX</span>
            </div>
          </div>

          <div className="relative z-[5] space-y-3">
            <div className="flex items-center gap-3">
              <p className="text-white text-lg sm:text-xl font-mono tracking-[0.2em]">
                {showDetails ? cardNumberFull : cardNumber}
              </p>
              {showDetails && (
                <button onClick={() => copyToClipboard(cardNumberFull, 'number')} className="text-white/60 hover:text-white transition-colors">
                  {copied === 'number' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/50 text-[10px] uppercase tracking-wider">Card Holder</p>
                <p className="text-white text-sm font-medium">{holderName}</p>
              </div>
              <div className="text-right">
                <p className="text-white/50 text-[10px] uppercase tracking-wider">Expires</p>
                <p className="text-white text-sm font-medium">{expiry}</p>
              </div>
              <div className="text-right">
                <p className="text-white/50 text-[10px] uppercase tracking-wider">CVV</p>
                <p className="text-white text-sm font-medium font-mono">
                  {showDetails ? cvvFull : cvv}
                  {showDetails && (
                    <button onClick={() => copyToClipboard(cvvFull, 'cvv')} className="ml-1 inline text-white/60 hover:text-white transition-colors">
                      {copied === 'cvv' ? <Check className="w-3 h-3 inline" /> : <Copy className="w-3 h-3 inline" />}
                    </button>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card Actions */}
      <div className="flex items-center justify-center gap-4">
        <button onClick={() => setShowDetails(!showDetails)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-secondary-200 text-sm font-medium text-secondary-700 hover:bg-secondary-50 transition-all">
          {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
        <button onClick={() => setFrozen(!frozen)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${frozen ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'border border-secondary-200 text-secondary-700 hover:bg-secondary-50'}`}>
          <Snowflake className="w-4 h-4" />
          {frozen ? 'Unfreeze' : 'Freeze Card'}
        </button>
      </div>

      {/* Card Info */}
      <div className="bg-white rounded-2xl border border-secondary-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-secondary-100 flex items-center gap-3">
          <div className="bg-primary-50 w-10 h-10 rounded-xl flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h2 className="font-semibold text-secondary-900">Card Details</h2>
            <p className="text-xs text-secondary-500">Your virtual debit card information</p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-secondary-50 rounded-xl">
              <p className="text-xs text-secondary-500 mb-1">Card Type</p>
              <p className="font-semibold text-secondary-900">Virtual Debit</p>
            </div>
            <div className="p-4 bg-secondary-50 rounded-xl">
              <p className="text-xs text-secondary-500 mb-1">Network</p>
              <p className="font-semibold text-secondary-900">Visa</p>
            </div>
            <div className="p-4 bg-secondary-50 rounded-xl">
              <p className="text-xs text-secondary-500 mb-1">Status</p>
              <p className={`font-semibold ${frozen ? 'text-blue-600' : 'text-green-600'}`}>{frozen ? 'Frozen' : 'Active'}</p>
            </div>
            <div className="p-4 bg-secondary-50 rounded-xl">
              <p className="text-xs text-secondary-500 mb-1">Daily Limit</p>
              <p className="font-semibold text-secondary-900">$10,000.00</p>
            </div>
          </div>

          {/* Transaction Limits */}
          <div className="p-4 border border-secondary-100 rounded-xl">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-4 h-4 text-secondary-500" />
              <h3 className="font-medium text-secondary-900 text-sm">Spending Limits</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Online Purchases', spent: 2450, limit: 5000 },
                { label: 'ATM Withdrawals', spent: 500, limit: 1000 },
                { label: 'International', spent: 1200, limit: 3000 },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-secondary-600">{item.label}</span>
                    <span className="text-secondary-900 font-medium">${item.spent.toLocaleString()} / ${item.limit.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-secondary-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${(item.spent / item.limit) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
            <strong>Note:</strong> This is a virtual card for online purchases. Contact support to request a physical card.
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualCard;

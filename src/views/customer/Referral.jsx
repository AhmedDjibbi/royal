import { useState } from 'react';
import { useUser } from '../../context/UserContext.jsx';
import { Copy, Check, QrCode, Share2, Award, Users, Gift, TrendingUp } from 'lucide-react';

export const Referral = () => {
  const { user } = useUser();
  const [copied, setCopied] = useState(false);
  const [qrColor, setQrColor] = useState('e1ad24'); // Default gold color for QR code
  
  // Format user name into a unique referral code
  const codeSuffix = user.name ? user.name.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 6) : 'GUEST';
  const referralCode = `RT-${codeSuffix}-8842`;
  const referralUrl = `${window.location.origin}/?ref=${referralCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(referralUrl)}&color=${qrColor}&bgcolor=0D1625`;

  // Custom styling colors for QR
  const colorOptions = [
    { label: 'Royal Gold', hex: 'e1ad24' },
    { label: 'Sleek White', hex: 'ffffff' },
    { label: 'Ocean Teal', hex: '10B981' }
  ];

  return (
    <div className="animate-fade-in max-w-5xl mx-auto py-6">
      {/* Title */}
      <div className="text-center mb-10">
        <span className="text-brand text-xs tracking-[0.2em] block mb-2">ROYAL THALASSA AMBASSADOR</span>
        <h2 className="text-4xl md:text-5xl font-serif text-white mb-4">Share The Royal Experience</h2>
        <p className="text-text-muted max-w-xl mx-auto">
          Invite your friends to enjoy the golden coast of Monastir. Give them a special welcome spa session, and earn premium rewards for every stay they book.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left column: QR Code and Sharing */}
        <div className="md:col-span-5 flex flex-col items-center w-full">
          <div className="w-full glass-card gold-border p-6 flex flex-col items-center justify-center text-center">
            <div className="relative p-4 bg-card rounded-xl border border-white/5 shadow-2xl mb-4 group transition-all duration-300 hover:border-brand/30">
              {/* QR Image */}
              <img
                src={qrCodeUrl}
                alt="Referral QR Code"
                className="w-48 h-48 rounded-lg object-contain"
              />
              <div className="absolute inset-0 bg-brand/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none flex items-center justify-center">
                <QrCode size={32} className="text-brand animate-pulse" />
              </div>
            </div>

            <span className="text-xs text-text-muted mb-4">Scan QR code to visit and refer</span>

            {/* Customizer for QR color */}
            <div className="flex gap-2 mb-2">
              {colorOptions.map((opt) => (
                <button
                  key={opt.hex}
                  onClick={() => setQrColor(opt.hex)}
                  className={`px-3 py-1 text-[0.7rem] rounded-full border transition-all cursor-pointer ${
                    qrColor === opt.hex 
                      ? 'border-brand text-brand bg-brand/5' 
                      : 'border-white/5 text-text-dim hover:text-text-muted hover:border-white/10'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: Details, Copy link, and Stats */}
        <div className="md:col-span-7 space-y-6 w-full">
          {/* Link copier */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-serif text-white mb-3 flex items-center gap-2">
              <Share2 size={18} className="text-brand" /> Your Personal Invitation Link
            </h3>
            <p className="text-sm text-text-muted mb-4">
              Copy this link and share it directly with friends via messages or email.
            </p>
            <div className="flex items-center gap-2 bg-deep p-1.5 rounded-lg border border-white/5">
              <input
                type="text"
                readOnly
                value={referralUrl}
                className="w-full bg-transparent px-3 py-2 text-xs text-text-rich font-mono border-none outline-none"
              />
              <button
                onClick={copyToClipboard}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-md transition-all cursor-pointer border-none shrink-0 ${
                  copied 
                    ? 'bg-success text-white' 
                    : 'bg-brand text-deep hover:shadow-[0_4px_15px_rgba(225,173,36,0.25)]'
                }`}
              >
                {copied ? (
                  <>
                    <Check size={14} /> Copied
                  </>
                ) : (
                  <>
                    <Copy size={14} /> Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-card p-5 border-l-2 border-brand">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-brand shrink-0">
                  <Gift size={16} />
                </div>
                <h4 className="font-serif text-white font-medium">Friend's Welcome Reward</h4>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                They get a free signature hydrotherapy session at the Royal Elysa Spa & 10% off their first dining experience at L'Agape.
              </p>
            </div>

            <div className="glass-card p-5 border-l-2 border-brand">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-brand shrink-0">
                  <Award size={16} />
                </div>
                <h4 className="font-serif text-white font-medium">Your Ambassador Reward</h4>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                Earn 10% cash back credit on your resort portfolio for every completed room booking. Credits can be used for spa, dining, or room upgrades.
              </p>
            </div>
          </div>

          {/* Stats / Dashboard */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-serif text-white mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-brand" /> Your Ambassador Dashboard
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-deep/40 p-4 rounded-lg border border-white/5">
                <Users size={18} className="text-brand mx-auto mb-2" />
                <span className="block text-2xl font-semibold text-white font-serif">12</span>
                <span className="text-[0.65rem] text-text-dim uppercase tracking-wider">Total Clicks</span>
              </div>
              <div className="bg-deep/40 p-4 rounded-lg border border-white/5">
                <Share2 size={18} className="text-brand mx-auto mb-2" />
                <span className="block text-2xl font-semibold text-white font-serif">3</span>
                <span className="text-[0.65rem] text-text-dim uppercase tracking-wider">Registered</span>
              </div>
              <div className="bg-deep/40 p-4 rounded-lg border border-white/5">
                <Award size={18} className="text-brand mx-auto mb-2" />
                <span className="block text-2xl font-semibold text-white font-serif">1</span>
                <span className="text-[0.65rem] text-text-dim uppercase tracking-wider">Active Bonus</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center text-xs text-text-muted">
              <span>Next reward unlock level: 2 bookings</span>
              <span className="text-brand font-semibold">50% Completed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Referral;

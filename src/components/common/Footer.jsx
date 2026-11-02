import { Heart, Mail, MapPin, Phone } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-linear-to-b from-[#0A1424] to-[#050A12] border-t border-white/5 pt-16 pb-8 mt-20 text-text-muted text-sm">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <img
                src="/images/logo.gif"
                alt="Thalassa Hotels"
                className="h-10 w-auto bg-black rounded-sm p-0.5"
              />
            </div>
            <p className="text-[0.85rem] leading-7 mb-5">
              Experience the pinnacle of Mediterranean hospitality at Skanes Beach, Monastir.
              Home of the world-acclaimed Royal Elysa Thalasso Spa.
            </p>
            <span className="text-brand text-xs font-semibold tracking-wide">
              ★★★★★ Luxury Thalasso Resort
            </span>
          </div>

          {/* Discover */}
          <div>
            <h4 className="text-white text-[0.95rem] font-semibold mb-5 tracking-wide">Discover</h4>
            <ul className="space-y-3 text-[0.85rem]">
              <li><a href="#" className="hover:text-brand transition-colors">Luxury Suites</a></li>
              <li><a href="#" className="hover:text-brand transition-colors">Thalasso & Hammam</a></li>
              <li><a href="#" className="hover:text-brand transition-colors">Gastronomy Menus</a></li>
              <li><a href="#" className="hover:text-brand transition-colors">Guided Sea Excursions</a></li>
            </ul>
          </div>

          {/* Policy */}
          <div>
            <h4 className="text-white text-[0.95rem] font-semibold mb-5 tracking-wide">Resort Policy</h4>
            <ul className="space-y-3 text-[0.85rem]">
              <li><a href="#" className="hover:text-brand transition-colors">Check-in / Check-out</a></li>
              <li><a href="#" className="hover:text-brand transition-colors">Exclusive Butler Services</a></li>
              <li><a href="#" className="hover:text-brand transition-colors">Cancelation Guarantee</a></li>
              <li><a href="#" className="hover:text-brand transition-colors">Private Event Bookings</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white text-[0.95rem] font-semibold mb-5 tracking-wide">Contact Coordinates</h4>
            <ul className="space-y-4 text-[0.85rem]">
              <li className="flex gap-3 items-start">
                <MapPin size={16} className="text-brand shrink-0 mt-0.5" />
                <span>Skanes Beach, BP 62, Monastir 5000, Tunisia</span>
              </li>
              <li className="flex gap-3 items-center">
                <Phone size={16} className="text-brand" />
                <span>+216 73 520 520</span>
              </li>
              <li className="flex gap-3 items-center">
                <Mail size={16} className="text-brand" />
                <span>reservations@royalthalassa.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-text-dim">
          <span>© {new Date().getFullYear()} Royal Thalassa Monastir. All rights reserved.</span>
          <span className="flex items-center gap-1">
            Crafted with <Heart size={10} className="text-danger" /> for Skanes Coastal Luxury.
          </span>
        </div>
      </div>
    </footer>
  );
};
export default Footer;

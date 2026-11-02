import { useHotel } from '../../context/HotelContext.jsx';
import { ArrowDown, ArrowRight, ArrowUpRight, CalendarDays, Check, ChevronRight, Compass, MapPin, Sparkles, Star, Waves } from 'lucide-react';

export const Home = ({ setActiveView }) => {
  const { rooms, events } = useHotel();

  const featuredRooms = rooms.slice(0, 3);
  const upcomingEvents = events.slice(0, 3);

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="home-hero relative flex items-center overflow-hidden">
        <img 
          src="/images/banner_home_hero.jpg" 
          alt="Royal Thalassa Monastir Resort" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="hero-shade absolute inset-0" />
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 pt-14 pb-28 md:py-28">
          <div className="hero-copy max-w-3xl">
          <div className="hero-kicker"><span /> A slower kind of luxury <span /></div>
          <h1 className="text-6xl md:text-8xl text-white font-serif font-normal mb-6 leading-[0.98] tracking-tight">
            Where the sea<br /><em>sets the pace.</em>
          </h1>
          <p className="text-white/75 text-base md:text-lg leading-relaxed max-w-lg mb-9">
            Find your place on Tunisia’s sunlit coast. Days shaped by the water, evenings made for lingering.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveView('rooms')}
              className="button-primary group inline-flex items-center gap-3 px-7 py-4 font-semibold text-sm transition-all duration-300 cursor-pointer border-none"
            >
              Discover your stay
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => setActiveView('activities')}
              className="button-ghost inline-flex items-center gap-2 px-6 py-4 text-white text-sm transition-all duration-300 cursor-pointer"
            >
              Explore the resort <ArrowUpRight size={15} />
            </button>
          </div>
          </div>
          <div className="hero-location"><MapPin size={14} /> SKANES COAST · MONASTIR, TUNISIA</div>
          <div className="hero-scroll"><span>Scroll to discover</span><ArrowDown size={14} /></div>
        </div>
      </section>

      <section className="home-content">
      <div className="welcome-strip">
        <span><Star size={13} fill="currentColor" /> A coastal hideaway in Monastir</span>
        <span className="welcome-divider" />
        <span>Warm hospitality, Tunisian soul</span>
        <span className="welcome-divider" />
        <span>Made for the moment</span>
      </div>

      <section className="intro-section max-w-7xl mx-auto px-6 md:px-12 py-24 md:py-32">
        <div className="intro-overline"><span>01</span> THE ROYAL TALASSA EXPERIENCE</div>
        <div className="intro-grid">
          <h2 className="intro-heading">A little further<br />from the <em>everyday.</em></h2>
          <div className="intro-copy">
            <p>Between the endless blue of the Mediterranean and the gardens of Skanes, discover a resort that feels a world away—and entirely your own.</p>
            <button onClick={() => setActiveView('activities')} className="text-link">Get to know us <ArrowRight size={15} /></button>
          </div>
        </div>
        <div className="promise-grid">
          <div><Waves size={21} /><span>THE SETTING</span><strong>Steps from the sea</strong></div>
          <div><Sparkles size={21} /><span>THE RITUAL</span><strong>Thalasso & wellbeing</strong></div>
          <div><Compass size={21} /><span>THE SPIRIT</span><strong>Rooted in Tunisia</strong></div>
        </div>
      </section>

      {/* Featured Suites */}
      <section className="home-section max-w-7xl mx-auto px-6 md:px-12 py-16">
        <div className="section-heading">
          <div>
            <div className="intro-overline"><span>02</span> STAY A WHILE</div>
            <h2 className="text-4xl md:text-5xl font-serif text-white">Spaces to <em>unwind.</em></h2>
          </div>
          <button
            onClick={() => setActiveView('rooms')}
            className="text-link"
          >
            Explore all stays <ChevronRight size={16} />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {featuredRooms.map((room, i) => (
            <div
              key={i}
              className="stay-card group overflow-hidden cursor-pointer"
              onClick={() => setActiveView('rooms')}
            >
              <div className="stay-card-image overflow-hidden relative">
                {room.image ? (
                  <img
                    src={room.image}
                    alt={room.name || room.type}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-linear-to-br from-brand/10 to-brand/3 flex items-center justify-center text-brand/30">
                    <Waves size={48} />
                  </div>
                )}
              </div>
              <div className="p-5 md:p-6">
                <div className="flex justify-between items-start gap-3 mb-2">
                  <h3 className="text-xl font-serif text-white">{room.name || room.type}</h3>
                  <span className="text-brand font-semibold whitespace-nowrap">${room.price}<span className="text-text-muted text-xs font-normal"> / night</span></span>
                </div>
                <p className="text-text-muted text-sm mb-4 line-clamp-2">
                  {room.description || 'Mediterranean luxury suite with panoramic sea views.'}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-4">
                  {(room.features || ['WiFi', 'Mini Bar', 'Sea View']).slice(0, 3).map((a, j) => (
                    <span key={j} className="amenity-chip"><Check size={11} />{a}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="experience-band">
        <div className="experience-image" />
        <div className="experience-copy">
          <div className="intro-overline"><span>03</span> MAKE TIME FOR YOU</div>
          <h2>Let the water<br /><em>work its magic.</em></h2>
          <p>Restore your rhythm at our thalasso centre, drift along the coastline, or simply find a quiet corner in the sun.</p>
          <button onClick={() => setActiveView('activities')} className="button-primary">Explore experiences <ArrowRight size={15} /></button>
        </div>
      </section>

      <section className="home-section max-w-7xl mx-auto px-6 md:px-12 py-24">
        <div className="section-heading">
          <div>
            <div className="intro-overline"><span>04</span> ON THE CALENDAR</div>
            <h2 className="text-4xl md:text-5xl font-serif text-white">Moments worth <em>keeping.</em></h2>
          </div>
          <button
            onClick={() => setActiveView('activities')}
            className="text-link"
          >
            See all experiences <ChevronRight size={16} />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {upcomingEvents.map((ev, i) => (
            <div key={i} onClick={() => setActiveView('activities')} className="event-card overflow-hidden group cursor-pointer">
              <div className="event-card-image overflow-hidden relative">
                {ev.image ? (
                  <img
                    src={ev.image}
                    alt={ev.name || ev.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-linear-to-br from-brand/5 to-info/5 flex items-center justify-center text-brand/20">
                    <CalendarDays size={40} />
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 text-[0.68rem] uppercase tracking-widest text-brand mb-3"><CalendarDays size={13} />{ev.date || 'Coming Soon'}</div>
                <h3 className="text-xl font-serif text-white mb-2">{ev.name || ev.title}</h3>
                <p className="text-text-muted text-sm line-clamp-2">{ev.description || 'An exclusive resort experience.'}</p>
                <div className="flex items-center gap-2 text-sm text-brand mt-5">Discover the moment <ArrowUpRight size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="home-cta max-w-7xl mx-auto px-6 md:px-12 pb-24">
        <div className="relative rounded-sm overflow-hidden py-16 px-6 md:px-10 text-center">
          <img 
            src="/images/banner_home_cta.jpg" 
            alt="Royal Thalassa Dining" 
            className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-deep/70" />
          <div className="relative z-10 text-center">
            <span className="cta-label">A TABLE BY THE WATER</span>
            <h2 className="text-4xl md:text-5xl font-serif text-white mb-3">Stay for the <em>flavour.</em></h2>
            <p className="text-white/75 max-w-lg mx-auto mb-7">
              Gather over local ingredients, long lunches, and the kind of sunset that asks you to order one more.
            </p>
            <button
              onClick={() => setActiveView('dining')}
              className="button-primary inline-flex items-center gap-2 px-7 py-4 font-semibold text-sm transition-all duration-300 cursor-pointer border-none"
            >
              Discover dining <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>
      </section>
    </div>
  );
};
export default Home;

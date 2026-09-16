import { useEffect, useMemo, useState, useRef } from "react";
import { Link } from "wouter";
import { ArrowUpRight, ChevronDown, Clock3, Flame, Instagram, MapPin, Menu as MenuIcon, MessageCircle, Phone, Search, Sparkles, Star, Utensils, X, MessageSquarePlus, ShoppingBag } from "lucide-react";
import ThaliScene from "@/components/ThaliScene";
import ReviewModal from "@/components/ReviewModal";
import { trpc } from "@/lib/trpc";

import { menuCategories, menuSeed } from "@shared/menuSeed";

type MenuItem = { 
  name: string; 
  category: string; 
  description: string; 
  tag?: string; 
  imageUrl?: string; 
};

const menuItems: MenuItem[] = menuSeed;
const categories = ["All", ...menuCategories];

const thaliImage = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSb8DePQXTtnKflZykc2LgbT4YEjVajNsYA-MhcKis3_w&s=10";
const chaiImage = "https://www.whiskaffair.com/wp-content/uploads/2020/10/Tandoori-Chai-2-1.jpg";

function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`reveal ${className}`}>{children}</div>;
}

// Side-by-Side Menu Card (Puri Tarah Se Rate / Price Hata Diya Gaya Hai)
function ParallaxMenuCard({ item, index, getWhatsAppLink, zomatoUrl, swiggyUrl }: { 
  item: MenuItem; 
  index: number; 
  getWhatsAppLink: (name: string) => string;
  zomatoUrl: string;
  swiggyUrl: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transformStyle, setTransformStyle] = useState("");
  const [glowStyle, setGlowStyle] = useState({ opacity: 0, x: 0, y: 0 });
  const [imgError, setImgError] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;

    setTransformStyle(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(8px) translateY(-4px)`);
    setGlowStyle({ opacity: 1, x, y });
  };

  const handleMouseLeave = () => {
    setTransformStyle("perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) translateY(0px)");
    setGlowStyle({ opacity: 0, x: 0, y: 0 });
  };

  const hasValidImage = item.imageUrl && item.imageUrl.trim().length > 0 && !imgError;

  return (
    <Reveal>
      <div 
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ 
          transform: transformStyle,
          transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease"
        }}
        className="menu-card relative overflow-hidden group rounded-2xl border border-amber-900/10 bg-gradient-to-b from-amber-50/40 to-white/90 p-5 shadow-sm hover:shadow-2xl hover:border-amber-700/30 font-sans cursor-pointer transition-all duration-400 ease-out"
      >
        <div 
          className="pointer-events-none absolute -inset-px transition-opacity duration-500 rounded-2xl"
          style={{
            opacity: glowStyle.opacity,
            background: `radial-gradient(500px circle at ${glowStyle.x}px ${glowStyle.y}px, rgba(217, 119, 6, 0.12), transparent 40%)`
          }}
        />

        <div className="flex gap-4 h-full relative z-10">
          {/* LEFT SIDE: Image Thumbnail */}
          <div className="relative shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-amber-100/60 border border-amber-900/10 shadow-inner group-hover:scale-105 transition-transform duration-500">
            {hasValidImage ? (
              <img 
                src={item.imageUrl} 
                alt={item.name} 
                onError={() => setImgError(true)}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-amber-800/40 bg-gradient-to-br from-amber-100/80 to-amber-200/40 p-2 text-center">
                <Utensils size={24} className="mb-1 text-amber-700/60 group-hover:rotate-12 transition-transform" />
                <span className="text-[10px] font-medium tracking-tight text-amber-900/60 uppercase">Pure Veg</span>
              </div>
            )}
          </div>

          {/* RIGHT SIDE: Title, Tag, Description & Buttons */}
          <div className="flex flex-col justify-between flex-1 min-w-0">
            <div>
              <div className="flex items-start justify-between gap-1 mb-1">
                <h3 className="text-base sm:text-lg font-serif text-amber-950 font-medium group-hover:text-amber-800 transition-colors duration-300 truncate">
                  {item.name}
                </h3>
                {item.tag && (
                  <span className="shrink-0 text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900">
                    {item.tag}
                  </span>
                )}
              </div>
              <p className="text-xs text-amber-950/70 leading-relaxed font-light line-clamp-2">{item.description}</p>
            </div>

            {/* Quick Action Buttons */}
            <div className="mt-3 pt-2 border-t border-amber-900/10 flex flex-wrap items-center gap-1.5">
              <a
                href={getWhatsAppLink(item.name)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium text-emerald-800 bg-emerald-100/80 hover:bg-emerald-200 rounded-full transition-all duration-300 hover:scale-105 active:scale-95"
                title="Order via WhatsApp"
              >
                <MessageCircle size={11} /> WhatsApp
              </a>

              <a
                href={zomatoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium text-red-800 bg-red-100/80 hover:bg-red-200 rounded-full transition-all duration-300 hover:scale-105 active:scale-95"
                title="Order on Zomato"
              >
                <ShoppingBag size={11} /> Zomato
              </a>

              <a
                href={swiggyUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium text-orange-800 bg-orange-100/80 hover:bg-orange-200 rounded-full transition-all duration-300 hover:scale-105 active:scale-95"
                title="Order on Swiggy"
              >
                <ShoppingBag size={11} /> Swiggy
              </a>
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [showAllMenu, setShowAllMenu] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const liveMenuQuery = trpc.menu.list.useQuery();
  const reviewsQuery = trpc.reviews.list.useQuery();
  const businessQuery = trpc.business.info.useQuery();

  const business = businessQuery.data;
  const phone = business?.phone || "7467881994"; // 👈 Updated fallback to 7467881994
  const businessName = business?.businessName || "THE RASOI VEG. CUISINE";
  const location = business?.location || "Haridwar, Uttarakhand";
  const hours = business?.hours || "7:00 AM — 9:00 PM";
  const zomatoUrl = business?.zomatoUrl || "https://www.zomato.com/";
  const swiggyUrl = business?.swiggyUrl || "https://www.swiggy.com/city/haridwar/the-rasoi-veg-cuisine-jwalapur-rest1124173";
  const isOpen = business?.takeawayAvailable === 1;

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [showAllMenu]);

  const liveMenuItems: MenuItem[] = useMemo(() => {
    if (!liveMenuQuery.data?.length) return menuItems;
    return liveMenuQuery.data.map((item: any) => ({
      name: item.name,
      category: item.category || "Main Course / Sabji",
      description: item.description || "",
      imageUrl: item.imageUrl || "",
      tag: item.featured ? "Featured" : item.tag,
    }));
  }, [liveMenuQuery.data]);

  const filteredMenu = useMemo(() => liveMenuItems.filter((item) => {
    const matchesCategory = category === "All" || item.category === category;
    const matchesQuery = `${item.name} ${item.description}`.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  }), [category, query, liveMenuItems]);

  const getWhatsAppLink = (dishName: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    const message = `Namaste! I would like to order *${dishName}* from ${businessName}. Please confirm.`;
    return `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <div className="site-shell">
      <div className="top-strip">
        <span>
          {businessName.toUpperCase()}&nbsp; · &nbsp;{location.toUpperCase()}&nbsp; · &nbsp;
          <strong className={isOpen ? "text-green-300" : "text-red-300"}>
            {isOpen ? "🟢 TAKING ORDERS NOW" : "🔴 KITCHEN CLOSED CURRENTLY"}
          </strong>
          &nbsp; · &nbsp;ORDER ON ZOMATO & SWIGGY&nbsp; · &nbsp;{phone}
        </span>
        <span className="top-strip-right"><Clock3 size={14} /> Order timing {hours}</span>
      </div>

      <header className="nav-wrap">
        <div className="container nav-inner">
          <button className="wordmark" onClick={() => scrollTo("home")} aria-label="Back to top">
            <span className="wordmark-mark">रसोई</span><span className="wordmark-copy"><b>The Rasoi</b><small>Veg. Cuisine</small></span>
          </button>
          <nav className={`nav-links ${menuOpen ? "mobile-open" : ""}`} aria-label="Main navigation">
            <button onClick={() => scrollTo("our-story")}>Our story</button>
            <button onClick={() => scrollTo("menu")}>Menu</button>
            <button onClick={() => scrollTo("why-us")}>Why us</button>
            <button onClick={() => scrollTo("reviews")}>Reviews</button>
            <button onClick={() => scrollTo("contact")}>Contact</button>
          </nav>
          <div className="nav-actions">
            <Link className="admin-link" href="/admin">Admin</Link>
            <a className="button button-burgundy button-small hover:scale-105 active:scale-95 transition-all" href={zomatoUrl} target="_blank" rel="noreferrer">Order now <ArrowUpRight size={15} /></a>
            <button className="mobile-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">{menuOpen ? <X /> : <MenuIcon />}</button>
          </div>
        </div>
      </header>

      <main>
        <section id="home" className="hero-section">
          <div className="hero-pattern" aria-hidden="true" />
          <div className="container hero-grid">
            <div className="hero-copy">
              <div className="eyebrow"><span className="eyebrow-dot" /> {location}'s home-style cloud kitchen</div>
              <h1>Ghar jaisa khana.<br /><em>Made fresh for you.</em></h1>
              <p className="hero-lede">Honest, comforting vegetarian food made fresh to order — the kind that tastes like somebody cared.</p>
              <div className="hero-actions">
                <a className="button button-burgundy hover:scale-105 active:scale-95 transition-transform duration-300" href={zomatoUrl} target="_blank" rel="noreferrer">Order on Zomato <ArrowUpRight size={17} /></a>
                <a className="button button-outline hover:scale-105 active:scale-95 transition-transform duration-300" href={swiggyUrl} target="_blank" rel="noreferrer">Order on Swiggy <ArrowUpRight size={17} /></a>
              </div>
              <div className="hero-meta">
                <span><span className="meta-icon"><Utensils size={16} /></span> Pure vegetarian</span>
                <span><span className="meta-icon"><MapPin size={16} /></span> {location}</span>
              </div>
            </div>
            <div className="hero-visual">
              <div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" />
              <div className="scene-label label-top"><span>01</span><span>thali, with a little love</span></div>
              <ThaliScene />
              <div className="hero-image-card hover:scale-105 transition-all duration-500 ease-out">
                <img 
                  src={thaliImage} 
                  alt="Vegetarian thali served in a brass plate" 
                  className="object-cover w-full h-full"
                />
                <span>Fresh from our rasoi</span>
              </div>
              <div className="hero-stamp"><span>100%</span><small>desi<br />comfort</small></div>
            </div>
          </div>
          <div className="scroll-cue"><span>Scroll to explore</span><ChevronDown size={16} /></div>
        </section>

        <section className="trust-band">
          <div className="container trust-inner">
            <span>Daily comfort, plated</span><span className="trust-line" />
            <span>{hours}</span><span className="trust-line" />
            <span>Takeaway available</span><span className="trust-line" />
            <span>Order on Zomato · Swiggy</span>
          </div>
        </section>

        <section id="our-story" className="story-section section-padding">
          <div className="container story-grid">
            <Reveal className="story-image-wrap">
              <div className="story-image-frame hover:scale-105 transition-transform duration-500 ease-out">
                <img 
                  src={chaiImage} 
                  alt="Steaming kulhad chai" 
                  className="object-cover w-full h-full"
                />
                <div className="image-note">chai pe charcha</div>
              </div>
              <span className="vertical-label">THE RASOI / 2026</span>
            </Reveal>
            <Reveal className="story-copy">
              <div className="eyebrow"><span className="eyebrow-dot" /> A little about us</div>
              <h2>Not a restaurant.<br /><em>Just a really good rasoi.</em></h2>
              <p>We started {businessName} for the days when you want ghar ka khana, but ghar is a little too far away. Every plate leaves our kitchen warm, familiar and full of the small details that make simple food special.</p>
              <p>Think desi ghee on tawa rotis, fresh tadka on dal, a cool glass of chhach and chai in a kulhad. No fuss. No shortcuts. Just food that feels good.</p>
              <a className="text-link hover:translate-x-1 transition-transform inline-flex items-center" href={`tel:${phone}`}>Call us on {phone} <ArrowUpRight size={16} /></a>
            </Reveal>
          </div>
        </section>

        <section id="menu" className="menu-section section-padding">
          <div className="container">
            <Reveal className="section-heading-row">
              <div><div className="eyebrow"><span className="eyebrow-dot" /> From our kitchen</div><h2>What are you<br /><em>craving today?</em></h2></div>
              <button className="button button-cream hover:scale-105 transition-transform duration-300" onClick={() => setShowAllMenu(!showAllMenu)}>{showAllMenu ? "Show favourites" : "View full menu"} <ArrowUpRight size={17} /></button>
            </Reveal>
            <Reveal className="menu-tools">
              <div className="category-pills">{categories.map((item) => <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div>
              <label className="search-box"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search dishes" aria-label="Search menu" /></label>
            </Reveal>
            
            <div className="menu-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMenu.slice(0, showAllMenu ? filteredMenu.length : 9).map((item, index) => (
                <ParallaxMenuCard 
                  key={item.name} 
                  item={item} 
                  index={index} 
                  getWhatsAppLink={getWhatsAppLink} 
                  zomatoUrl={zomatoUrl} 
                  swiggyUrl={swiggyUrl} 
                />
              ))}
            </div>
            {filteredMenu.length === 0 && <div className="empty-menu">No dishes matched that search. Try “chai” or “thali”.</div>}
          </div>
        </section>

        <section id="why-us" className="why-section section-padding">
          <div className="container">
            <Reveal className="section-heading centered">
              <div className="eyebrow"><span className="eyebrow-dot" /> The rasoi promise</div>
              <h2>Simple things.<br /><em>Done properly.</em></h2>
              <p>Food that respects your time, your budget and the comfort you came looking for.</p>
            </Reveal>
            <div className="promise-grid">
              <Reveal className="promise-card promise-card-dark hover:-translate-y-2 hover:shadow-2xl transition-all duration-500 ease-out"><span className="promise-num">01</span><Flame size={25} /><h3>Cooked fresh</h3><p>We start cooking when you order. Your tadka should sound alive.</p></Reveal>
              <Reveal className="promise-card hover:-translate-y-2 hover:shadow-2xl transition-all duration-500 ease-out"><span className="promise-num">02</span><Sparkles size={25} /><h3>Kitchen clean</h3><p>Small-batch prep, honest ingredients and a kitchen we are proud of.</p></Reveal>
              <Reveal className="promise-card hover:-translate-y-2 hover:shadow-2xl transition-all duration-500 ease-out"><span className="promise-num">03</span><Utensils size={25} /><h3>Desi by heart</h3><p>Recipes that feel familiar, from vrat thali to kulhad chai.</p></Reveal>
            </div>
          </div>
        </section>

        <section className="order-section section-padding">
          <div className="container order-card">
            <div className="order-copy">
              <div className="eyebrow eyebrow-light"><span className="eyebrow-dot" /> Hungry yet?</div>
              <h2>Good food is<br /><em>just a call away.</em></h2>
              <p>Order your favourites for delivery, or call ahead and pick up a warm takeaway from our kitchen.</p>
              <div className="order-actions">
                <a className="button button-cream hover:scale-105 transition-transform duration-300" href={zomatoUrl} target="_blank" rel="noreferrer">Zomato <ArrowUpRight size={17} /></a>
                <a className="button button-dark-outline hover:scale-105 transition-transform duration-300" href={swiggyUrl} target="_blank" rel="noreferrer">Swiggy <ArrowUpRight size={17} /></a>
                <a className="phone-link" href={`tel:${phone}`}><Phone size={15} /> {phone}</a>
              </div>
            </div>
            <div className="order-art">
              <div className="order-circle"><span>TAKEAWAY</span><b>गरमागरम</b><small>made for your table</small></div>
              <div className="order-doodle">✳</div>
            </div>
          </div>
        </section>

        <section id="reviews" className="review-section section-padding">
          <div className="container review-grid">
            <Reveal className="review-intro">
              <div className="eyebrow"><span className="eyebrow-dot" /> From the neighbourhood</div>
              <h2>Kind words<br /><em>from kind people.</em></h2>
              <div className="rating">
                <span className="stars">
                  <Star fill="currentColor" size={15} />
                  <Star fill="currentColor" size={15} />
                  <Star fill="currentColor" size={15} />
                  <Star fill="currentColor" size={15} />
                  <Star fill="currentColor" size={15} />
                </span>
                <b>5.0</b>
                <small>our happy regulars</small>
              </div>
              <button className="button button-burgundy mt-6 flex items-center gap-2 hover:scale-105 transition-transform duration-300" onClick={() => setIsReviewModalOpen(true)}>
                <MessageSquarePlus size={17} /> Rate us & Write a Review
              </button>
            </Reveal>

            <Reveal className="quote-card hover:shadow-2xl transition-all duration-500 ease-out hover:-translate-y-1">
              <div className="quote-mark">“</div>
              <blockquote>
                {reviewsQuery.data && reviewsQuery.data.length > 0
                  ? (reviewsQuery.data[0] as any).quote || (reviewsQuery.data[0] as any).content
                  : "It actually tastes like home. The aloo jeera and dal were so comforting, and the kulhad chai was the perfect finish."}
              </blockquote>
              <div className="quote-person">
                <span className="avatar">
                  {reviewsQuery.data && reviewsQuery.data.length > 0
                    ? ((reviewsQuery.data[0] as any).name || (reviewsQuery.data[0] as any).authorName || "A").charAt(0)
                    : "A"}
                </span>
                <span>
                  <b>
                    {reviewsQuery.data && reviewsQuery.data.length > 0
                      ? (reviewsQuery.data[0] as any).name || (reviewsQuery.data[0] as any).authorName
                      : "Ananya S."}
                  </b>
                  <small>Haridwar · Verified review</small>
                </span>
              </div>
            </Reveal>
          </div>
        </section>

        <section id="contact" className="contact-section">
          <div className="container contact-inner">
            <div><div className="eyebrow eyebrow-light"><span className="eyebrow-dot" /> Come say hello</div><h2>See you at<br /><em>the rasoi.</em></h2></div>
            <div className="contact-details">
              <div>
                <span className="detail-label">Phone / WhatsApp</span>
                <a href={`https://wa.me/91${phone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer"><MessageCircle size={17} /> {phone}</a>
              </div>
              <div>
                <span className="detail-label">Location</span>
                <p><MapPin size={17} /> {location}</p>
              </div>
              <div>
                <span className="detail-label">Hours</span>
                <p><Clock3 size={17} /> Every day · {hours}</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-inner">
          <div className="footer-brand"><span className="wordmark-mark">रसोई</span><span><b>The Rasoi</b><small>Veg. Cuisine</small></span></div>
          <p>Ghar jaisa khana. Made fresh for you.</p>
          <div className="footer-links">
            <a href="https://instagram.com" target="_blank" rel="noreferrer"><Instagram size={16} /> Instagram</a>
            <Link href="/admin">Admin dashboard</Link>
            <span>© 2026</span>
          </div>
        </div>
      </footer>

      <ReviewModal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} />
    </div>
  );
}
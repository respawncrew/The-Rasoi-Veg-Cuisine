import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowUpRight, ChevronDown, Clock3, Flame, Instagram, MapPin, Menu as MenuIcon, MessageCircle, Phone, Search, Sparkles, Star, Utensils, X, MessageSquarePlus } from "lucide-react";
import ThaliScene from "@/components/ThaliScene";
import ReviewModal from "@/components/ReviewModal";
import { trpc } from "@/lib/trpc";

import { menuCategories, menuSeed } from "@shared/menuSeed";

type MenuItem = { name: string; category: string; description: string; price: string; tag?: string };

const menuItems: MenuItem[] = menuSeed;
const categories = ["All", ...menuCategories];
const thaliImage = "/manus-storage/rasoi-thali_1fe32777.jpg";
const chaiImage = "/manus-storage/rasoi-chai_0a5080e8.jpg";

function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`reveal ${className}`}>{children}</div>;
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [showAllMenu, setShowAllMenu] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const liveMenuQuery = trpc.menu.list.useQuery();
  const reviewsQuery = trpc.reviews.list.useQuery();

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("is-visible");
      });
    }, { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [showAllMenu]);

  const liveMenuItems: MenuItem[] = useMemo(() => {
    if (!liveMenuQuery.data?.length) return menuItems;
    return liveMenuQuery.data.map(({ item, category }) => ({
      name: item.name,
      category: category ?? "From the kitchen",
      description: item.description,
      price: item.price ?? "Ask us",
      tag: item.featured ? "Featured" : undefined,
    }));
  }, [liveMenuQuery.data]);

  const filteredMenu = useMemo(() => liveMenuItems.filter((item) => {
    const matchesCategory = category === "All" || item.category === category;
    const matchesQuery = `${item.name} ${item.description}`.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  }), [category, query, liveMenuItems]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <div className="site-shell">
      <div className="top-strip"><span>THE RASOI VEG. CUISINE&nbsp; · &nbsp;HARIDWAR&nbsp; · &nbsp;TAKEAWAY AVAILABLE&nbsp; · &nbsp;ORDER ON ZOMATO&nbsp; · &nbsp;ORDER ON SWIGGY&nbsp; · &nbsp;8006771779</span><span className="top-strip-right"><Clock3 size={14} /> Order timing 7:00 AM — 9:00 PM</span></div>
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
            <a className="button button-burgundy button-small" href="https://www.zomato.com/" target="_blank" rel="noreferrer">Order now <ArrowUpRight size={15} /></a>
            <button className="mobile-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">{menuOpen ? <X /> : <MenuIcon />}</button>
          </div>
        </div>
      </header>

      <main>
        <section id="home" className="hero-section">
          <div className="hero-pattern" aria-hidden="true" />
          <div className="container hero-grid">
            <div className="hero-copy">
              <div className="eyebrow"><span className="eyebrow-dot" /> Haridwar's home-style cloud kitchen</div>
              <h1>Ghar jaisa khana.<br /><em>Made fresh for you.</em></h1>
              <p className="hero-lede">Honest, comforting vegetarian food made fresh to order — the kind that tastes like somebody cared.</p>
              <div className="hero-actions">
                <a className="button button-burgundy" href="https://www.zomato.com/" target="_blank" rel="noreferrer">Order on Zomato <ArrowUpRight size={17} /></a>
                <a className="button button-outline" href="https://www.swiggy.com/" target="_blank" rel="noreferrer">Order on Swiggy <ArrowUpRight size={17} /></a>
              </div>
              <div className="hero-meta"><span><span className="meta-icon"><Utensils size={16} /></span> Pure vegetarian</span><span><span className="meta-icon"><MapPin size={16} /></span> Haridwar, Uttarakhand</span></div>
            </div>
            <div className="hero-visual">
              <div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" />
              <div className="scene-label label-top"><span>01</span><span>thali, with a little love</span></div>
              <ThaliScene />
              <div className="hero-image-card"><img src={thaliImage} alt="Vegetarian thali served in a brass plate" /><span>Fresh from our rasoi</span></div>
              <div className="hero-stamp"><span>100%</span><small>desi<br />comfort</small></div>
            </div>
          </div>
          <div className="scroll-cue"><span>Scroll to explore</span><ChevronDown size={16} /></div>
        </section>

        <section className="trust-band"><div className="container trust-inner"><span>Daily comfort, plated</span><span className="trust-line" /><span>7 AM — 9 PM</span><span className="trust-line" /><span>Takeaway available</span><span className="trust-line" /><span>Order on Zomato · Swiggy</span></div></section>

        <section id="our-story" className="story-section section-padding">
          <div className="container story-grid">
            <Reveal className="story-image-wrap"><div className="story-image-frame"><img src={chaiImage} alt="Steaming kulhad chai" /><div className="image-note">chai pe charcha</div></div><span className="vertical-label">THE RASOI / 2026</span></Reveal>
            <Reveal className="story-copy"><div className="eyebrow"><span className="eyebrow-dot" /> A little about us</div><h2>Not a restaurant.<br /><em>Just a really good rasoi.</em></h2><p>We started The Rasoi Veg. Cuisine for the days when you want ghar ka khana, but ghar is a little too far away. Every plate leaves our kitchen warm, familiar and full of the small details that make simple food special.</p><p>Think desi ghee on tawa rotis, fresh tadka on dal, a cool glass of chhach and chai in a kulhad. No fuss. No shortcuts. Just food that feels good.</p><a className="text-link" href="tel:8006771779">Call us on 8006771779 <ArrowUpRight size={16} /></a></Reveal>
          </div>
        </section>

        <section id="menu" className="menu-section section-padding">
          <div className="container">
            <Reveal className="section-heading-row"><div><div className="eyebrow"><span className="eyebrow-dot" /> From our kitchen</div><h2>What are you<br /><em>craving today?</em></h2></div><button className="button button-cream" onClick={() => setShowAllMenu(!showAllMenu)}>{showAllMenu ? "Show favourites" : "View full menu"} <ArrowUpRight size={17} /></button></Reveal>
            <Reveal className="menu-tools"><div className="category-pills">{categories.map((item) => <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div><label className="search-box"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search dishes" aria-label="Search menu" /></label></Reveal>
            <div className="menu-grid">{filteredMenu.slice(0, showAllMenu ? filteredMenu.length : 8).map((item, index) => <Reveal key={item.name} className="menu-card" ><div className="menu-card-index">0{index + 1}</div><div className="menu-card-main"><div className="menu-card-top"><h3>{item.name}</h3>{item.tag && <span className="menu-tag">{item.tag}</span>}</div><p>{item.description}</p><span className="price-note">{item.price} · <span className="available-dot" /> Available to order</span></div><ArrowUpRight className="menu-arrow" size={18} /></Reveal>)}</div>
            {filteredMenu.length === 0 && <div className="empty-menu">No dishes matched that search. Try “chai” or “thali”.</div>}
          </div>
        </section>

        <section id="why-us" className="why-section section-padding"><div className="container"><Reveal className="section-heading centered"><div className="eyebrow"><span className="eyebrow-dot" /> The rasoi promise</div><h2>Simple things.<br /><em>Done properly.</em></h2><p>Food that respects your time, your budget and the comfort you came looking for.</p></Reveal><div className="promise-grid"><Reveal className="promise-card promise-card-dark"><span className="promise-num">01</span><Flame size={25} /><h3>Cooked fresh</h3><p>We start cooking when you order. Your tadka should sound alive.</p></Reveal><Reveal className="promise-card"><span className="promise-num">02</span><Sparkles size={25} /><h3>Kitchen clean</h3><p>Small-batch prep, honest ingredients and a kitchen we are proud of.</p></Reveal><Reveal className="promise-card"><span className="promise-num">03</span><Utensils size={25} /><h3>Desi by heart</h3><p>Recipes that feel familiar, from vrat thali to kulhad chai.</p></Reveal></div></div></section>

        <section className="order-section section-padding"><div className="container order-card"><div className="order-copy"><div className="eyebrow eyebrow-light"><span className="eyebrow-dot" /> Hungry yet?</div><h2>Good food is<br /><em>just a call away.</em></h2><p>Order your favourites for delivery, or call ahead and pick up a warm takeaway from our kitchen.</p><div className="order-actions"><a className="button button-cream" href="https://www.zomato.com/" target="_blank" rel="noreferrer">Zomato <ArrowUpRight size={17} /></a><a className="button button-dark-outline" href="https://www.swiggy.com/" target="_blank" rel="noreferrer">Swiggy <ArrowUpRight size={17} /></a><a className="phone-link" href="tel:8006771779"><Phone size={15} /> 8006771779</a></div></div><div className="order-art"><div className="order-circle"><span>TAKEAWAY</span><b>गरमागरम</b><small>made for your table</small></div><div className="order-doodle">✳</div></div></div></section>

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
              <button className="button button-burgundy mt-6 flex items-center gap-2" onClick={() => setIsReviewModalOpen(true)}>
                <MessageSquarePlus size={17} /> Rate us & Write a Review
              </button>
            </Reveal>

            <Reveal className="quote-card">
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

        <section id="contact" className="contact-section"><div className="container contact-inner"><div><div className="eyebrow eyebrow-light"><span className="eyebrow-dot" /> Come say hello</div><h2>See you at<br /><em>the rasoi.</em></h2></div><div className="contact-details"><div><span className="detail-label">Phone / WhatsApp</span><a href="https://wa.me/918006771779" target="_blank" rel="noreferrer"><MessageCircle size={17} /> 8006771779</a></div><div><span className="detail-label">Location</span><p><MapPin size={17} /> Haridwar, Uttarakhand</p></div><div><span className="detail-label">Hours</span><p><Clock3 size={17} /> Every day · 7 AM — 9 PM</p></div></div></div></section>
      </main>

      <footer className="footer"><div className="container footer-inner"><div className="footer-brand"><span className="wordmark-mark">रसोई</span><span><b>The Rasoi</b><small>Veg. Cuisine</small></span></div><p>Ghar jaisa khana. Made fresh for you.</p><div className="footer-links"><a href="https://instagram.com" target="_blank" rel="noreferrer"><Instagram size={16} /> Instagram</a><Link href="/admin">Admin dashboard</Link><span>© 2026</span></div></div></footer>

      <ReviewModal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} />
    </div>
  );
}
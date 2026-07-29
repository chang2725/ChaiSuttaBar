import React, { useState, useEffect, useMemo, useRef } from "react";
import { getRestaurantData } from "../services/apiService";
import {
  Star,
  MapPin,
  Phone,
  Mail,
  Clock,
  Award,
  Users,
  ChefHat,
  Truck,
  Leaf,
  Wallet,
  Heart,
  Quote,
  Gift,
  Calendar,
  Percent,
  Camera,
  Building2,
  Repeat,
  UtensilsCrossed,
  ChevronLeft,
  ChevronRight,
  Navigation,
  X,
  Check,
  Sparkles,
  Plus,
  Minus,
  Copy,
  Flame,
  Wine,
  ExternalLink,
  Info
} from "lucide-react";

import {
  FaFacebook,
  FaInstagram,
  FaYoutube,
  FaTwitter,
  FaLinkedin,
} from "react-icons/fa";

// --- RESTAURANT DATA (Default Fallback) ---
export const defaultRestaurant = {
  name: "Chang Restaurant",
  slogan: "Every Bite Tells a Story",
  tagline: "Fresh Ingredients. Authentic Taste.",
  foundedYear: 2018,
  city: "Chennai",
  about: {
    story: "Chang Restaurant started as a small family-owned bistro in 2018 with a passion for authentic flavors. Today, it serves thousands of happy food lovers daily while maintaining the same commitment to quality, warmth, and culinary art.",
    mission: "To serve fresh, delicious, and affordable food while creating memorable dining experiences for every family.",
    vision: "To become the most loved family restaurant known for culinary excellence, authentic taste, and exceptional hospitality.",
    whyChooseUs: [
      { text: "Farm-Fresh Sourced Daily", icon: Leaf, desc: "Directly from organic local farms" },
      { text: "Master Culinary Chefs", icon: ChefHat, desc: "15+ years of authentic expertise" },
      { text: "Affordable Premium Dining", icon: Wallet, desc: "Luxury taste at honest prices" },
      { text: "Family-Friendly Ambience", icon: Users, desc: "Warm, cozy, and vibrant setting" },
      { text: "Express Superfast Delivery", icon: Truck, desc: "Piping hot food delivered in 30m" },
      { text: "Heartfelt Guest Service", icon: Heart, desc: "5-star rated hospitality team" },
    ],
    timeline: [
      { year: "Jun 2018", title: "Grand Opening", description: "Started as a cozy 10-table bistro on Anna Salai." },
      { year: "Feb 2020", title: "1,000+ Daily Guests", description: "Expanded seating capacity and launched outdoor dining." },
      { year: "May 2022", title: "City-Wide Delivery", description: "Partnered with top delivery apps to reach every home." },
      { year: "Apr 2025", title: "Best Family Restaurant", description: "Awarded top culinary honor in Chennai Food Choice Awards." },
    ],
    testimonials: [
      { id: 1, name: "Rahul Sharma", role: "Food Critic & Blogger", rating: 5, comment: "The rich spices, authentic claypot biryani, and warm ambience make every visit unforgettable. A true culinary gem in Chennai!" },
      { id: 2, name: "Priya Nair", role: "Local Guide", rating: 5, comment: "One of the best dining experiences I've had. The butter chicken melts in your mouth and their tender coconut dessert is divine." },
      { id: 3, name: "Arun Kumar", role: "Regular Diner", rating: 5, comment: "Their weekend buffet spread is massive! Super fresh, highly hygienic, and the staff treats you like family." },
    ],
  },
  statistics: {
    customerRating: 4.8,
    reviewCount: 2540,
    yearsOfExperience: 7,
    menuItems: 120,
    averagePreparationTime: 18,
    averageDeliveryTime: 32,
    repeatCustomers: 76,
    branches: 4,
  },
  awards: [
    { title: "Best Family Restaurant 2025", description: "Recognized for outstanding dining experience, hygiene, and service.", date: "2025-01-15" },
    { title: "Excellence in Customer Hospitality", description: "Voted #1 family dining venue in Tamil Nadu Culinary Summit.", date: "2024-08-20" },
  ],
  deliveryPartners: ["Swiggy", "Zomato", "Uber Eats"],
  events: [
    { title: "Weekend Grand Feast Buffet", price: 699, description: "Unlimited spread with over 50+ dishes including live counters every Saturday & Sunday.", startDate: "2026-08-02", endDate: "2026-08-03", time: "12:30 PM - 3:30 PM" },
    { title: "Candlelight Live Acoustic Dinner", price: 299, description: "Enjoy dinner with soothing live acoustic musical performances every Friday evening.", startDate: "2026-08-08", endDate: "2026-08-08", time: "7:30 PM Onwards" },
  ],
  loyaltyProgram: [{
    programName: "Chang VIP Club Rewards sliver",
    description: "Earn 1 point for every ₹100 spent. Redeem points for free meals, complimentary desserts, and priority table bookings.",
    benefits: ["Complimentary Birthday Meal", "Priority Table Reservations", "10% Cashback Points", "Free Signature Dessert at 500 Points"],
    colorCode: "#0F2922",
    price: "free"
  },
  {
    programName: "Chang VIP Club Rewards gold",
    description: "Earn 1 point for every ₹100 spent. Redeem points for free meals, complimentary desserts, and priority table bookings.",
    benefits: ["Complimentary Birthday Meal", "Priority Table Reservations", "10% Cashback Points", "Free Signature Dessert at 500 Points"],
    colorCode: "#ffc905",
    price: "₹499/year"
  },
  {
    programName: "Chang VIP Club Rewards platemnu",
    description: "Earn 1 point for every ₹100 spent. Redeem points for free meals, complimentary desserts, and priority table bookings.",
    benefits: ["Complimentary Birthday Meal", "Priority Table Reservations", "10% Cashback Points", "Free Signature Dessert at 500 Points"],
    colorCode: "#7105ff",
    price: "₹999/year"
  }

  ],
  specialOffers: [
    { id: "OFF20", title: "20% OFF Family Feast", description: "Applicable on all dine-in orders above ₹1,499 during weekends.", discount: "20% OFF", validTill: "2026-09-30", code: "CHANG20" },
    { id: "BOGO", title: "Buy 1 Get 1 Mocktail", description: "Order any handcrafted mocktail and get the second completely free.", discount: "BOGO FREE", validTill: "2026-08-31", code: "SIPFREE" },
  ],
  contact: {
    phone: "+91 98765 43210",
    email: "info@changrestaurant.com",
    address: { street: "45 Anna Salai", city: "Chennai", state: "Tamil Nadu", country: "India", postalCode: "600002" },
    location: { latitude: 13.0827, longitude: 80.2707 },
    workingHours: {
      monday: "10:00 AM - 10:00 PM", tuesday: "10:00 AM - 10:00 PM", wednesday: "10:00 AM - 10:00 PM",
      thursday: "10:00 AM - 10:00 PM", friday: "10:00 AM - 11:00 PM", saturday: "09:00 AM - 11:00 PM", sunday: "09:00 AM - 11:00 PM",
    },
    socialMedia: { instagram: "https://instagram.com", facebook: "https://facebook.com", youtube: "https://youtube.com", twitter: "https://twitter.com", linkedin: "https://linkedin.com" },
  },
};

const DAY_KEYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

// --- SCROLL ANIMATION HOOK & COMPONENT ---
function useIntersectionObserver(options = {}) {
  const [element, setElement] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
      }
    }, { threshold: 0.12, ...options });

    observer.observe(element);
    return () => observer.disconnect();
  }, [element, options]);

  return [setElement, isVisible];
}

function AnimatedSection({ children, className = "", delay = 0 }) {
  const [ref, isVisible] = useIntersectionObserver();

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out transform ${isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-[0.98]"
        } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}


function LoyaltyCardSlider({ loyaltyProgram }) {
  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollToIndex = (idx) => {
    const container = scrollRef.current;
    if (!container) return;
    const card = container.children[idx];
    if (card) {
      card.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  };

  const handlePrev = () => {
    const next = Math.max(0, activeIndex - 1);
    setActiveIndex(next);
    scrollToIndex(next);
  };

  const handleNext = () => {
    const next = Math.min(loyaltyProgram.length - 1, activeIndex + 1);
    setActiveIndex(next);
    scrollToIndex(next);
  };

  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container) return;
    const cardWidth = container.children[0]?.offsetWidth || 1;
    const idx = Math.round(container.scrollLeft / (cardWidth + 24)); // 24 = gap
    setActiveIndex(idx);
  };

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 -mx-4 px-4 no-scrollbar"
        style={{ scrollbarWidth: "none" }}
      >
        {loyaltyProgram.map((tier, idx) => (
          <div
            key={tier.programName}
            className={`snap-center shrink-0 w-[88%] sm:w-[70%] lg:w-[55%]
    rounded-[28px] overflow-hidden border border-white/10
    transition-all duration-500
    ${activeIndex === idx
                ? "scale-100 opacity-100 shadow-2xl"
                : "scale-95 opacity-70"
              }`}
            style={{ backgroundColor: tier.colorCode }}
          >
            <div className="relative h-full">

              {/* Decorative background */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -right-16 -top-16 w-52 h-52 rounded-full border border-white/10" />
                <div className="absolute -left-10 bottom-0 w-40 h-40 rounded-full bg-white/5 blur-3xl" />
                <div className="absolute right-10 bottom-8 w-28 h-28 rounded-full border border-white/5" />
              </div>

              <div className="relative p-7 flex flex-col h-full">

                {/* Header */}
                <div className="flex items-start justify-between">

                  <div>
                    <div className="inline-flex items-center gap-2 text-[#E0A96D] text-xs uppercase tracking-[3px]">
                      <Gift size={15} />
                      Loyalty Program
                    </div>

                    <h3 className="mt-3 text-3xl font-bold text-white leading-tight">
                      {tier.programName}
                    </h3>
                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/10">
                    <Gift size={20} className="text-[#E0A96D]" />
                  </div>

                </div>

                {/* Description */}
                <p className="mt-6 text-sm leading-7 text-white/80">
                  {tier.description}
                </p>

                {/* Divider */}
                <div className="my-6 h-px bg-white/10" />

                {/* Benefits */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                  {tier.benefits.map((benefit) => (
                    <div
                      key={benefit}
                      className="flex items-start gap-3 rounded-xl bg-white/5 border border-white/10 p-3"
                    >
                      <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#E0A96D] text-[#0F2922] font-bold text-xs">
                        ✓
                      </div>

                      <span className="text-sm text-white/90">
                        {benefit}
                      </span>
                    </div>
                  ))}

                </div>

                {/* Footer */}
                <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-5">

                  <div>
                    <p className="text-[11px] uppercase tracking-[3px] text-white/40">
                      Membership
                    </p>

                    <p className="text-white font-semibold">
                      VIP Member
                    </p>
                  </div>

                  <button
                    className="rounded-full border border-white/80 bg-white/10 px-5 py-2 text-sm text-white transition hover:bg-white/20"
                  >
                    {tier.price}
                  </button>

                </div>

              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Prev / Next buttons - desktop */}
      <button
        onClick={handlePrev}
        disabled={activeIndex === 0}
        className="hidden sm:flex absolute -left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#0F2922] text-[#FAF6F0] items-center justify-center shadow-lg disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 transition"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={handleNext}
        disabled={activeIndex === loyaltyProgram.length - 1}
        className="hidden sm:flex absolute -right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#0F2922] text-[#FAF6F0] items-center justify-center shadow-lg disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 transition"
      >
        <ChevronRight size={18} />
      </button>

      {/* Dots indicator */}
      <div className="flex justify-center gap-2 mt-4">
        {loyaltyProgram.map((_, idx) => (
          <button
            key={idx}
            onClick={() => { setActiveIndex(idx); scrollToIndex(idx); }}
            className={`h-1.5 rounded-full transition-all ${activeIndex === idx ? "w-6 bg-[#0F2922]" : "w-1.5 bg-[#0F2922]/30"
              }`}
          />
        ))}
      </div>
    </div>
  );
}

// --- COUNTDOWN HOOK ---
function useCountdown(target) {
  const [left, setLeft] = useState("");
  useEffect(() => {
    const end = new Date(target + "T23:59:59").getTime();
    const tick = () => {
      const diff = end - Date.now();
      if (diff <= 0) { setLeft("Offer Ended"); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      setLeft(`${d}d ${h}h left`);
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [target]);
  return left;
}

// --- RESERVATION MODAL COMPONENT ---
function ReservationModal({ isOpen, onClose }) {
  const [guests, setGuests] = useState(2);
  const [date, setDate] = useState("2026-07-25");
  const [time, setTime] = useState("19:30");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !phone) return;
    setSubmitted(true);
  };

  const resetAndClose = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md p-0 sm:p-4">
      <div
        className="w-full sm:max-w-md bg-[#FAF6F0] text-[#1D2B26] rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden border border-[#D4A373]/30 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#0F2922] text-[#FAF6F0] p-5 flex items-center justify-between border-b border-[#D4A373]/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#E0A96D] text-[#0F2922]">
              <UtensilsCrossed size={18} />
            </div>
            <div>
              <h3 className="font-serif-display text-xl font-bold">Reserve a Table</h3>
              <p className="text-[11px] text-[#E0A96D] font-mono-code">Instant Booking Confirmation</p>
            </div>
          </div>
          <button
            onClick={resetAndClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-[#FAF6F0] transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {submitted ? (
            <div className="text-center py-8 px-2 space-y-4">
              <div className="w-16 h-16 bg-[#0F2922] text-[#E0A96D] rounded-full flex items-center justify-center mx-auto shadow-lg border-2 border-[#E0A96D]">
                <Check size={36} />
              </div>
              <h4 className="font-serif-display text-2xl font-bold text-[#0F2922]">Table Reserved!</h4>
              <p className="text-sm text-[#5B5A4E]">
                Thank you <strong className="text-[#0F2922]">{name}</strong>! We look forward to hosting you for <strong className="text-[#0F2922]">{guests} guests</strong> on <strong>{date}</strong> at <strong>{time}</strong>.
              </p>
              <div className="p-3 bg-[#0F2922]/5 rounded-xl border border-[#0F2922]/10 text-xs font-mono-code text-[#A63A2C]">
                Confirmation SMS sent to {phone}
              </div>
              <button
                onClick={resetAndClose}
                className="w-full mt-4 py-3 bg-[#0F2922] text-[#FAF6F0] font-semibold rounded-xl hover:bg-[#1A3F35] transition-all shadow-md"
              >
                Back to Restaurant
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Guest Count Selector */}
              <div>
                <label className="block text-xs font-mono-code uppercase tracking-wider text-[#5B5A4E] mb-1.5">Guests Count</label>
                <div className="flex items-center justify-between bg-white border border-[#1D2B26]/15 rounded-xl p-2 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setGuests((g) => Math.max(1, g - 1))}
                    className="w-10 h-10 rounded-lg bg-[#FAF6F0] flex items-center justify-center text-[#0F2922] hover:bg-[#E0A96D]/20 transition-colors"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="font-mono-code text-lg font-bold text-[#0F2922]">{guests} {guests === 1 ? 'Guest' : 'Guests'}</span>
                  <button
                    type="button"
                    onClick={() => setGuests((g) => Math.min(12, g + 1))}
                    className="w-10 h-10 rounded-lg bg-[#FAF6F0] flex items-center justify-center text-[#0F2922] hover:bg-[#E0A96D]/20 transition-colors"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              {/* Date & Time Picker */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono-code uppercase tracking-wider text-[#5B5A4E] mb-1.5">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full bg-white border border-[#1D2B26]/15 rounded-xl p-2.5 text-xs sm:text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#E0A96D]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono-code uppercase tracking-wider text-[#5B5A4E] mb-1.5">Time</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                    className="w-full bg-white border border-[#1D2B26]/15 rounded-xl p-2.5 text-xs sm:text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#E0A96D]"
                  />
                </div>
              </div>

              {/* Contact Inputs */}
              <div>
                <label className="block text-xs font-mono-code uppercase tracking-wider text-[#5B5A4E] mb-1.5">Your Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-white border border-[#1D2B26]/15 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E0A96D]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono-code uppercase tracking-wider text-[#5B5A4E] mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full bg-white border border-[#1D2B26]/15 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E0A96D]"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3.5 bg-[#E0A96D] text-[#0F2922] font-semibold text-base rounded-xl hover:bg-[#c8945a] active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Sparkles size={18} /> Confirm Table Reservation
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// --- MAIN ABOUT PAGE COMPONENT ---
export default function About() {
  const [restaurant, setRestaurant] = useState(defaultRestaurant);

  useEffect(() => {
    let mounted = true;
    getRestaurantData(null, { Leaf, ChefHat, Wallet, Users, Truck, Heart })
      .then((data) => {
        if (mounted && data && data.about) {
          setRestaurant(data);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch restaurant data from API:", err);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [isReserveOpen, setIsReserveOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [copiedCode, setCopiedCode] = useState(null);
  const [stamps, setStamps] = useState(4); // Interactive Loyalty Stamps

  const testimonials = restaurant.about.testimonials;

  // Auto-slide Testimonials
  useEffect(() => {
    const id = setInterval(() => {
      setTestimonialIdx((i) => (i + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(id);
  }, [testimonials.length]);

  const today = useMemo(() => DAY_KEYS[new Date().getDay()], []);
  const socialLinks = Object.entries(restaurant.contact.socialMedia).filter(([, v]) => v);
  const socialIcons = { instagram: FaInstagram, facebook: FaFacebook, youtube: FaYoutube, twitter: FaTwitter, linkedin: FaLinkedin };
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${restaurant.contact.location.latitude},${restaurant.contact.location.longitude}`;

  const copyCoupon = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleStampClick = (index) => {
    if (index === stamps) {
      setStamps((prev) => Math.min(10, prev + 1));
    }
  };

  const filteredMenuItems = useMemo(() => {
    if (selectedCategory === "All") return restaurant.menuHighlights;
    return restaurant.menuHighlights.filter((i) => i.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="chang-about relative min-h-screen pb-20 sm:pb-0 selection:bg-[#E0A96D] selection:text-[#0F2922]">
      {/* CUSTOM STYLE INJECTIONS FOR TYPOGRAPHY & VISUAL ACCENTS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..800;1,9..144,400..600&family=Work+Sans:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');

        .chang-about {
          --paper: #FAF6F0;
          --ink: #1D2B26;
          --ink-muted: #5B5A4E;
          --emerald-dark: #0F2922;
          --emerald-soft: #1E4338;
          --gold: #D4A373;
          --amber: #E0A96D;
          --brick: #A63A2C;
          --line: rgba(29, 43, 38, 0.12);
          font-family: 'Work Sans', sans-serif;
          background: var(--paper);
          color: var(--ink);
        }

        .font-serif-display { font-family: 'Fraunces', serif; }
        .font-mono-code { font-family: 'Space Mono', monospace; }

        .hero-pattern {
          background-color: #0F2922;
          background-image: 
            radial-gradient(at 0% 0%, rgba(224, 169, 109, 0.22) 0px, transparent 50%),
            radial-gradient(at 100% 100%, rgba(166, 58, 44, 0.2) 0px, transparent 50%),
            radial-gradient(circle, rgba(212, 163, 115, 0.08) 1px, transparent 1px);
          background-size: 100% 100%, 100% 100%, 20px 20px;
        }
h1, h2, h3, h4, h5, h6 {
color: #FFFF;
}
        .glass-nav {
          background: rgba(15, 41, 34, 0.90);
          backdrop-filter: blur(14px);
        }

        .badge-glow {
          box-shadow: 0 0 15px rgba(224, 169, 109, 0.3);
        }

        .ticket-stub {
          background-image: radial-gradient(circle at 0 50%, transparent 8px, #FFFFFF 8.5px);
        }
      `}</style>



      {/* HERO SECTION */}
      <section className="hero-pattern text-[#FAF6F0] px-4 sm:px-6 py-16 sm:py-28 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          {/* Live Status Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-mono-code text-[#E0A96D] uppercase tracking-wider">Est. {restaurant.foundedYear} · Open Today till 11 PM</span>
          </div>

          <h1 className="font-serif-display text-4xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
            {restaurant.slogan}
          </h1>

          <p className="font-serif-display italic text-lg sm:text-2xl text-[#E0A96D] max-w-2xl mx-auto font-light">
            "{restaurant.tagline}"
          </p>

          <p className="text-sm sm:text-base text-[#FAF6F0]/80 max-w-xl mx-auto font-light leading-relaxed">
            {restaurant.about.story}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={() => setIsReserveOpen(true)}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#E0A96D] text-[#0F2922] font-semibold text-sm hover:bg-[#c8945a] transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 badge-glow"
            >
              <UtensilsCrossed size={18} /> Reserve A Table
            </button>
            <a
              href="#menu"
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-[#FAF6F0] border border-white/20 font-semibold text-sm transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
            >
              Explore Menu
            </a>
          </div>

          {/* Rating Proof */}
          <div className="pt-6 flex items-center justify-center gap-3 text-xs text-[#FAF6F0]/70">
            <div className="flex -space-x-2">
              <div className="w-7 h-7 rounded-full bg-[#E0A96D] flex items-center justify-center font-bold text-[#0F2922] text-[10px] border-2 border-[#0F2922]">4.8</div>
              <div className="w-7 h-7 rounded-full bg-[#A63A2C] flex items-center justify-center text-white text-[10px] border-2 border-[#0F2922]"><Star size={12} fill="white" /></div>
            </div>
            <span>Rated <strong className="text-white">{restaurant.statistics.customerRating} / 5</strong> from {restaurant.statistics.reviewCount.toLocaleString()} verified reviews</span>
          </div>
        </div>
      </section>

      {/* METRIC STATS STRIP */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">
        <div className="bg-[#0F2922] text-[#FAF6F0] rounded-2xl p-4 sm:p-6 shadow-xl border border-[#D4A373]/20 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 divide-y md:divide-y-0 md:divide-x divide-white/10">
          <div className="flex items-center gap-3 pt-2 md:pt-0 sm:pl-2">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#E0A96D]">
              <Star size={20} fill="#E0A96D" />
            </div>
            <div>
              <p className="font-mono-code font-bold text-xl sm:text-2xl text-[#E0A96D]">{restaurant.statistics.customerRating}</p>
              <p className="text-xs text-[#FAF6F0]/70">Rating ({restaurant.statistics.reviewCount})</p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2 md:pt-0 sm:pl-4">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#E0A96D]">
              <Repeat size={20} />
            </div>
            <div>
              <p className="font-mono-code font-bold text-xl sm:text-2xl text-[#E0A96D]">{restaurant.statistics.repeatCustomers}%</p>
              <p className="text-xs text-[#FAF6F0]/70">Repeat Guests</p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 md:pt-0 sm:pl-4">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#E0A96D]">
              <Clock size={20} />
            </div>
            <div>
              <p className="font-mono-code font-bold text-xl sm:text-2xl text-[#E0A96D]">{restaurant.statistics.averagePreparationTime} mins</p>
              <p className="text-xs text-[#FAF6F0]/70">Avg Prep Time</p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 md:pt-0 sm:pl-4">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#E0A96D]">
              <Building2 size={20} />
            </div>
            <div>
              <p className="font-mono-code font-bold text-xl sm:text-2xl text-[#E0A96D]">{restaurant.statistics.branches} Outlets</p>
              <p className="text-xs text-[#FAF6F0]/70">In Tamil Nadu</p>
            </div>
          </div>
        </div>
      </section>

      {/* OUR STORY & VALUES */}
      <section id="story" className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <AnimatedSection>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="font-mono-code text-xs uppercase tracking-widest text-[#A63A2C] font-semibold">Our Culinary Philosophy</span>
            <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#0F2922] mt-2">Passion For Authentic Flavors</h2>
          </div>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          <AnimatedSection delay={100}>
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#1D2B26]/10 shadow-sm h-full flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#0F2922]/5 flex items-center justify-center text-[#0F2922] mb-5">
                  <ChefHat size={28} />
                </div>
                <h3 className="font-serif-display text-2xl font-bold text-[#0F2922] mb-3">Our Mission</h3>
                <p className="text-sm text-[#5B5A4E] leading-relaxed">{restaurant.about.mission}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#1D2B26]/10 flex items-center justify-between text-xs text-[#0F2922]">
                <span className="font-mono-code font-semibold">100% Authentic Recipes</span>
                <span className="font-mono-code font-semibold">Organic Ingredients</span>
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={200}>
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#1D2B26]/10 shadow-sm h-full flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#A63A2C]/10 flex items-center justify-center text-[#A63A2C] mb-5">
                  <Heart size={28} />
                </div>
                <h3 className="font-serif-display text-2xl font-bold text-[#0F2922] mb-3">Our Vision</h3>
                <p className="text-sm text-[#5B5A4E] leading-relaxed">{restaurant.about.vision}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#1D2B26]/10 flex items-center justify-between text-xs text-[#A63A2C]">
                <span className="font-mono-code font-semibold">Family Dining</span>
                <span className="font-mono-code font-semibold">5-Star Hospitality</span>
              </div>
            </div>
          </AnimatedSection>
        </div>

        {/* WHY CHOOSE US CARDS */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {restaurant.about.whyChooseUs.map(({ text, icon: Icon, desc }, idx) => (
            <AnimatedSection key={text} delay={idx * 50}>
              <div className="bg-white p-5 rounded-2xl border border-[#1D2B26]/10 flex items-start gap-4 hover:border-[#E0A96D] transition-colors shadow-sm">
                <div className="p-2.5 rounded-xl bg-[#0F2922] text-[#E0A96D] shrink-0">
                  <Icon size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#1D2B26]">{text}</h4>
                  <p className="text-xs text-[#5B5A4E] mt-1">{desc}</p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      <section id="offers" className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <AnimatedSection>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="font-mono-code text-xs uppercase tracking-widest text-[#A63A2C] font-semibold">Special Perks</span>
            <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#0F2922] mt-2">Offers & Loyalty Program</h2>
          </div>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 gap-6">
          {restaurant.specialOffers.map((offer, idx) => {
            const timeLeft = useCountdown(offer.validTill);
            return (
              <AnimatedSection key={offer.id} delay={idx * 100}>
                <div className="bg-white border-2 border-dashed border-[#D4A373] rounded-2xl p-6 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="font-mono-code text-[10px] text-[#A63A2C] uppercase tracking-wider font-bold bg-[#A63A2C]/10 px-2.5 py-1 rounded-full">
                        Limited Dining Offer
                      </span>
                      <h3 className="font-serif-display text-xl font-bold text-[#0F2922] mt-2">{offer.title}</h3>
                    </div>
                    <span className="font-mono-code text-lg font-bold text-[#A63A2C] bg-[#A63A2C]/5 px-2.5 py-1 rounded">{offer.discount}</span>
                  </div>
                  <p className="text-xs text-[#5B5A4E] mb-4">{offer.description}</p>

                  <div className="flex items-center justify-between pt-3 border-t border-[#1D2B26]/10 text-xs">
                    <span className="text-[#5B5A4E] font-mono-code">{timeLeft}</span>
                    <button
                      onClick={() => copyCoupon(offer.code)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0F2922] text-[#FAF6F0] font-mono-code text-xs font-semibold hover:bg-[#1A3F35] transition-colors active:scale-95"
                    >
                      {copiedCode === offer.code ? <Check size={14} className="text-[#E0A96D]" /> : <Copy size={14} />}
                      {copiedCode === offer.code ? "COPIED!" : offer.code}
                    </button>
                  </div>
                </div>
              </AnimatedSection>
            );
          })}
        </div>

        {/* INTERACTIVE LOYALTY CARD SIMULATOR */}
        <AnimatedSection delay={200} className="mt-10">
          <LoyaltyCardSlider loyaltyProgram={restaurant.loyaltyProgram} />
        </AnimatedSection>
      </section>

      {/* MILESTONE TIMELINE */}
      <section
        id="journey"
        className="relative overflow-hidden bg-[#FAF6F0] py-20 lg:py-28"
      >
        {/* Background Decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 h-full w-px bg-gradient-to-b from-transparent via-[#D4A373]/40 to-transparent" />
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#D4A373]/10 blur-3xl" />
          <div className="absolute bottom-0 -left-24 w-72 h-72 rounded-full bg-[#0F2922]/5 blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-6">

          <AnimatedSection>
            <div className="text-center mb-16">

              <span className="text-xs uppercase tracking-[5px] text-[#A63A2C] font-semibold">
                Our Journey
              </span>

              <h2 className="mt-3 text-4xl md:text-5xl font-bold text-[#0F2922]">
                Key Growth Milestones
              </h2>

              <p className="mt-4 text-[#5B5A4E] max-w-2xl mx-auto">
                Every milestone tells the story of our passion for authentic flavors,
                unforgettable dining, and continuous growth.
              </p>

            </div>
          </AnimatedSection>

          <div className="relative">

            {/* Timeline Line */}
            <div className="absolute left-6 md:left-1/2 top-0 h-full w-[3px] -translate-x-1/2 rounded-full bg-gradient-to-b from-[#D4A373] via-[#0F2922] to-[#D4A373]" />

            {restaurant.about.timeline.map((t, i) => {

              const isLeft = i % 2 === 0;

              return (
                <AnimatedSection key={t.year} delay={i * 100}>

                  <div
                    className={`relative mb-12 flex items-center ${isLeft
                        ? "md:justify-start"
                        : "md:justify-end"
                      }`}
                  >

                    {/* Timeline Dot */}
                    <div className="absolute left-6 md:left-1/2 -translate-x-1/2 z-20">

                      <div className="w-5 h-5 rounded-full bg-[#D4A373] border-4 border-[#FAF6F0] shadow-lg" />

                    </div>

                    {/* Card */}
                    <div
                      className={`ml-16 md:ml-0 w-full md:w-[44%] rounded-3xl bg-white/80 backdrop-blur-md border border-[#D4A373]/20 shadow-xl transition duration-300 hover:-translate-y-1 hover:shadow-2xl p-6 ${isLeft
                          ? "md:mr-auto"
                          : "md:ml-auto"
                        }`}
                    >

                      <span className="inline-block rounded-full bg-[#0F2922] px-4 py-1 text-xs font-semibold tracking-[3px] text-[#E0A96D]">
                        {t.year}
                      </span>

                      <h3 className="mt-4 text-2xl font-bold text-[#0F2922]">
                        {t.title}
                      </h3>

                      <p className="mt-3 text-sm leading-7 text-[#5B5A4E]">
                        {t.description}
                      </p>

                    </div>

                  </div>

                </AnimatedSection>
              );
            })}

          </div>

        </div>
      </section>

      {/* TESTIMONIALS SLIDER */}
      <section id="reviews" className="bg-[#0F2922] text-[#FAF6F0] py-16 sm:py-24 px-4 sm:px-6 relative overflow-hidden">
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <AnimatedSection>
            <Quote size={36} className="text-[#E0A96D] mx-auto mb-4 opacity-80" />
            <span className="font-mono-code text-xs uppercase tracking-widest text-[#E0A96D]">Guest Reviews</span>
            <h2 className="font-serif-display text-3xl font-bold mt-1 mb-8">What Our Diners Say</h2>
          </AnimatedSection>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-10 backdrop-blur-sm shadow-xl min-h-[220px] flex flex-col justify-between">
            <p className="font-serif-display text-lg sm:text-2xl leading-relaxed italic text-[#FAF6F0]">
              "{testimonials[testimonialIdx].comment}"
            </p>

            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-center gap-1">
                {Array.from({ length: testimonials[testimonialIdx].rating }).map((_, i) => (
                  <Star key={i} size={16} fill="#E0A96D" color="#E0A96D" />
                ))}
              </div>
              <p className="font-semibold text-sm text-[#FAF6F0]">{testimonials[testimonialIdx].name}</p>
              <p className="text-xs text-[#E0A96D] font-mono-code">{testimonials[testimonialIdx].role}</p>
            </div>
          </div>

          {/* Slider Controls */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              type="button"
              onClick={() => setTestimonialIdx((i) => (i - 1 + testimonials.length) % testimonials.length)}
              className="p-2.5 rounded-full border border-white/20 hover:bg-white/10 text-[#FAF6F0] transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex items-center gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setTestimonialIdx(i)}
                  className={`h-2 rounded-full transition-all ${i === testimonialIdx ? "w-6 bg-[#E0A96D]" : "w-2 bg-white/30"
                    }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setTestimonialIdx((i) => (i + 1) % testimonials.length)}
              className="p-2.5 rounded-full border border-white/20 hover:bg-white/10 text-[#FAF6F0] transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER & LOCATION INFO */}
      <footer id="visit" className="bg-[#0F2922] text-[#FAF6F0] border-t border-white/10 pt-16 pb-24 sm:pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#E0A96D] text-[#0F2922] flex items-center justify-center font-serif-display font-bold text-2xl">
                C
              </div>
              <h3 className="font-serif-display text-2xl font-bold">{restaurant.name}</h3>
            </div>
            <p className="text-xs text-[#FAF6F0]/70 leading-relaxed">
              {restaurant.tagline} Serving fine authentic delicacies with love in Chennai since {restaurant.foundedYear}.
            </p>
            <div className="flex gap-2 pt-2">
              {socialLinks.map(([key, url]) => {
                const Icon = socialIcons[key];
                return (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-[#FAF6F0] hover:bg-[#E0A96D] hover:border-[#E0A96D] hover:text-[#0F2922] transition-colors"
                    aria-label={key}
                  >
                    <Icon size={16} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="font-mono-code text-xs uppercase tracking-wider text-[#E0A96D] mb-4">Visit Our Outlet</h4>
            <div className="space-y-3 text-xs text-[#FAF6F0]/80">
              <p className="flex items-start gap-2.5">
                <MapPin size={16} className="text-[#E0A96D] shrink-0 mt-0.5" />
                <span>{restaurant.contact.address.street}, {restaurant.contact.address.city}, {restaurant.contact.address.state} - {restaurant.contact.address.postalCode}</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Phone size={16} className="text-[#E0A96D] shrink-0" />
                <a href={`tel:${restaurant.contact.phone}`} className="hover:underline">{restaurant.contact.phone}</a>
              </p>
              <p className="flex items-center gap-2.5">
                <Mail size={16} className="text-[#E0A96D] shrink-0" />
                <a href={`mailto:${restaurant.contact.email}`} className="hover:underline">{restaurant.contact.email}</a>
              </p>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-[#E0A96D] font-mono-code hover:underline pt-1"
              >
                <Navigation size={14} /> Open in Google Maps
              </a>
            </div>
          </div>

          {/* Opening Schedule */}
          <div>
            <h4 className="font-mono-code text-xs uppercase tracking-wider text-[#E0A96D] mb-4">Opening Hours</h4>
            <div className="font-mono-code text-[11px] space-y-1.5">
              {DAY_KEYS.map((day) => (
                <div key={day} className={`flex justify-between ${day === today ? "text-[#E0A96D] font-bold" : "text-[#FAF6F0]/60"}`}>
                  <span className="capitalize">{day}</span>
                  <span>{restaurant.contact.workingHours[day]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-12 pt-6 border-t border-white/10 text-center text-xs text-[#FAF6F0]/50 font-mono-code">
          © {new Date().getFullYear()} {restaurant.name}. All rights reserved.
        </div>
      </footer>

      {/* MOBILE FLOATING ACTION BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-[#0F2922]/95 backdrop-blur-md border-t border-white/10 p-3 flex items-center justify-between gap-2 shadow-2xl">
        <a
          href={`tel:${restaurant.contact.phone}`}
          className="flex-1 py-2.5 rounded-xl bg-white/10 text-[#FAF6F0] flex items-center justify-center gap-1.5 text-xs font-medium"
        >
          <Phone size={14} /> Call Us
        </a>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="flex-1 py-2.5 rounded-xl bg-white/10 text-[#FAF6F0] flex items-center justify-center gap-1.5 text-xs font-medium"
        >
          <Navigation size={14} /> Maps
        </a>
        <button
          onClick={() => setIsReserveOpen(true)}
          className="flex-1 py-2.5 rounded-xl bg-[#E0A96D] text-[#0F2922] font-bold flex items-center justify-center gap-1.5 text-xs shadow-md"
        >
          <UtensilsCrossed size={14} /> Reserve
        </button>
      </div>

      {/* RESERVATION MODAL */}
      <ReservationModal
        isOpen={isReserveOpen}
        onClose={() => setIsReserveOpen(false)}
      />
    </div>
  );
}
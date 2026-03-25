import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks'; // 1. Use typed hook
import { ArrowRight, Zap, Clock, ShieldCheck, ShoppingBag, Sparkles, MapPin } from 'lucide-react';

// Specialized Sections
import AboutSection from '../../components/AboutSection';
import ProductShowcase from '../../components/ProductShowcase';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  // 2. State is now typed correctly, fixing ts(18046)
  const { user } = useAppSelector((state) => state.auth);

  const scrollToMenu = () => {
    const menuSection = document.getElementById('menu-preview');
    if (menuSection) {
      menuSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-[#fcfcfd] font-sans selection:bg-red-100 overflow-x-hidden">
      {/* --- 1. MODERN HERO SECTION --- */}
      <section className="relative pt-12 pb-20 lg:pt-24 lg:pb-32">
        {/* Background Decorative Blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-red-50/50 to-transparent -z-10" />
        <div className="absolute top-20 right-[-10%] w-96 h-96 bg-orange-200/20 blur-[100px] rounded-full -z-10" />

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="text-center lg:text-left">
            {/* Campus Badge */}
            <div className="inline-flex items-center gap-2 bg-white border border-gray-100 px-4 py-2 rounded-full shadow-sm mb-8 animate-in fade-in slide-in-from-bottom-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-1">
                <MapPin size={10} className="text-red-600" /> Laikipia University Main Campus
              </span>
            </div>

            <h1 className="text-6xl md:text-8xl font-black text-gray-900 tracking-tighter leading-[0.85] mb-8">
              CAMPUS <br />
              <span className="bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 bg-clip-text text-transparent italic">
                REDEFINED.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-500 font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed mb-10">
              Skip the long cafeteria queues. Pay via <span className="text-gray-900 font-bold">M-Pesa STK</span>. 
              Fresh meals from the Student Center, delivered to your vibe.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link 
                to={user ? "/home" : "/auth/login"} 
                className="group relative w-full sm:w-auto flex items-center justify-center px-10 py-5 bg-black text-white text-sm font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-gray-300 hover:bg-red-600 hover:shadow-red-200 transition-all active:scale-95"
              >
                <ShoppingBag className="mr-3 h-5 w-5" /> 
                {user ? "Back to Menu" : "Start Ordering"}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button 
                onClick={scrollToMenu}
                className="w-full sm:w-auto px-10 py-5 bg-white border border-gray-100 text-sm font-black uppercase tracking-widest rounded-2xl text-gray-900 hover:bg-gray-50 transition-all"
              >
                Explore Menu
              </button>
            </div>

            {/* Social Proof Stats */}
            <div className="mt-12 flex items-center justify-center lg:justify-start gap-8 border-t border-gray-100 pt-8">
              <div>
                <p className="text-2xl font-black text-gray-900 leading-none">2.5k+</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Students</p>
              </div>
              <div className="h-8 w-[1px] bg-gray-100" />
              <div>
                <p className="text-2xl font-black text-gray-900 leading-none">15min</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Avg Pickup Time</p>
              </div>
            </div>
          </div>

          {/* Hero Image / Visual Element */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-red-600 to-orange-400 rounded-[3rem] rotate-3 -z-10 blur-2xl opacity-20" />
            <div className="relative bg-white p-4 rounded-[3rem] shadow-2xl border border-gray-50 overflow-hidden transform lg:rotate-2 hover:rotate-0 transition-transform duration-700">
              <img
                className="rounded-[2.5rem] w-full h-[500px] object-cover"
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop" 
                alt="Delicious Campus Food"
              />
              {/* Floating "Ready" Badge */}
              <div className="absolute bottom-10 left-10 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl flex items-center gap-4 border border-white/50 animate-bounce">
                <div className="h-10 w-10 bg-green-500 rounded-full flex items-center justify-center text-white">
                  <Zap size={20} fill="currentColor" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase">Your Order</p>
                  <p className="text-sm font-black text-gray-900">READY AT CENTER</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- 2. THE TECH STACK / VALUE PROPS --- */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-red-600 font-black text-[10px] uppercase tracking-[0.4em] mb-4">Why use the portal?</p>
            <h2 className="text-4xl font-black text-gray-900 uppercase italic">Built for the <span className="text-gray-300">Modern Student</span></h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Sparkles className="h-6 w-6" />} 
              title="STK Push Magic" 
              desc="Forget typing Paybill numbers. We push the PIN prompt directly to your Safaricom line." 
              accent="bg-red-500"
            />
            <FeatureCard 
              icon={<Clock className="h-6 w-6" />} 
              title="No More Lines" 
              desc="Order while walking from the Library. Pick up exactly when the 'Ready' notification hits." 
              accent="bg-orange-500"
            />
            <FeatureCard 
              icon={<ShieldCheck className="h-6 w-6" />} 
              title="Campus Official" 
              desc="Verified integration with Laikipia University Canteen inventory management." 
              accent="bg-black"
            />
          </div>
        </div>
      </section>

      {/* --- 3. MENU PREVIEW (High Contrast) --- */}
      <section id="menu-preview" className="py-24 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-5xl font-black text-gray-900 italic uppercase leading-none">Live <span className="text-red-600">Menu</span></h2>
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-4">Updated every 5 minutes from the kitchen</p>
          </div>
          <Link to="/home" className="text-sm font-black text-red-600 uppercase border-b-2 border-red-600 pb-1">View Full Buffet</Link>
        </div>
        
        {/* 3. Prop Fix: Only pass what ProductShowcase actually expects, fixing ts(2322) */}
        <ProductShowcase 
          onOrderNowClick={() => navigate(user ? '/home' : '/auth/login')} 
        />
      </section>

      {/* --- 4. ABOUT SECTION --- */}
      <section id="about" className="py-24 bg-[#FAFAFB]">
        <AboutSection />
      </section>
    </div>
  );
};

/* --- REUSABLE FEATURE CARD COMPONENT --- */
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  accent: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, desc, accent }) => (
  <div className="group relative p-10 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
    <div className={`h-14 w-14 ${accent} text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-gray-100 group-hover:rotate-12 transition-transform`}>
      {icon}
    </div>
    <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight uppercase italic">{title}</h3>
    <p className="text-gray-500 leading-relaxed font-medium text-sm">{desc}</p>
    
    <div className="absolute top-10 right-10 text-gray-50 font-black text-6xl -z-10 group-hover:text-red-50 transition-colors">
      //
    </div>
  </div>
);

export default LandingPage;
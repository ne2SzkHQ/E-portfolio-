import { useState, useEffect } from 'react';
import { 
  BookOpen, 
  ChevronDown, 
  Menu, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight, 
  AlertTriangle, 
  FolderMinus, 
  Smartphone, 
  MessageSquare, 
  ShieldCheck, 
  Info, 
  MapPin, 
  Phone, 
  Mail, 
  Facebook, 
  Twitter, 
  Linkedin, 
  ChevronUp, 
  Sparkles,
  Users,
  Check,
  FileText,
  Calendar,
  Layers,
  ArrowLeftRight,
  Plus,
  Compass,
  ArrowUpRight
} from 'lucide-react';
const engineersImage = "/src/assets/images/edubridge_engineers_1784559184507.jpg";

interface LandingPageProps {
  setCurrentView: (view: string) => void;
  activeProfile: any;
  setRole: (role: 'trainee' | 'assessor') => void;
}

export default function LandingPage({ setCurrentView, activeProfile, setRole }: LandingPageProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDemoToast, setShowDemoToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  // Scroll to top on load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowDemoToast(true);
    setTimeout(() => setShowDemoToast(false), 5000);
  };

  const handleSelectWorkspace = (view: string, roleType?: 'trainee' | 'assessor') => {
    if (roleType) {
      setRole(roleType);
    }
    setCurrentView(view);
    setShowDropdown(false);
  };

  // 6 pain points list
  const painPoints = [
    {
      id: 1,
      title: "Box files get damaged, misplaced or lost.",
      desc: "Physical evidence and compiled papers can easily get ruined, damaged, or misplaced inside workshop storage lockers.",
      color: "bg-red-50 text-red-600 border-red-100"
    },
    {
      id: 2,
      title: "Phone photos and videos disappear when needed most.",
      desc: "If a phone crashes or gets lost, crucial practical project logs vanish right before final verification starts.",
      color: "bg-blue-50 text-blue-600 border-blue-100"
    },
    {
      id: 3,
      title: "WhatsApp evidence gets buried in old chats.",
      desc: "Scattered media shared on peer chats lack structure, and finding specific units of competence becomes impossible.",
      color: "bg-green-50 text-green-600 border-green-100"
    },
    {
      id: 4,
      title: "Trainers struggle to review scattered evidence early.",
      desc: "Checking work from notebooks, phone folders, and sheets makes timely assessment feedback impossible to achieve.",
      color: "bg-amber-50 text-amber-600 border-amber-100"
    },
    {
      id: 5,
      title: "Trainees may discover gaps too late.",
      desc: "Without progressive tracking, students only learn of missing evidence elements during final assessment week.",
      color: "bg-purple-50 text-purple-600 border-purple-100"
    },
    {
      id: 6,
      title: "Institutions struggle to track who is assessment-ready.",
      desc: "Gathering individual status lists manually leads to assessment pressure, chaos, and delayed graduation approvals.",
      color: "bg-pink-50 text-pink-600 border-pink-100"
    }
  ];

  // Carousel slider data
  const sliderCards = [
    {
      title: "Upload Evidence Early",
      desc: "Trainees upload photos, videos, documents and project evidence from a phone or computer.",
      icon: <Smartphone className="h-6 w-6 text-indigo-600" />
    },
    {
      title: "Get Progressive Reviews",
      desc: "Your trainers can view your work progress live, insert helpful feedback, and mark areas for correction early.",
      icon: <MessageSquare className="h-6 w-6 text-indigo-600" />
    },
    {
      title: "Digital Portfolio Verification",
      desc: "Compile all required units of learning in one structured layout, keeping elements ready for external assessors.",
      icon: <ShieldCheck className="h-6 w-6 text-indigo-600" />
    }
  ];

  const handleNextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % sliderCards.length);
  };

  const handlePrevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + sliderCards.length) % sliderCards.length);
  };

  // FAQ data
  const faqs = [
    {
      q: "1. Why should I compile my PoE on EduBridge?",
      a: "EduBridge keeps your Portfolio of Evidence (PoE) safe, organized, and accessible. Instead of physical box files that get lost or damaged, your work is stored digitally, verified progressively by your trainers, and directly connected to approved assessment workflows."
    },
    {
      q: "2. Is EduBridge connected to the TVET CDACC Portal?",
      a: "Yes. EduBridge is built and maintained by ABNO Softwares International, who are the core developers of the national TVET CDACC Portal. The e-Portfolios on EduBridge are structured to align directly with approved TVET CDACC assessment pathways."
    },
    {
      q: "3. Will my trainer review my PoE on EduBridge?",
      a: "Yes! Once you subscribe and link your profile to your TVET center, your registered trainers can view your units of learning, leave feedback, and grade evidence submissions progressively from their assessor workspaces."
    },
    {
      q: "4. How much does EduBridge cost for trainees?",
      a: "EduBridge trainee plans start from KES 750 per year. Most trainees choose a plan based on the size of their ePoE, including support for photos, documents, and videos."
    },
    {
      q: "5. What happens if I wait until assessment week to organize my PoE?",
      a: "Waiting until assessment week creates massive pressure and increases the risk of missing critical evidence components. Early compilation on EduBridge allows you to catch and fix evidence gaps well in advance."
    },
    {
      q: "6. Can my parent or guardian pay for my subscription?",
      a: "Yes. EduBridge integrates Safaricom M-Pesa. Your parent or guardian can input their phone number, receive the prompt on their phone, and complete the KES 750 subscription securely on your behalf."
    }
  ];

  return (
    <div id="landing-container" className="bg-[#FAF9FF] text-slate-900 font-sans antialiased selection:bg-purple-200 min-h-screen flex flex-col relative pb-16">
      
      {/* FLOATING DEMO TOAST NOTIFICATION */}
      {showDemoToast && (
        <div id="demo-toast" className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-slate-950 text-white border border-purple-500/30 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce max-w-sm">
          <Sparkles className="h-5 w-5 text-yellow-400 shrink-0" />
          <div className="text-xs">
            <span className="font-bold block uppercase tracking-wider text-purple-300">EduBridge Demo Portal</span>
            <p className="text-slate-300 mt-0.5">{toastMessage}</p>
          </div>
        </div>
      )}

      {/* TOP HEADER BRAND NAVIGATION (White style matching screenshot) */}
      <nav id="landing-navbar" className="bg-white border-b border-slate-100 sticky top-0 z-50 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Logo element with correct slogan */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleSelectWorkspace('landing')}>
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1.5">
                <BookOpen className="text-[#4A148C] h-6 w-6 inline-block" />
                <span className="text-2xl font-black tracking-tight text-slate-900">
                  Edu<span className="text-[#6A1B9A]">Bridge</span>
                </span>
              </div>
              <span className="text-[8px] sm:text-[9px] text-slate-500 font-black tracking-widest uppercase -mt-0.5">
                Capture Your Skills. Secure Your Future.
              </span>
            </div>
          </div>

          {/* Nav Actions on Right */}
          <div className="flex items-center gap-3">
            
            {/* Hamburger menu button */}
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-2 border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
              title="Menu"
            >
              <Menu className="h-4 w-4" />
            </button>

            {/* Activate Dropdown trigger */}
            <div className="relative">
              <button 
                id="activate-dropdown-btn"
                onClick={() => setShowDropdown(!showDropdown)}
                className="inline-flex items-center justify-center px-4 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 transition cursor-pointer gap-1"
              >
                Activate <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 divide-y divide-slate-100 z-50 overflow-hidden border border-slate-100">
                  <div className="p-3 bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    Select Portal Workspace
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => handleSelectWorkspace('activation', 'trainee')}
                      className="group flex w-full items-center px-4 py-3 text-xs text-slate-700 hover:bg-purple-50 hover:text-[#6A1B9A] font-bold text-left transition"
                    >
                      🔑 Trainee Activation & Login
                    </button>
                    <button
                      onClick={() => handleSelectWorkspace(activeProfile ? 'dashboard' : 'activation', 'trainee')}
                      className="group flex w-full items-center px-4 py-3 text-xs text-slate-700 hover:bg-purple-50 hover:text-[#6A1B9A] font-bold text-left transition"
                    >
                      💻 Candidate Workspace {activeProfile && '●'}
                    </button>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => handleSelectWorkspace('assessor', 'assessor')}
                      className="group flex w-full items-center px-4 py-3 text-xs text-slate-700 hover:bg-purple-50 hover:text-[#6A1B9A] font-bold text-left transition"
                    >
                      🛡️ Assessor & Trainer Console
                    </button>
                    <button
                      onClick={() => handleSelectWorkspace('resources')}
                      className="group flex w-full items-center px-4 py-3 text-xs text-slate-700 hover:bg-purple-50 hover:text-[#6A1B9A] font-bold text-left transition"
                    >
                      📚 Educational CDACC Resources
                    </button>
                    <button
                      onClick={() => handleSelectWorkspace('pricing')}
                      className="group flex w-full items-center px-4 py-3 text-xs text-slate-700 hover:bg-purple-50 hover:text-[#6A1B9A] font-bold text-left transition"
                    >
                      💳 Subscription Cost Plans
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Login button */}
            <button 
              id="login-btn"
              onClick={() => handleSelectWorkspace('activation')}
              className="bg-[#5C45D1] hover:bg-[#4a34b2] text-white font-black px-4 sm:px-6 py-2 rounded-lg text-xs sm:text-sm transition cursor-pointer"
            >
              Login
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION - RICH PURPLE BANNER */}
      <section id="hero-banner" className="bg-[#8E52E8] text-white py-14 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight max-w-3xl mx-auto">
            Get Your PoE Ready for Assessment and Verification.
          </h1>
          
          <p className="text-purple-100 text-sm sm:text-base lg:text-lg max-w-3xl mx-auto leading-relaxed">
            EduBridge helps trainees check assessment units, upload photos, videos and documents, get trainer feedback early, correct gaps in time and submit organized PoEs through the right assessment pathway.
          </p>

          {/* Shield alert box */}
          <div className="bg-white/10 border border-white/20 rounded-2xl p-4 max-w-2xl mx-auto flex items-start gap-3 text-left backdrop-blur-xs">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0 text-white">
              <ShieldCheck className="h-4.5 w-4.5" />
            </div>
            <p className="text-xs text-purple-50 leading-relaxed">
              <strong>Your PoE follows your registered assessment pathway</strong> — visible to the right institution, trainer, assessor and authorized assessment reviewer.
            </p>
          </div>

          <div className="pt-2 text-purple-100 text-[11px] sm:text-xs font-bold uppercase tracking-wide">
            Built for TVET CDACC-assessed programmes, QAI/QAB-assessed programmes and CBET Master-powered assessment workflows.
          </div>

          {/* CTA Buttons with exact taglines underneath */}
          <div className="pt-4 space-y-4 max-w-md mx-auto">
            <div>
              <button 
                onClick={() => handleSelectWorkspace('activation')}
                className="w-full bg-black hover:bg-zinc-950 text-white font-black py-4 px-6 rounded-xl text-sm uppercase tracking-wider transition duration-200 cursor-pointer shadow-lg"
              >
                Check My Registered Units
              </button>
              <span className="text-[10px] text-purple-100 block mt-1.5 font-bold">
                For trainees under TVET CDACC or QAB-assessed programmes
              </span>
            </div>

            <div>
              <button 
                onClick={() => handleSelectWorkspace('activation')}
                className="w-full bg-black hover:bg-zinc-950 text-white font-black py-4 px-6 rounded-xl text-sm uppercase tracking-wider transition duration-200 cursor-pointer shadow-lg"
              >
                Activate Institution Workspace
              </button>
              <span className="text-[10px] text-purple-100 block mt-1.5 font-bold">
                For TVET CDACC Assessment Centers
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* GRAPHIC DIAGRAM SECTION - FEATURING REAL COLLABORATION WORKERS */}
      <section className="bg-[#8E52E8] pb-16 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl overflow-hidden shadow-2xl border border-purple-200 p-4 sm:p-6 space-y-6">
          
          {/* Custom generated image banner */}
          <div className="relative rounded-2xl overflow-hidden h-64 sm:h-80 lg:h-96">
            <img 
              src={engineersImage} 
              alt="EduBridge Technicians collaborating" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            
            {/* Overlay indicators matching the diagram tags */}
            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2 justify-center">
              <span className="bg-purple-600/90 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-lg flex items-center gap-1">
                👤 TRAINEE: Uploads and tracks PoE
              </span>
              <span className="bg-slate-800/95 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-lg flex items-center gap-1">
                👥 TRAINER / ASSESSOR: Reviews and guides
              </span>
              <span className="bg-violet-700/90 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-lg flex items-center gap-1">
                🏛️ CDACC / QAB: Receives verified PoE
              </span>
            </div>
          </div>

          {/* Stepper Graphic overlay recreating the diagram dots */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center border-t border-slate-100 pt-6">
            <div className="flex flex-col items-center p-2.5 rounded-xl hover:bg-slate-50 transition">
              <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm mb-2 shadow-xs">
                ☁️
              </div>
              <span className="text-xs font-black text-slate-800">Upload Evidence</span>
              <p className="text-[10px] text-slate-500 mt-1 leading-normal">Photos, videos and documents</p>
            </div>

            <div className="flex flex-col items-center p-2.5 rounded-xl hover:bg-slate-50 transition">
              <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm mb-2 shadow-xs">
                💬
              </div>
              <span className="text-xs font-black text-slate-800">Trainer Review</span>
              <p className="text-[10px] text-slate-500 mt-1 leading-normal">Feedback and corrections</p>
            </div>

            <div className="flex flex-col items-center p-2.5 rounded-xl hover:bg-slate-50 transition">
              <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm mb-2 shadow-xs">
                ✔️
              </div>
              <span className="text-xs font-black text-slate-800">Institution Verification</span>
              <p className="text-[10px] text-slate-500 mt-1 leading-normal">Marksheets, registers and sign-off</p>
            </div>

            <div className="flex flex-col items-center p-2.5 rounded-xl hover:bg-slate-50 transition">
              <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm mb-2 shadow-xs">
                📋
              </div>
              <span className="text-xs font-black text-slate-800">CDACC / QAB Review</span>
              <p className="text-[10px] text-slate-500 mt-1 leading-normal">Assessment pathway review</p>
            </div>
          </div>

          {/* CBET Master onboarding request banner */}
          <div 
            onClick={() => handleSelectWorkspace('activation')}
            className="bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-100 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎓</span>
              <div>
                <h4 className="text-xs sm:text-sm font-black text-indigo-900 uppercase tracking-wide">QAI/QAB? Request EduBridge + CBET Master Onboarding</h4>
                <p className="text-[10px] sm:text-xs text-indigo-600 font-medium">Activate complete competency-based workflows for your training institution.</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-indigo-700 shrink-0" />
          </div>

        </div>
      </section>

      {/* SECTION 3: YOUR POE SHOULD NOT BE TRAPPED IN BOX FILES */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto space-y-12 text-center">
          
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Your PoE Should Not Be Trapped in Box Files.
            </h2>
            <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto">
              Many trainees still keep PoE evidence in box files, phone folders, WhatsApp chats, Google Drive folders and printed papers.
            </p>
          </div>

          {/* Pain point bento grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {painPoints.map((point) => (
              <div key={point.id} className="p-6 bg-[#FAF9FF] border border-slate-100 rounded-2xl space-y-3 shadow-xs hover:shadow-md transition duration-200">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${point.color}`}>
                  {point.id}
                </div>
                <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm uppercase tracking-wide leading-snug">
                  {point.title}
                </h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  {point.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Highlight prompt box */}
          <div className="bg-[#FAF9FF] rounded-2xl p-5 border border-purple-100 inline-block text-left max-w-xl mx-auto">
            <span className="text-sm">
              👉 <strong>When PoE evidence is scattered, trainees panic and trainers review too late.</strong> EduBridge solves this completely.
            </span>
          </div>

        </div>
      </section>

      {/* SECTION 4: EDUBRIDGE KEEPS YOUR POE SAFE, REVIEWED AND READY */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto space-y-10 text-center">
          
          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              EduBridge Keeps Your PoE Safe, Reviewed and Ready
            </h2>
            <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto">
              EduBridge helps trainees move from scattered evidence to one clear digital ePortfolio workflow. Upload videos, files, and photos and get instant feedback.
            </p>
          </div>

          {/* Slider card rendering */}
          <div className="max-w-md mx-auto bg-white rounded-2xl p-6 border border-slate-200 shadow-xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center mx-auto shadow-xs">
              {sliderCards[activeSlide].icon}
            </div>
            <h3 className="text-base font-black text-slate-800 uppercase tracking-wide">
              {sliderCards[activeSlide].title}
            </h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed min-h-[50px]">
              {sliderCards[activeSlide].desc}
            </p>

            <div className="flex items-center justify-center gap-4 pt-2">
              <button 
                onClick={handlePrevSlide}
                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                ‹
              </button>
              <div className="flex gap-1.5">
                {sliderCards.map((_, i) => (
                  <div key={i} className={`h-2 rounded-full transition-all ${i === activeSlide ? 'w-4 bg-indigo-600' : 'w-2 bg-slate-200'}`} />
                ))}
              </div>
              <button 
                onClick={handleNextSlide}
                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                ›
              </button>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h4 className="text-lg font-extrabold text-slate-900">
              Upload early. Get reviewed early. Stay ready.
            </h4>
            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              <button 
                onClick={() => handleSelectWorkspace('activation')}
                className="flex-1 bg-black hover:bg-zinc-950 text-white font-black py-3.5 px-6 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer"
              >
                Check My Registered Units
              </button>
              <button 
                onClick={() => handleSelectWorkspace('activation')}
                className="flex-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-black py-3.5 px-6 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer"
              >
                Activate Institution Workspace
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 5: WHY TRAINEES AND INSTITUTIONS TRUST EDUBRIDGE */}
      <section className="py-16 px-4 bg-[#5D45D1] text-white">
        <div className="max-w-4xl mx-auto space-y-12">
          
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Why Trainees and Institutions Trust EduBridge
            </h2>
          </div>

          {/* Trust features grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-white text-slate-800 rounded-3xl p-6 space-y-4 shadow-xl border border-white/10">
              <span className="text-3xl">🏅</span>
              <h4 className="text-sm font-black uppercase tracking-wider text-slate-900 leading-tight">
                Built by ABNO
              </h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                EduBridge is an ABNO Softwares platform, backed by years of experience building education technology systems across Kenya.
              </p>
            </div>

            <div className="bg-white text-slate-800 rounded-3xl p-6 space-y-4 shadow-xl border border-white/10">
              <span className="text-3xl">🔍</span>
              <h4 className="text-sm font-black uppercase tracking-wider text-slate-900 leading-tight">
                Integrated with TVET CDACC Portal
              </h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                EduBridge is integrated with TVET CDACC Portal for CDACC-assessed e-Portfolios of Evidence.
              </p>
            </div>

            <div className="bg-white text-slate-800 rounded-3xl p-6 space-y-4 shadow-xl border border-white/10">
              <span className="text-3xl">🛡️</span>
              <h4 className="text-sm font-black uppercase tracking-wider text-slate-900 leading-tight">
                Secure and Scalable
              </h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                EduBridge is built to support large trainee numbers, trainer review, institution tracking and secure digital PoE management.
              </p>
            </div>

            {/* Special highlight bento block card inside this section */}
            <div className="md:col-span-3 bg-[#4E35BC] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="text-center pb-2 border-b border-white/10">
                <span className="text-xs font-black uppercase tracking-widest text-indigo-200">Start Early. Stay Ready</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold text-slate-100">
                <div className="flex items-center gap-2 bg-white/5 p-3.5 rounded-xl border border-white/10">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0 stroke-[3]" />
                  <span>Trainees keep PoEs safe, reviewed and ready.</span>
                </div>
                <div className="flex items-center gap-2 bg-white/5 p-3.5 rounded-xl border border-white/10">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0 stroke-[3]" />
                  <span>Trainers give feedback before it is too late.</span>
                </div>
                <div className="flex items-center gap-2 bg-white/5 p-3.5 rounded-xl border border-white/10">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0 stroke-[3]" />
                  <span>Institutions track readiness and reduce assessment pressure.</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2 max-w-md mx-auto">
                <button 
                  onClick={() => handleSelectWorkspace('activation')}
                  className="flex-1 bg-black hover:bg-zinc-950 text-white font-black py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider cursor-pointer"
                >
                  Check My Registered Units
                </button>
                <button 
                  onClick={() => handleSelectWorkspace('activation')}
                  className="flex-1 bg-white hover:bg-slate-50 text-slate-800 font-black py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider cursor-pointer"
                >
                  Activate Institution Workspace
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 6: INTEGRATED WITH TVET CDACC LOGO HERO CONTAINER */}
      <section className="py-16 px-4 bg-slate-50 border-y border-slate-100 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="w-24 h-24 rounded-full bg-white mx-auto flex items-center justify-center shadow-md p-3 border border-slate-200">
            <span className="text-3xl font-black text-blue-800">CDACC</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Integrated with TVET CDACC
          </h3>
          <p className="text-slate-600 text-sm font-medium leading-relaxed">
            EduBridge is integrated with the TVET CDACC Portal to streamline candidate unit check-ins, verify progressive marks, and secure ePortfolios of Evidence.
          </p>
          <button 
            onClick={() => triggerToast("Use 'Activate Workspace' dropdown menu at top to explore pre-seeded Trainee or Assessor environments.")}
            className="bg-black hover:bg-zinc-950 text-white font-black py-3 px-6 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer"
          >
            Request Demo
          </button>
        </div>
      </section>

      {/* SECTION 7: WHAT THIS MEANS FOR INSTITUTIONS */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto space-y-10">
          
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight text-center">
            What This Means for Institutions
          </h2>

          <div className="space-y-6">
            
            <div className="flex gap-4 items-start">
              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-1">
                <Check className="h-3.5 w-3.5 stroke-[3]" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-[#5D45D1] uppercase tracking-wide">Approved Workflow for CDACC-Assessed PoEs</h4>
                <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed mt-1">
                  PoEs for CDACC-assessed programmes can be submitted through the approved TVET CDACC Portal workflow.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-1">
                <Check className="h-3.5 w-3.5 stroke-[3]" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-[#5D45D1] uppercase tracking-wide">Easier Trainer Review</h4>
                <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed mt-1">
                  Trainers can review submitted evidence early, give feedback and help trainees correct gaps before assessment pressure starts.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-1">
                <Check className="h-3.5 w-3.5 stroke-[3]" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-[#5D45D1] uppercase tracking-wide">Better Institutional Readiness</h4>
                <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed mt-1">
                  Institutions can track PoE progress and identify trainees who need support before assessment timelines become urgent.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-1">
                <Check className="h-3.5 w-3.5 stroke-[3]" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-[#5D45D1] uppercase tracking-wide">Less Manual Pressure</h4>
                <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed mt-1">
                  EduBridge reduces reliance on box files, scattered WhatsApp evidence, printed documents and last-minute manual compilation.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-1">
                <Check className="h-3.5 w-3.5 stroke-[3]" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-[#5D45D1] uppercase tracking-wide">Built by the Team Behind the TVET CDACC Portal</h4>
                <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed mt-1">
                  ABNO Softwares is behind the development and ongoing maintenance of the TVET CDACC Portal, giving EduBridge strong practical understanding of CDACC assessment workflows.
                </p>
              </div>
            </div>

          </div>

          <div className="bg-[#FAF9FF] border border-purple-100 rounded-3xl p-6 text-center space-y-4">
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-xl mx-auto">
              EduBridge helps institutions move from scattered PoE evidence to a structured digital workflow connected to the TVET CDACC Portal for CDACC-assessed PoEs.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center max-w-sm mx-auto">
              <button 
                onClick={() => handleSelectWorkspace('activation')}
                className="flex-1 bg-black hover:bg-zinc-950 text-white font-black py-3 text-xs uppercase tracking-wider cursor-pointer"
              >
                Check My Registered Units
              </button>
              <button 
                onClick={() => handleSelectWorkspace('activation')}
                className="flex-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-black py-3 text-xs uppercase tracking-wider cursor-pointer"
              >
                Activate Institution Workspace
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 8: BEYOND POE: DIGITAL LOGBOOKS FOR ATTACHMENT AND TEACHING PRACTICE */}
      <section className="py-16 px-4 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto space-y-12">
          
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Beyond PoE: Digital Logbooks for Attachment and Teaching Practice
            </h2>
            <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              EduBridge can also help trainees record practical learning beyond the classroom, including industry attachment and teaching practice. Instead of carrying paper logbooks and chasing signatures, trainees can keep activity.
            </p>
          </div>

          {/* Stepper bubbles list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            
            <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-2 text-center shadow-xs">
              <span className="text-2xl block">📱</span>
              <h4 className="text-xs font-black uppercase tracking-wider text-indigo-700">Digital Logbooks</h4>
              <p className="text-[11px] text-slate-500 font-medium leading-normal">Trainees record daily activities, progress and reflections from a phone or computer.</p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-2 text-center shadow-xs">
              <span className="text-2xl block">👍</span>
              <h4 className="text-xs font-black uppercase tracking-wider text-indigo-700">Supervisor Feedback</h4>
              <p className="text-[11px] text-slate-500 font-medium leading-normal">Supervisors can review, comment and approve entries digitally where the institution has enabled the workflow.</p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-2 text-center shadow-xs">
              <span className="text-2xl block">📅</span>
              <h4 className="text-xs font-black uppercase tracking-wider text-indigo-700">Attendance and Activity Records</h4>
              <p className="text-[11px] text-slate-500 font-medium leading-normal">Institutions can keep clearer records of participation, progress and practical exposure.</p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-2 text-center shadow-xs">
              <span className="text-2xl block">📋</span>
              <h4 className="text-xs font-black uppercase tracking-wider text-indigo-700">Trainer and Institution Workspaces</h4>
              <p className="text-[11px] text-slate-500 font-medium leading-normal">Trainers and departments can review submissions and track student progress.</p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-2 text-center shadow-xs sm:col-span-2 md:col-span-1">
              <span className="text-2xl block">💼</span>
              <h4 className="text-xs font-black uppercase tracking-wider text-indigo-700">Career Evidence</h4>
              <p className="text-[11px] text-slate-500 font-medium leading-normal">Trainees can keep practical work records that may support future career opportunities.</p>
            </div>

          </div>

          <p className="text-xs text-center text-slate-500 font-black uppercase tracking-wide">
            EduBridge is not only for uploading PoE files. It helps trainees build a practical digital record of their skills over time.
          </p>

        </div>
      </section>

      {/* SECTION 9: HOW EDUBRIDGE WORKS */}
      <section className="py-16 px-4 bg-[#8E52E8] text-white">
        <div className="max-w-4xl mx-auto space-y-12">
          
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              How EduBridge Works?
            </h2>
            <p className="text-purple-100 text-sm sm:text-base max-w-2xl mx-auto">
              EduBridge makes it simple to move from scattered PoE evidence to a clear digital workflow.
            </p>
          </div>

          {/* Stepper Layout */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            
            <div className="bg-white text-slate-800 p-6 rounded-2xl relative space-y-3 shadow-xl">
              <span className="absolute -top-4 left-4 w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-black text-sm">1</span>
              <div className="text-2xl pt-2">🔑</div>
              <h4 className="text-xs font-black uppercase text-[#5D45D1] tracking-wider">Activate Your Account</h4>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                Create your EduBridge account, choose your plan, and link your profile to your institution or assessment center.
              </p>
            </div>

            <div className="bg-white text-slate-800 p-6 rounded-2xl relative space-y-3 shadow-xl">
              <span className="absolute -top-4 left-4 w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-black text-sm">2</span>
              <div className="text-2xl pt-2">📁</div>
              <h4 className="text-xs font-black uppercase text-[#5D45D1] tracking-wider">Upload Your PoE</h4>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                Upload photos, videos, documents and project evidence from your phone or computer.
              </p>
            </div>

            <div className="bg-white text-slate-800 p-6 rounded-2xl relative space-y-3 shadow-xl">
              <span className="absolute -top-4 left-4 w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-black text-sm">3</span>
              <div className="text-2xl pt-2">💬</div>
              <h4 className="text-xs font-black uppercase text-[#5D45D1] tracking-wider">Get Trainer Feedback</h4>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                Your trainer reviews your evidence digitally, gives comments and guides you early.
              </p>
            </div>

            <div className="bg-white text-slate-800 p-6 rounded-2xl relative space-y-3 shadow-xl">
              <span className="absolute -top-4 left-4 w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-black text-sm">4</span>
              <div className="text-2xl pt-2">🚀</div>
              <h4 className="text-xs font-black uppercase text-[#5D45D1] tracking-wider">Correct and Stay Ready</h4>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                Fix gaps before assessment pressure starts and keep your PoE ready for review and submission.
              </p>
            </div>

          </div>

          <div className="text-center text-xs font-bold text-purple-100">
            Upload early. Get reviewed early. Correct early. Stay ready.
          </div>

        </div>
      </section>

      {/* SECTION 10: AFFORDABLE FOR EVERY TRAINEE - PRICING PROMO */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto space-y-12">
          
          {/* Main Trainee Pricing Card */}
          <div className="bg-[#5D45D1] text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl border border-white/10 text-center">
            <span className="bg-white/10 border border-white/20 text-purple-100 text-[10px] font-bold uppercase px-3 py-1 rounded-full inline-block">
              Affordable for Every Trainee
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              EduBridge trainee plans start from KES 750 per year.
            </h3>
            <p className="text-purple-100 text-xs sm:text-sm max-w-xl mx-auto font-medium leading-relaxed">
              Most trainees choose a plan based on the size of their PoE, including photos, documents and videos.
            </p>
            <button 
              onClick={() => handleSelectWorkspace('pricing')}
              className="bg-white text-[#5D45D1] hover:bg-slate-50 font-black text-xs uppercase tracking-widest px-8 py-4 rounded-xl cursor-pointer shadow-lg transition"
            >
              View Trainee Plans
            </button>
          </div>

          {/* Institution Pricing alert card */}
          <div className="border border-dashed border-slate-300 rounded-3xl p-6 sm:p-8 space-y-6 text-center bg-slate-50/50">
            <h4 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Institutions Pay KES 0 for Standard ePOE Access
            </h4>
            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">
              When trainees subscribe individually, institutions get standard EduBridge ePOE access for PoE management, trainer review and readiness tracking under the trainee-paid model.
            </p>
            <p className="text-xs text-slate-400 font-bold uppercase">
              Integrated with TVET CDACC Portal for CDACC-assessed PoEs
            </p>

            <div className="bg-white rounded-2xl p-4 border border-slate-100 text-[11px] font-black uppercase text-[#5D45D1] tracking-wider">
              No heavy platform acquisition cost. No manual PoE chaos. No last-minute assessment pressure.
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              <button 
                onClick={() => handleSelectWorkspace('activation')}
                className="flex-1 bg-black hover:bg-zinc-950 text-white font-black py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider cursor-pointer"
              >
                Activate Institution Workspace
              </button>
              <button 
                onClick={() => triggerToast("Our pre-seeded demo accounts are ready! Activate your workspace to skip payment simulation.")}
                className="flex-1 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-black py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider cursor-pointer"
              >
                Request Demo
              </button>
            </div>

            <span className="text-[11px] text-slate-400 block font-medium mt-2">
              Trainee subscription fees are paid directly by trainees unless the institution requests a sponsored arrangement.
            </span>
          </div>

        </div>
      </section>

      {/* SECTION 11: FREQUENTLY ASKED QUESTIONS ACCORDION */}
      <section className="py-16 px-4 bg-slate-50 border-t border-slate-200">
        <div className="max-w-3xl mx-auto space-y-10">
          
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight text-center">
            Frequently Asked Questions
          </h2>

          {/* Accordion List */}
          <div className="space-y-3.5">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs cursor-pointer"
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
              >
                <div className="p-4 sm:p-5 flex items-center justify-between gap-4 select-none">
                  <h4 className="text-xs sm:text-sm font-black text-slate-800 tracking-tight leading-tight">
                    {faq.q}
                  </h4>
                  <span className={`text-[#5D45D1] font-black text-lg transform transition-transform duration-200 ${activeFaq === idx ? 'rotate-180' : ''}`}>
                    {activeFaq === idx ? '−' : '+'}
                  </span>
                </div>
                {activeFaq === idx && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-500 font-medium leading-relaxed border-t border-slate-50">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center space-y-4 pt-4 border-t border-slate-200">
            <h4 className="text-lg font-black text-slate-800 tracking-tight uppercase">Still Have Questions?</h4>
            <p className="text-xs text-slate-500 font-medium">Talk to EduBridge support or activate your account today.</p>
            
            <div className="flex flex-col sm:flex-row gap-2.5 justify-center max-w-md mx-auto">
              <button 
                onClick={() => handleSelectWorkspace('activation')}
                className="flex-1 bg-[#5D45D1] text-white font-black py-3 rounded-xl text-xs uppercase cursor-pointer"
              >
                Check My Registered Units
              </button>
              <button 
                onClick={() => handleSelectWorkspace('activation')}
                className="flex-1 bg-black text-white font-black py-3 rounded-xl text-xs uppercase cursor-pointer"
              >
                Activate Institution Workspace
              </button>
              <a 
                href="tel:+254792550077"
                className="flex-1 bg-white border border-slate-300 text-slate-800 font-black py-3 rounded-xl text-xs uppercase flex items-center justify-center gap-1.5"
              >
                📞 0792 550 077
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 12: PARTNERS SECTION WITH DARK BACKGROUND AS IN SCREENSHOT */}
      <section className="py-16 px-4 bg-[#141221] text-white text-center relative overflow-hidden">
        <div className="max-w-2xl mx-auto space-y-6 relative z-10">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 mx-auto flex items-center justify-center text-3xl">
            🤝
          </div>
          <h3 className="text-2xl font-black uppercase tracking-wider text-white">Partners</h3>
          <p className="text-slate-300 text-sm font-medium leading-relaxed max-w-lg mx-auto">
            Support trainee activation as a student ambassador, campus partner or field partner.
          </p>
          <div className="flex justify-center gap-4">
            <button 
              onClick={() => triggerToast("Thank you for your interest! Partner application is closed for this validation tier.")}
              className="bg-[#5D45D1] hover:bg-[#4a34b2] text-white font-black px-6 py-3.5 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer"
            >
              Apply as a Partner
            </button>
            <button 
              onClick={() => handleSelectWorkspace('activation')}
              className="bg-white hover:bg-slate-100 text-slate-900 font-black px-6 py-3.5 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer"
            >
              Partner Login
            </button>
          </div>
        </div>
      </section>

      {/* CORPORATE DETAILS FOOTER BANNER */}
      <footer className="bg-[#FAF9FF] border-t border-slate-200 py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Logo white container card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-baseline gap-1">
                <BookOpen className="text-[#4A148C] h-5 w-5" />
                <span className="text-xl font-black text-slate-900">EduBridge</span>
              </div>
              <span className="text-[10px] font-black text-[#5D45D1] uppercase tracking-widest bg-purple-50 px-3 py-1 rounded-lg">
                Secure TVET e-Portfolio Portal
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600 font-medium">
              <p className="flex gap-2.5 items-start">
                <MapPin className="h-4 w-4 text-[#5D45D1] shrink-0 mt-0.5" />
                <span>Kaka House, 3rd Floor, Maua Close off Parklands Road, Westlands, Nairobi, Kenya</span>
              </p>
              <p className="flex gap-2.5 items-start">
                <Phone className="h-4 w-4 text-[#5D45D1] shrink-0 mt-0.5" />
                <span>+254 792 550 077</span>
              </p>
              <p className="flex gap-2.5 items-start">
                <Mail className="h-4 w-4 text-[#5D45D1] shrink-0 mt-0.5" />
                <span>info@edubridgeapp.com</span>
              </p>
            </div>
          </div>

          {/* Secondary Footer Link groups */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-bold text-slate-600">
            <button onClick={() => handleSelectWorkspace('activation')} className="hover:text-indigo-600 cursor-pointer">Trainees</button>
            <span>|</span>
            <button onClick={() => handleSelectWorkspace('activation')} className="hover:text-indigo-600 cursor-pointer">Institutions</button>
            <span>|</span>
            <button onClick={() => handleSelectWorkspace('activation')} className="hover:text-indigo-600 cursor-pointer">QAI/QAB Onboarding</button>
            <span>|</span>
            <button onClick={() => handleSelectWorkspace('activation')} className="hover:text-indigo-600 cursor-pointer">Partners</button>
            <span>|</span>
            <button onClick={() => handleSelectWorkspace('landing')} className="hover:text-indigo-600 cursor-pointer">FAQ</button>
          </div>

          {/* Social icons */}
          <div className="flex justify-center gap-4 text-slate-400">
            <Facebook className="h-5 w-5 hover:text-indigo-600 cursor-pointer" />
            <Twitter className="h-5 w-5 hover:text-indigo-600 cursor-pointer" />
            <Linkedin className="h-5 w-5 hover:text-indigo-600 cursor-pointer" />
          </div>

          {/* Navigation trigger button row */}
          <div className="flex flex-wrap justify-center gap-3">
            <button 
              onClick={() => handleSelectWorkspace('activation')}
              className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold px-4 py-2.5 rounded-lg text-xs cursor-pointer shadow-xs"
            >
              Check My Assessment Units
            </button>
            <button 
              onClick={() => handleSelectWorkspace('activation')}
              className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold px-4 py-2.5 rounded-lg text-xs cursor-pointer shadow-xs"
            >
              Activate Institution Workspace
            </button>
            <button 
              onClick={() => handleSelectWorkspace('activation')}
              className="bg-[#5D45D1] text-white hover:bg-[#4a34b2] font-black px-6 py-2.5 rounded-lg text-xs cursor-pointer shadow-xs"
            >
              Login
            </button>
          </div>

          {/* Copyright notice and legal compliance links */}
          <div className="border-t border-slate-200 pt-6 text-center space-y-4 text-[11px] text-slate-400">
            <p className="font-bold">
              EduBridge is an ABNO Softwares platform.<br />
              © 2026 ABNO Softwares International Ltd. All Rights Reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 font-bold">
              <a href="#" className="hover:underline hover:text-slate-600">Terms of Service</a>
              <span>|</span>
              <a href="#" className="hover:underline hover:text-slate-600">Privacy Policy</a>
              <span>|</span>
              <a href="#" className="hover:underline hover:text-slate-600">Data Protection</a>
              <span>|</span>
              <a href="#" className="hover:underline hover:text-slate-600">Payment Safety</a>
            </div>
          </div>

        </div>
      </footer>

      {/* FLOAT ACTION FLOATING BAR (Floating Demo + smooth scroll back up) */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        <button 
          onClick={() => triggerToast("Welcome! Expand the 'Activate' dropdown at the top to access active trainee ePoEs or assessor verification panels.")}
          className="bg-black hover:bg-zinc-950 text-white font-black px-5 py-3 rounded-full text-xs uppercase tracking-widest shadow-2xl flex items-center gap-2 border border-zinc-800 transition transform hover:-translate-y-0.5 cursor-pointer"
        >
          <Sparkles className="h-4 w-4 text-purple-300 animate-pulse" /> Request Demo
        </button>
        <button 
          onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} 
          className="w-10 h-10 bg-white border border-slate-200 text-slate-600 rounded-full flex items-center justify-center hover:bg-slate-50 hover:text-indigo-600 shadow-xl transition transform hover:-translate-y-0.5 cursor-pointer"
          title="Back to top"
        >
          <ChevronUp className="h-5 w-5" />
        </button>
      </div>

    </div>
  );
}


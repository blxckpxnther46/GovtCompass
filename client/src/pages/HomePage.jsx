import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getRecommendationsFromProfile } from "../api/recommendation.api";
import { explainScheme, analyzeEligibilityGap } from "../api/ai.api";




// Matched/Failed icons
const CHECK_ICON = (
  <svg className="w-4 h-4 text-[var(--ok)] inline mr-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const CROSS_ICON = (
  <svg className="w-4 h-4 text-[var(--tape)] inline mr-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

function Stamp({ value }) {
  return (
    <div className="w-20 h-20 rounded-full flex flex-col items-center justify-center absolute -top-4 -right-4 bg-[var(--surface)] border-2 border-[var(--gold)] z-20 select-none shadow-sm">
      <span className="text-[8px] font-semibold uppercase tracking-widest text-[var(--gold)]">MATCH</span>
      <span className="text-xl font-bold tracking-tight text-[var(--gold)]">{value}%</span>
    </div>
  );
}

function HeroCard() {
  return (
    <div className="relative mt-8 group cursor-pointer animate-float">
      {/* Folder Tab */}
      <div className="absolute -top-6 left-0 bg-[var(--surface-2)] w-2/5 h-8 rounded-t-lg border-t border-l border-r border-[var(--gold)]/20 flex items-center px-5 z-0 transition-all duration-300 ease-out group-hover:-translate-y-2 group-hover:bg-[var(--surface)] group-hover:border-[var(--gold)]/40">
        <span className="text-[10px] font-semibold tracking-wide text-[var(--text-muted)] uppercase">ELIGIBILITY REPORT</span>
      </div>

      {/* Main Folder Body */}
      <div className="relative bg-[var(--surface)] border border-[var(--gold)]/20 rounded-2xl rounded-tl-none p-7 transition-all duration-300 ease-out group-hover:border-[var(--gold)]/40 z-10 overflow-hidden">
        
        {/* Soft gradient texture */}
        <div className="absolute inset-0 opacity-30 pointer-events-none bg-gradient-to-br from-transparent to-[var(--surface-2)]"></div>

        <Stamp value={82} />

      <div className="text-xs font-mono uppercase tracking-widest text-[var(--gold)] border-b border-black/5 pb-2 mb-4">
        SCHEME PROFILE
      </div>

      <h3 className="text-2xl font-bold text-[var(--text)] tracking-tight leading-tight pr-12">
        Startup India Seed Fund Scheme
      </h3>
      <p className="text-xs text-[var(--text-muted)] mt-1 font-medium">Department for Promotion of Industry and Internal Trade</p>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="bg-[var(--bg)] p-3 rounded-lg border border-black/5">
          <div className="text-xs font-mono font-semibold uppercase text-[var(--ok)] border-b border-[var(--ok)]/10 pb-1 mb-2">
            ✓ Matched Criteria
          </div>
          <ul className="text-xs text-[var(--text)] space-y-1.5 font-medium">
            <li className="flex items-start">{CHECK_ICON} Entrepreneur</li>
            <li className="flex items-start">{CHECK_ICON} Technology sector</li>
          </ul>
        </div>

        <div className="bg-[var(--bg)] p-3 rounded-lg border border-black/5">
          <div className="text-xs font-mono font-semibold uppercase text-[var(--tape)] border-b border-[var(--tape)]/10 pb-1 mb-2">
            ✗ Missing Criteria
          </div>
          <ul className="text-xs text-[var(--text)] space-y-1.5 font-medium">
            <li className="flex items-start">{CROSS_ICON} Min 2yr incorporation</li>
          </ul>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-black/5 text-xs text-[var(--text-muted)] font-mono relative z-10">
        <span className="text-[var(--gold)] font-bold">AI ADVICE:</span> You are missing the 2yr incorporation requirement. Consider state-level seed grants instead.
      </div>
    </div>
    </div>
  );
}

function HeroText() {
  const [textIndex, setTextIndex] = useState(0);
  const text1 = "Government schemes, matched like a ";
  const text2 = "case file";
  const text3 = ".";

  useEffect(() => {
    if (textIndex < text1.length) {
      const t = setTimeout(() => setTextIndex(textIndex + 1), 65);
      return () => clearTimeout(t);
    }
  }, [textIndex, text1.length]);

  const isTypingDone = textIndex === text1.length;

  return (
    <h1 className="text-4xl md:text-5xl font-bold leading-tight font-display tracking-tight text-[var(--text)] min-h-[100px]">
      {text1.substring(0, textIndex)}
      {isTypingDone && (
        <>
          <span className="animate-draw-underline">{text2}</span>
          {text3}
        </>
      )}
      {!isTypingDone && <span className="inline-block w-[3px] h-[0.9em] bg-[var(--gold)] animate-pulse ml-1 translate-y-1"></span>}
    </h1>
  );
}

function ScrollReveal({ children, delay = 0 }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transform transition-all duration-700 ease-out h-full ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      }`}
    >
      {children}
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();


  // Search results state
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  // AI explanations & gap analysis cache states
  const [explanations, setExplanations] = useState({});
  const [loadingExplanations, setLoadingExplanations] = useState({});
  const [advices, setAdvices] = useState({});
  const [loadingAdvices, setLoadingAdvices] = useState({});

  // Refs for navigation scrolling
  const finderRef = useRef(null);
  const infoRef = useRef(null);
  const resultsRef = useRef(null);
  const privacyRef = useRef(null);

  // Handle Input Changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle Tag Selection Toggle
  const handleTagToggle = (tag) => {
    setFormData((prev) => {
      const alreadySelected = prev.tags.includes(tag);
      return {
        ...prev,
        tags: alreadySelected
          ? prev.tags.filter((t) => t !== tag)
          : [...prev.tags, tag]
      };
    });
  };

  // Submit Search payload
  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);

    // Clean payload: strip empty/falsy keys
    const payload = {};
    if (formData.state) payload.state = formData.state;
    if (formData.category) payload.category = formData.category;
    if (formData.subCategory) payload.subCategory = formData.subCategory.trim();
    if (formData.beneficiaryType) payload.beneficiaryType = formData.beneficiaryType;
    if (formData.tags && formData.tags.length > 0) payload.tags = formData.tags;

    try {
      const data = await getRecommendationsFromProfile(payload);
      setResults(data);
      // Wait for DOM update, then scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Could not load recommendations. Please verify the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // Reset form inputs
  const handleReset = () => {
    setFormData({
      state: "",
      category: "",
      subCategory: "",
      beneficiaryType: "",
      tags: []
    });
    setResults(null);
    setError(null);
  };

 

  // Lazy-load AI Eligibility Gap Analysis
  const fetchGapAnalysis = async (schemeId, failedCriteria) => {
    if (advices[schemeId] || loadingAdvices[schemeId]) return;

    setLoadingAdvices((prev) => ({ ...prev, [schemeId]: true }));
    try {
      const res = await analyzeEligibilityGap(schemeId, failedCriteria, formData);
      if (res?.success && res?.advice) {
        setAdvices((prev) => ({ ...prev, [schemeId]: res.advice }));
      } else {
        setAdvices((prev) => ({ ...prev, [schemeId]: "No AI gap advice available." }));
      }
    } catch (err) {
      console.error(err);
      setAdvices((prev) => ({ ...prev, [schemeId]: "Could not generate eligibility advice at this time." }));
    } finally {
      setLoadingAdvices((prev) => ({ ...prev, [schemeId]: false }));
    }
  };

  const handleScroll = (ref) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans flex flex-col">
      {/* 1. STICKY NAV BAND */}
      <header className="sticky top-0 z-50 bg-[var(--bg)] text-[var(--text)] border-b border-black/5 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap justify-between items-center gap-4 relative">
          <div className="flex items-center space-x-3 select-none z-10">
            <span className="text-2xl font-bold tracking-tight font-display leading-none">Govt Compass</span>
            <span className="hidden sm:inline-block px-2.5 py-0.5 text-[10px] font-mono bg-[var(--gold)] text-black rounded font-bold uppercase tracking-widest translate-y-px">
              BETA
            </span>
          </div>

          {/* Centered Desktop Navigation */}
          <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center space-x-8 text-sm font-semibold text-[var(--text-muted)] z-0">
            <button onClick={() => handleScroll(infoRef)} className="hover:text-[var(--text)] transition-colors duration-200">
              Methodology
            </button>
            <button onClick={() => handleScroll(privacyRef)} className="hover:text-[var(--text)] transition-colors duration-200">
              Privacy
            </button>
            <a href="https://github.com/blxckpxnther46/GovtCompass" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--text)] transition-colors duration-200">
              GitHub
            </a>
          </nav>

          {/* Header Action Buttons */}
          <div className="flex items-center space-x-6 z-10">
            <button 
              onClick={() => navigate('/schemes')}
              className="hidden md:block text-sm font-bold text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
            >
              Explore Schemes
            </button>
            <button
              onClick={() => navigate('/questionnaire')}
              className="bg-[var(--text)] text-[var(--bg)] px-5 py-1.5 rounded-lg text-xs font-bold font-mono tracking-wider hover:opacity-80 hover:-translate-y-[1px] active:translate-y-[1px] transition-all duration-150"
            >
              Find Schemes
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center flex-grow">
        <div className="space-y-6">
          
          <HeroText />

          <p className="text-base text-[var(--text-muted)] font-medium max-w-lg leading-relaxed">
            Discover scheme recommendations backed by direct rules and custom match scores. 
            No sign-ups, no tracking. Only actionable criteria comparisons.
          </p>

          <div className="pt-2 flex flex-wrap gap-4">
              <button 
                onClick={() => navigate('/questionnaire')}
                className="bg-[var(--text)] text-[var(--bg)] px-8 py-3.5 rounded-xl font-bold font-mono tracking-wider hover:opacity-80 hover:-translate-y-1 transition-all duration-200"
              >
                Find Schemes →
              </button>
            <button
              onClick={() => handleScroll(infoRef)}
              className="border border-black/10 bg-[var(--surface)] text-[var(--text)] px-6 py-3 rounded-xl font-bold font-mono text-sm tracking-wide hover:bg-black/5 transition duration-200"
            >
              How it works
            </button>
          </div>
        </div>

        <div>
          <HeroCard />
        </div>
      </section>

      {/* 3. FILE 01: HOW IT WORKS BAND */}
      <section ref={infoRef} className="bg-[var(--bg-dark)] text-[var(--text-on-dark)] border-t border-b border-black/10 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center space-x-3 border-b border-[var(--text-muted-on-dark)]/20 pb-4 mb-8">
            <span className="font-mono text-xs font-bold text-[var(--gold)] bg-white/10 border border-white/10 px-2.5 py-1.5 rounded">
              FILE 01
            </span>
            <h2 className="text-2xl font-bold font-display tracking-tight leading-none">
              How Compass Scores You
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <ScrollReveal delay={100}>
              <div className="bg-white/5 border border-white/10 p-6 rounded-2xl relative overflow-hidden transition-all hover:bg-white/10 duration-200 group h-full">
                <span className="absolute right-4 top-2 text-6xl font-extrabold text-white/5 font-mono select-none group-hover:scale-110 transition-transform">1</span>
                <div className="font-mono text-[var(--gold)] text-xs font-bold tracking-widest uppercase">STEP 01</div>
                <h3 className="font-bold text-lg mt-2 font-display">Dynamic Questionnaire</h3>
                <p className="text-xs text-[var(--text-muted-on-dark)] mt-2 leading-relaxed font-medium">
                  Answer an intuitive, step-by-step Q&A. Your profile is generated securely and sent to our backend engine without ever being stored in a database.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <div className="bg-white/5 border border-white/10 p-6 rounded-2xl relative overflow-hidden transition-all hover:bg-white/10 duration-200 group h-full">
                <span className="absolute right-4 top-2 text-6xl font-extrabold text-white/5 font-mono select-none group-hover:scale-110 transition-transform">2</span>
                <div className="font-mono text-[var(--gold)] text-xs font-bold tracking-widest uppercase">STEP 02</div>
                <h3 className="font-bold text-lg mt-2 font-display">Algorithmic Scoring</h3>
                <p className="text-xs text-[var(--text-muted-on-dark)] mt-2 leading-relaxed font-medium">
                  Our custom backend engine filters thousands of schemes by state, then calculates precise match percentages using weighted demographic and category logic.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={500}>
              <div className="bg-white/5 border border-white/10 p-6 rounded-2xl relative overflow-hidden transition-all hover:bg-white/10 duration-200 group h-full">
                <span className="absolute right-4 top-2 text-6xl font-extrabold text-white/5 font-mono select-none group-hover:scale-110 transition-transform">3</span>
                <div className="font-mono text-[var(--gold)] text-xs font-bold tracking-widest uppercase">STEP 03</div>
                <h3 className="font-bold text-lg mt-2 font-display">AI Gap Analysis</h3>
                <p className="text-xs text-[var(--text-muted-on-dark)] mt-2 leading-relaxed font-medium">
                  View exactly which criteria you passed or failed. Our integrated AI analyzes your failures and provides actionable advice on how to bridge eligibility gaps.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 4. FILE 02: WHY NO LOGIN */}
      <section ref={privacyRef} className="py-16 px-6 max-w-6xl mx-auto">
        <div className="flex items-center space-x-3 border-b border-black/5 pb-4 mb-6">
          <span className="font-mono text-xs font-bold text-black/50 bg-[var(--surface-2)] border border-black/10 px-2.5 py-1.5 rounded">
            FILE 02
          </span>
          <h2 className="text-2xl font-bold font-display tracking-tight text-[var(--text)] leading-none">
            Why There is No Login
          </h2>
        </div>
        
        <div className="bg-[var(--surface)] border border-black/10 rounded-2xl p-7 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
          <div className="max-w-2xl space-y-3">
            <h3 className="text-lg font-bold font-display">Uncompromised Privacy, Zero Friction</h3>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed font-medium">
              We skip accounts and logins entirely. Your details are never saved in databases, tracked, or profile-mined. 
              Search queries generate recommendations inside temporary backend payloads and persist only within your active browser window.
            </p>
          </div>
          <div className="font-mono text-xs text-[var(--gold)] bg-[var(--bg-dark)] px-4 py-2 rounded-xl font-bold select-none border border-[var(--gold)]/20 shadow-md flex items-center">
            <svg className="w-3.5 h-3.5 mr-2 opacity-80" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            SECURE CLIENT ROUTING
          </div>
        </div>
      </section>

      

      
      {/* 7. FOOTER */}
      <footer className="bg-[var(--bg-dark)] text-[var(--text-on-dark)] border-t border-black/15 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-8">
          <div className="space-y-3">
            <div className="text-lg font-bold font-display tracking-tight text-[var(--text-on-dark)]">Govt Compass</div>
            <p className="text-xs text-[var(--text-muted-on-dark)] max-w-sm leading-relaxed font-medium">
              Transparent, secure, and eligibility-driven portal matching Indian government schemes without tracking.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 md:gap-16">
            <div>
              <h4 className="text-xs font-mono text-[var(--gold)] uppercase font-bold tracking-widest mb-3">Links</h4>
              <ul className="space-y-2 text-xs text-[var(--text-muted-on-dark)] font-medium">
                <li>
                  <button onClick={() => handleScroll(finderRef)} className="hover:text-[var(--gold)] transition">
                    Finder Form
                  </button>
                </li>
                <li>
                  <button onClick={() => handleScroll(infoRef)} className="hover:text-[var(--gold)] transition">
                    How it works
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-mono text-[var(--gold)] uppercase font-bold tracking-widest mb-3">Project</h4>
              <ul className="space-y-2 text-xs text-[var(--text-muted-on-dark)] font-medium">
                <li>
                  <a href="https://github.com/blxckpxnther46/GovtCompass" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--gold)] transition">
                    GitHub Repo
                  </a>
                </li>
                <li>
                  <span className="text-[var(--gold)] font-semibold font-mono">KSquad 128</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto pt-8 mt-8 border-t border-white/5 text-center md:text-left text-xs text-[var(--text-muted-on-dark)] font-medium">
          © {new Date().getFullYear()} Govt Compass. Built in accordance with MeitY/NeGD UX4G patterns.
        </div>
      </footer>
    </div>
  );
}
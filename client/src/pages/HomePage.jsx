import { useState, useEffect, useRef } from "react";
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
    <div className="gc-stamp w-24 h-24 rounded-full flex flex-col items-center justify-center rotate-[-12deg] absolute -top-5 -right-5 border-double border-4 z-10 select-none shadow-md">
      <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[var(--gold)] opacity-90">Govt Compass</span>
      <span className="text-xl font-bold tracking-tight text-[var(--gold)]">{value}%</span>
      <span className="text-[9px] font-mono font-semibold uppercase tracking-wider text-[var(--gold)] opacity-90">MATCH</span>
    </div>
  );
}

function HeroCard() {
  return (
    <div className="relative bg-[var(--surface)] border border-black/10 rounded-2xl p-7 shadow-lg transition-transform hover:rotate-[-1deg] duration-300">
      <Stamp value={82} />

      <div className="text-xs font-mono uppercase tracking-widest text-[var(--gold)] border-b border-black/5 pb-2 mb-4">
        FILE 00 / SAMPLE SCHEME
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

      <div className="mt-6 pt-4 border-t border-black/5 text-xs text-[var(--text-muted)] font-mono">
        <span className="text-[var(--gold)] font-bold">ALTERNATIVES:</span> MSME Credit, State Start-up Grants
      </div>
    </div>
  );
}

export default function HomePage() {
  // Accessibility state
  const [scale, setScale] = useState(1.0);
  const [contrast, setContrast] = useState(false);


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

  // Apply Font Sizing Scale
  useEffect(() => {
    document.documentElement.style.setProperty("--scale", scale.toFixed(1));
  }, [scale]);

  // Apply Contrast Toggle
  useEffect(() => {
    if (contrast) {
      document.documentElement.classList.add("gc-contrast");
    } else {
      document.documentElement.classList.remove("gc-contrast");
    }
  }, [contrast]);

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
      <header className="sticky top-0 z-50 bg-[var(--bg-dark)] text-[var(--text-on-dark)] border-b border-black/10 shadow-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center space-x-3 select-none">
            <span className="text-2xl font-bold tracking-tight font-display">Govt Compass</span>
            <span className="hidden sm:inline-block px-2.5 py-0.5 text-[10px] font-mono bg-[var(--gold)] text-black rounded font-bold uppercase tracking-widest">
              Beta
            </span>
          </div>

          {/* Accessibility Toolbar */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-1 bg-black/20 p-1 rounded-lg border border-white/5">
              <button
                onClick={() => setScale((s) => Math.max(0.9, s - 0.1))}
                aria-label="Decrease Font Size"
                className="w-8 h-8 rounded text-sm font-semibold font-mono hover:bg-white/10 active:bg-white/20 transition duration-150"
              >
                A-
              </button>
              <button
                onClick={() => setScale(1.0)}
                aria-label="Reset Font Size"
                className="w-8 h-8 rounded text-sm font-semibold font-mono hover:bg-white/10 active:bg-white/20 transition duration-150"
              >
                A
              </button>
              <button
                onClick={() => setScale((s) => Math.min(1.3, s + 0.1))}
                aria-label="Increase Font Size"
                className="w-8 h-8 rounded text-sm font-semibold font-mono hover:bg-white/10 active:bg-white/20 transition duration-150"
              >
                A+
              </button>
            </div>

            <button
              onClick={() => setContrast((c) => !c)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold tracking-wider uppercase transition-all duration-150 ${
                contrast
                  ? "bg-[var(--gold)] text-black border-transparent"
                  : "border-white/20 text-[var(--text-on-dark)] hover:bg-white/5"
              }`}
            >
              Contrast
            </button>

            <button
              onClick={() => handleScroll(finderRef)}
              className="bg-[var(--gold)] text-black px-5 py-1.5 rounded-lg text-xs font-bold font-mono tracking-wider hover:opacity-90 hover:-translate-y-[1px] active:translate-y-[1px] transition-all duration-150 shadow"
            >
              Find Schemes
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center flex-grow">
        <div className="space-y-6">
          
          <h1 className="text-4xl md:text-5xl font-bold leading-tight font-display tracking-tight text-[var(--text)]">
            Government schemes, matched like a <span className="underline decoration-[var(--gold)] decoration-4 underline-offset-4">case file</span>.
          </h1>

          <p className="text-base text-[var(--text-muted)] font-medium max-w-lg leading-relaxed">
            Discover scheme recommendations backed by direct rules and custom match scores. 
            No sign-ups, no tracking. Only actionable criteria comparisons.
          </p>

          <div className="pt-2 flex flex-wrap gap-4">
            <button
              onClick={() => handleScroll(finderRef)}
              className="bg-[var(--gold)] text-black px-6 py-3 rounded-xl font-bold font-mono text-sm tracking-wide hover:opacity-90 hover:shadow-lg transition duration-200"
            >
              Start Finding
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
      <section ref={infoRef} className="bg-[var(--bg-dark)] text-[var(--text-on-dark)] border-t border-b border-black/10 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center space-x-2 border-b border-[var(--text-muted-on-dark)]/20 pb-3 mb-8">
            <span className="font-mono text-xs font-bold text-[var(--gold)] bg-black/35 px-2.5 py-1 rounded">
              FILE 01
            </span>
            <h2 className="text-2xl font-bold font-display tracking-tight">
              How Compass Scores You
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl relative overflow-hidden transition-all hover:bg-white/10 duration-200">
              <span className="absolute right-4 top-2 text-6xl font-extrabold text-white/5 font-mono select-none">1</span>
              <div className="font-mono text-[var(--gold)] text-xs font-bold tracking-widest uppercase">STEP 01</div>
              <h3 className="font-bold text-lg mt-2 font-display">Input profile</h3>
              <p className="text-xs text-[var(--text-muted-on-dark)] mt-2 leading-relaxed font-medium">
                Enter your state, beneficiary status, tags, and categories. All inputs reside strictly client-side.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl relative overflow-hidden transition-all hover:bg-white/10 duration-200">
              <span className="absolute right-4 top-2 text-6xl font-extrabold text-white/5 font-mono select-none">2</span>
              <div className="font-mono text-[var(--gold)] text-xs font-bold tracking-widest uppercase">STEP 02</div>
              <h3 className="font-bold text-lg mt-2 font-display">Scoring engine</h3>
              <p className="text-xs text-[var(--text-muted-on-dark)] mt-2 leading-relaxed font-medium">
                Our rule matcher calculates compatibility percentages dynamically using weighted category, location, and tag mappings.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl relative overflow-hidden transition-all hover:bg-white/10 duration-200">
              <span className="absolute right-4 top-2 text-6xl font-extrabold text-white/5 font-mono select-none">3</span>
              <div className="font-mono text-[var(--gold)] text-xs font-bold tracking-widest uppercase">STEP 03</div>
              <h3 className="font-bold text-lg mt-2 font-display">Explain results</h3>
              <p className="text-xs text-[var(--text-muted-on-dark)] mt-2 leading-relaxed font-medium">
                Get a clear checklist detailing exactly which parameters matched or failed, plus smart alternative recommendation tracks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FILE 02: WHY NO LOGIN */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <div className="flex items-center space-x-2 border-b border-black/5 pb-3 mb-6">
          <span className="font-mono text-xs font-bold text-black/50 bg-[var(--surface-2)] border border-black/10 px-2.5 py-1 rounded">
            FILE 02
          </span>
          <h2 className="text-2xl font-bold font-display tracking-tight text-[var(--text)]">
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
          <div className="font-mono text-xs text-[var(--gold)] bg-[var(--bg-dark)] px-4 py-2 rounded-xl font-bold select-none border border-[var(--gold)]/20 shadow-md">
            🔒 SECURE CLIENT ROUTING
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
import { useState, useEffect, useRef } from "react";
import { getRecommendationsFromProfile } from "../api/recommendation.api";
import { explainScheme, analyzeEligibilityGap } from "../api/ai.api";

// List of all Indian States
const STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal"
];

// Valid categories mapping to CATEGORY_MAP in backend mapping
const CATEGORIES = [
  "Education",
  "Healthcare",
  "Agriculture",
  "Business",
  "Startups",
  "Housing",
  "Employment",
  "Skill Development",
  "Women Empowerment",
  "Financial Assistance",
  "Transport",
  "Utility",
  "Sanitation",
  "Science & Technology"
];

// Valid tag list options
const TAG_OPTIONS = [
  "Student",
  "Women",
  "Senior Citizen",
  "Farmer",
  "Person With Disability",
  "Unemployed",
  "Entrepreneur",
  "Pensioner"
];

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

  // Form State
  const [formData, setFormData] = useState({
    state: "",
    category: "",
    subCategory: "",
    beneficiaryType: "",
    tags: []
  });

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

  // Lazy-load AI scheme explanation
  const fetchExplanation = async (schemeId) => {
    if (explanations[schemeId] || loadingExplanations[schemeId]) return;

    setLoadingExplanations((prev) => ({ ...prev, [schemeId]: true }));
    try {
      const res = await explainScheme(schemeId);
      if (res?.success && res?.explanation) {
        setExplanations((prev) => ({ ...prev, [schemeId]: res.explanation }));
      } else {
        setExplanations((prev) => ({ ...prev, [schemeId]: "No AI explanation available." }));
      }
    } catch (err) {
      console.error(err);
      setExplanations((prev) => ({ ...prev, [schemeId]: "Failed to retrieve AI explanation. Ensure OpenRouter is configured." }));
    } finally {
      setLoadingExplanations((prev) => ({ ...prev, [schemeId]: false }));
    }
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
          <div className="inline-block px-3 py-1 bg-[var(--surface-2)] border border-black/5 rounded-full text-xs font-mono text-[var(--text-muted)] font-bold">
            ⚡ UX4G-Inspired Scheme Engine
          </div>
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

      {/* 5. FILE 03: FINDER FORM */}
      <section ref={finderRef} className="bg-[var(--bg-dark)] text-[var(--text-on-dark)] border-t border-black/15 py-16 px-6 scroll-mt-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-2 border-b border-[var(--text-muted-on-dark)]/20 pb-3 mb-8">
            <span className="font-mono text-xs font-bold text-[var(--gold)] bg-black/35 px-2.5 py-1 rounded">
              FILE 03
            </span>
            <h2 className="text-2xl font-bold font-display tracking-tight">
              Scheme Recommendation Finder
            </h2>
          </div>

          <form onSubmit={handleSearch} className="bg-black/15 border border-white/5 rounded-2xl p-6 md:p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-xs font-mono font-bold tracking-widest text-[var(--gold)] uppercase mb-2">
                  Category (Domain)
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full bg-[var(--bg)] text-[var(--text)] border border-black/10 rounded-lg px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-[var(--gold)] focus:outline-none transition"
                >
                  <option value="">Select Domain Category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* State */}
              <div>
                <label htmlFor="state" className="block text-xs font-mono font-bold tracking-widest text-[var(--gold)] uppercase mb-2">
                  State
                </label>
                <select
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full bg-[var(--bg)] text-[var(--text)] border border-black/10 rounded-lg px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-[var(--gold)] focus:outline-none transition"
                >
                  <option value="">Central / All India</option>
                  {STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sub Category */}
              <div>
                <label htmlFor="subCategory" className="block text-xs font-mono font-bold tracking-widest text-[var(--gold)] uppercase mb-2">
                  Sub-Category / Scheme Tag (Optional)
                </label>
                <input
                  type="text"
                  id="subCategory"
                  name="subCategory"
                  placeholder="e.g. Scholarship, Loan, Pension"
                  value={formData.subCategory}
                  onChange={handleInputChange}
                  className="w-full bg-[var(--bg)] text-[var(--text)] border border-black/10 rounded-lg px-3 py-2.5 text-sm font-medium placeholder-black/45 focus:ring-2 focus:ring-[var(--gold)] focus:outline-none transition"
                />
              </div>

              {/* Beneficiary Type */}
              <div>
                <label htmlFor="beneficiaryType" className="block text-xs font-mono font-bold tracking-widest text-[var(--gold)] uppercase mb-2">
                  Beneficiary Type
                </label>
                <select
                  id="beneficiaryType"
                  name="beneficiaryType"
                  value={formData.beneficiaryType}
                  onChange={handleInputChange}
                  className="w-full bg-[var(--bg)] text-[var(--text)] border border-black/10 rounded-lg px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-[var(--gold)] focus:outline-none transition"
                >
                  <option value="">Select Beneficiary Type</option>
                  <option value="Individual">Individual</option>
                  <option value="Family">Family</option>
                  <option value="Organization">Organization</option>
                </select>
              </div>
            </div>

            {/* Tags (Multiselect Chips) */}
            <div>
              <label className="block text-xs font-mono font-bold tracking-widest text-[var(--gold)] uppercase mb-3">
                Applicable Tags (Select All That Apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {TAG_OPTIONS.map((tag) => {
                  const selected = formData.tags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagToggle(tag)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition border ${
                        selected
                          ? "bg-[var(--gold)] text-black border-transparent shadow"
                          : "bg-white/5 text-[var(--text-on-dark)] border-white/10 hover:bg-white/10"
                      }`}
                    >
                      {tag} {selected && "✓"}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-white/5 flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleReset}
                className="px-5 py-2.5 rounded-xl text-xs font-bold font-mono tracking-wider uppercase border border-white/20 hover:bg-white/5 transition"
              >
                Clear Filters
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-[var(--gold)] text-black px-6 py-2.5 rounded-xl text-xs font-bold font-mono tracking-wider uppercase hover:opacity-90 active:translate-y-[1px] transition disabled:opacity-50"
              >
                {loading ? "Matching..." : "Find Opportunities"}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* 6. DYNAMIC RESULTS LIST */}
      <section ref={resultsRef} className="py-16 px-6 max-w-6xl mx-auto flex-grow scroll-mt-12">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-10 h-10 border-4 border-[var(--gold)] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-mono text-[var(--text-muted)]">Scanning index databases and evaluating criteria...</p>
          </div>
        )}

        {error && (
          <div className="bg-[var(--tape)]/10 border border-[var(--tape)]/30 rounded-xl p-5 text-[var(--text)] text-sm font-medium mb-8">
            <div className="font-mono text-xs uppercase font-bold text-[var(--tape)] mb-1">Retrieval Exception</div>
            {error}
          </div>
        )}

        {!loading && results && (
          <div>
            <div className="flex items-center justify-between border-b border-black/5 pb-3 mb-8">
              <h2 className="text-2xl font-bold font-display tracking-tight">
                Recommended Schemes ({results.total || 0})
              </h2>
              <span className="text-xs font-mono font-semibold text-[var(--text-muted)]">
                Page {results.page} of {results.totalPages || 1}
              </span>
            </div>

            {results.data && results.data.length === 0 ? (
              <div className="bg-[var(--surface)] border border-black/10 rounded-2xl p-10 text-center shadow-sm">
                <span className="text-4xl">📁</span>
                <h3 className="text-lg font-bold font-display mt-4">No High Matches Found</h3>
                <p className="text-sm text-[var(--text-muted)] mt-1 font-medium max-w-md mx-auto">
                  We filter matching scores below 60%. Try broadening your category filters, adding/removing tags, or checking alternate states.
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {results.data.map((item) => {
                  const sData = item.scheme_data;
                  const mData = item.matching_data;
                  const schemeId = sData._id;

                  return (
                    <div
                      key={schemeId}
                      className="relative bg-[var(--surface)] border border-black/10 rounded-2xl p-6 md:p-8 shadow-sm transition hover:shadow-md overflow-hidden"
                    >
                      <Stamp value={mData.matchPercentage} />

                      {/* Heading metadata */}
                      <div className="text-xs font-mono text-[var(--text-muted)] space-x-2 border-b border-black/5 pb-2.5 mb-4 max-w-[calc(100%-100px)]">
                        <span>{sData.ministry || "Ministry"}</span>
                        <span>•</span>
                        <span>{sData.department || "Department"}</span>
                      </div>

                      <h3 className="text-xl font-bold font-display text-[var(--text)] leading-snug tracking-tight pr-24">
                        {sData.scheme_name}
                      </h3>

                      {sData.detailed_description && (
                        <p className="text-xs text-[var(--text-muted)] mt-3 max-w-3xl leading-relaxed font-medium line-clamp-2">
                          {sData.detailed_description}
                        </p>
                      )}

                      {/* Criteria check lists */}
                      <div className="mt-6 grid sm:grid-cols-2 gap-4">
                        <div className="bg-[var(--bg)] p-3 rounded-lg border border-black/5">
                          <div className="text-[10px] font-mono font-bold uppercase text-[var(--ok)] tracking-wider border-b border-[var(--ok)]/10 pb-1 mb-2">
                            Matched Criteria
                          </div>
                          <ul className="text-xs text-[var(--text)] space-y-1.5 font-semibold">
                            {mData.matched && mData.matched.length > 0 ? (
                              mData.matched.map((matchStr, i) => (
                                <li key={i} className="flex items-start">
                                  {CHECK_ICON} {matchStr}
                                </li>
                              ))
                            ) : (
                              <li className="text-[var(--text-muted)] italic font-mono text-[10px]">None recorded</li>
                            )}
                          </ul>
                        </div>

                        <div className="bg-[var(--bg)] p-3 rounded-lg border border-black/5">
                          <div className="text-[10px] font-mono font-bold uppercase text-[var(--tape)] tracking-wider border-b border-[var(--tape)]/10 pb-1 mb-2">
                            Missing / Failed Criteria
                          </div>
                          <ul className="text-xs text-[var(--text)] space-y-1.5 font-semibold">
                            {mData.failedCriteria && mData.failedCriteria.length > 0 ? (
                              mData.failedCriteria.map((fail, i) => (
                                <li key={i} className="flex items-start">
                                  {CROSS_ICON} {fail.field === "tag" ? `Tag: ${fail.expected}` : `${fail.field}: expected ${fail.expected}`}
                                </li>
                              ))
                            ) : (
                              <li className="text-[var(--text-muted)] italic font-mono text-[10px]">None recorded (Perfect Fit)</li>
                            )}
                          </ul>
                        </div>
                      </div>

                      {/* Alternatives if available */}
                      {mData.alternatives && mData.alternatives.length > 0 && (
                        <div className="mt-5 pt-4 border-t border-black/5 text-xs text-[var(--text-muted)] font-mono">
                          <span className="text-[var(--gold)] font-bold uppercase">Alternatives Checklist:</span>
                          <div className="mt-1 space-y-1">
                            {mData.alternatives.map((alt) => (
                              <div key={alt._id} className="text-xs">
                                • <span className="font-semibold text-[var(--text)]">{alt.scheme_name}</span> ({alt.reason})
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Lazy Loading AI Accordions */}
                      <div className="mt-6 pt-4 border-t border-black/5 flex flex-wrap gap-2">
                        <button
                          onClick={() => fetchExplanation(schemeId)}
                          className="border border-black/10 bg-[var(--surface-2)] text-[var(--text)] px-4 py-2 rounded-xl text-xs font-bold font-mono tracking-wide hover:bg-black/5 transition"
                        >
                          {loadingExplanations[schemeId]
                            ? "Explaining..."
                            : explanations[schemeId]
                            ? "Hide Description"
                            : "AI Simple Explanation"}
                        </button>

                        {mData.failedCriteria && mData.failedCriteria.length > 0 && (
                          <button
                            onClick={() => fetchGapAnalysis(schemeId, mData.failedCriteria)}
                            className="border border-black/10 bg-[var(--surface-2)] text-[var(--text)] px-4 py-2 rounded-xl text-xs font-bold font-mono tracking-wide hover:bg-black/5 transition"
                          >
                            {loadingAdvices[schemeId]
                              ? "Analyzing..."
                              : advices[schemeId]
                              ? "Hide Gap Analysis"
                              : "AI Actionable Gap Advice"}
                          </button>
                        )}
                      </div>

                      {/* Display lazy loaded elements */}
                      {(explanations[schemeId] || advices[schemeId]) && (
                        <div className="mt-4 space-y-3 bg-[var(--bg)] p-4 rounded-xl border border-black/5 animate-fadeIn">
                          {explanations[schemeId] && (
                            <div>
                              <div className="text-[10px] font-mono uppercase text-[var(--gold)] font-bold tracking-wider mb-1">
                                AI 3-Sentence Explanation
                              </div>
                              <p className="text-xs text-[var(--text)] leading-relaxed font-medium">
                                {explanations[schemeId]}
                              </p>
                            </div>
                          )}

                          {advices[schemeId] && (
                            <div className={explanations[schemeId] ? "pt-3 border-t border-black/5" : ""}>
                              <div className="text-[10px] font-mono uppercase text-[var(--gold)] font-bold tracking-wider mb-1">
                                AI Actionable Gap Advice
                              </div>
                              <p className="text-xs text-[var(--text)] leading-relaxed font-medium whitespace-pre-line">
                                {advices[schemeId]}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
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
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--gold)] transition">
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
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { getSchemeById } from '../api/scheme.api';
import { explainScheme, intakeProfileFromText, analyzeEligibilityGap } from '../api/ai.api';
import { scoreSingleScheme } from '../api/recommendation.api';

// Utility to detect URLs and render them as links
const renderLinksInText = (text) => {
  if (typeof text !== 'string') return text;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
      return (
        <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-[var(--gold)] underline break-all hover:text-black font-medium">
          {part}
        </a>
      );
    }
    return part;
  });
};

// Utility to render lists or paragraphs
const renderContent = (content) => {
  if (!content || (Array.isArray(content) && content.length === 0)) {
    return <span className="text-[var(--text-muted)] italic">No specific details provided.</span>;
  }
  if (Array.isArray(content)) {
    return (
      <ul className="list-disc list-outside ml-5 space-y-2 text-[var(--text)]">
        {content.map((item, idx) => (
          <li key={idx} className="pl-1 leading-relaxed">{renderLinksInText(item)}</li>
        ))}
      </ul>
    );
  }
  return <p className="text-[var(--text)] leading-relaxed whitespace-pre-wrap">{renderLinksInText(content)}</p>;
};

export default function SchemeDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [scheme, setScheme] = useState(location.state?.scheme || null);
  const [loading, setLoading] = useState(!scheme);
  const [error, setError] = useState(null);

  // AI Simplification State
  const [isSimplified, setIsSimplified] = useState(true);
  const [aiSummary, setAiSummary] = useState(scheme?.ai_summary || null);
  const [summarizing, setSummarizing] = useState(false);
  
  // Eligibility State
  const [eligibilityDesc, setEligibilityDesc] = useState('');
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false);
  const [eligibilityResult, setEligibilityResult] = useState(null); // { advice: { reasons, nextSteps } }
  const [eligibilityError, setEligibilityError] = useState(null);

  // If passed from RecommendationsPage
  const initialPassed = location.state?.passed || null;
  const initialFailed = location.state?.failed || null;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    // If scheme is null OR if it's a sparse scheme from the directory (missing full details)
    if (!scheme || !scheme.eligibility) {
      const fetchScheme = async () => {
        try {
          const data = await getSchemeById(id);
          // The backend returns { success: true, data: { ...scheme } }
          const fetchedScheme = data.data || data.scheme || data;
          setScheme(fetchedScheme);
          if (fetchedScheme?.ai_summary) {
             setAiSummary(fetchedScheme.ai_summary);
          }
        } catch (err) {
          setError("Failed to load scheme details.");
        } finally {
          setLoading(false);
        }
      };
      fetchScheme();
    } else {
      setLoading(false);
    }
  }, [id, scheme]);

  // Fetch AI Summary automatically if simplified mode is on
  useEffect(() => {
    if (scheme && isSimplified && !aiSummary && !summarizing) {
      const fetchSummary = async () => {
        setSummarizing(true);
        try {
          const res = await explainScheme(id);
          if (res.success && res.summary) {
            setAiSummary(res.summary);
          } else {
            setIsSimplified(false); // Fallback if API fails
          }
        } catch (e) {
          console.error(e);
          setIsSimplified(false);
        } finally {
          setSummarizing(false);
        }
      };
      fetchSummary();
    }
  }, [scheme, isSimplified, aiSummary, id]);

  const handleExplain = async () => {
    if (aiSummary) {
      setIsSimplified(true);
      return;
    }
    
    setIsSimplified(true);
    setSummarizing(true);
    
    try {
      const res = await explainScheme(id);
      if (res.success && res.summary) {
        setAiSummary(res.summary);
      } else {
        setIsSimplified(false); // Revert if failed
      }
    } catch (e) {
      console.error(e);
      setIsSimplified(false); // Revert if failed
    } finally {
      setSummarizing(false);
    }
  };

  const hasProfileData = location.state?.passed || location.state?.failed;

  const handleCheckEligibility = async () => {
    if (!hasProfileData) return;
    
    setIsCheckingEligibility(true);
    setEligibilityError(null);
    try {
      const gapRes = await analyzeEligibilityGap(id, initialFailed || [], {});
      if (gapRes.success && gapRes.advice) {
        setEligibilityResult(gapRes);
      } else {
        setEligibilityError("Could not determine eligibility.");
      }
    } catch (e) {
      console.error(e);
      setEligibilityError("Failed to check eligibility. Please try again.");
    } finally {
      setIsCheckingEligibility(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="text-[var(--gold)] font-mono tracking-widest font-bold uppercase animate-pulse">
          Loading Case File...
        </div>
      </div>
    );
  }

  if (error || !scheme) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center text-center p-6">
        <h2 className="text-2xl font-bold font-display text-[var(--tape)] mb-4">Case File Not Found</h2>
        <p className="text-[var(--text-muted)] mb-8">{error || "This scheme no longer exists."}</p>
        <button onClick={() => navigate('/recommendations')} className="bg-[var(--text)] text-[var(--bg)] px-6 py-3 rounded-lg font-bold font-mono tracking-wider text-sm">
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans flex flex-col">
      {/* Top Nav */}
      <header className="bg-[var(--bg-dark)] text-[var(--text-on-dark)] border-b border-black/10 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <button onClick={() => navigate(-1)} className="flex items-center space-x-2 text-[var(--text-muted-on-dark)] hover:text-white font-bold tracking-widest uppercase font-mono text-xs transition-colors">
            <span>← Back</span>
          </button>
          <span className="text-sm font-bold tracking-widest uppercase text-[var(--gold)] font-mono">Case File</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-grow max-w-4xl mx-auto w-full p-6 md:p-8 animate-fade-in-up">
        
        {/* Header Section */}
        <div className="mb-10">
          <div className="text-xs font-mono font-bold tracking-widest text-[var(--gold)] uppercase mb-3 flex flex-wrap gap-2">
            <span>{scheme.ministry || 'Govt of India'}</span>
            {scheme.department && <span>• {scheme.department}</span>}
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-bold text-[var(--text)] leading-tight mb-4">
            {scheme.scheme_name}
          </h1>
          <p className="text-[var(--text-muted)] text-sm md:text-base max-w-2xl font-medium leading-relaxed mb-6">
            {scheme.short_title || "Official Government Scheme Document"}
          </p>

          <div className="flex flex-wrap gap-2 mb-8">
            {scheme.categories?.map((cat, i) => (
              <span key={i} className="bg-[var(--surface-2)] text-[var(--text)] border border-black/5 px-3 py-1 rounded-md text-xs font-bold font-mono tracking-wider uppercase">
                {cat}
              </span>
            ))}
          </div>

          {/* AI Eligibility Check Section */}
          <div className="mt-8 bg-white border border-black/10 rounded-2xl p-6 md:p-8 shadow-sm">
            <h3 className="text-xl font-display font-bold mb-2">Am I eligible for this scheme?</h3>
            
            {!eligibilityResult && !isCheckingEligibility && (
              <>
                <p className="text-sm text-[var(--text-muted)] mb-4">
                  {hasProfileData ? "We have your profile. Click below to analyze your eligibility." : "Take our secure 2-minute questionnaire to instantly check your eligibility for this and 50+ other schemes."}
                </p>
                <div className="flex">
                  {hasProfileData ? (
                    <button 
                      onClick={handleCheckEligibility}
                      className="bg-[var(--text)] text-white px-6 py-2.5 rounded-lg text-xs font-bold font-mono tracking-widest uppercase hover:bg-black/80 transition-colors"
                    >
                      Analyze My Profile
                    </button>
                  ) : (
                    <button 
                      onClick={() => navigate('/questionnaire')}
                      className="bg-[var(--gold)] text-white px-6 py-2.5 rounded-lg text-xs font-bold font-mono tracking-widest uppercase hover:opacity-80 transition-opacity"
                    >
                      Take Questionnaire ➔
                    </button>
                  )}
                </div>
                {eligibilityError && <p className="text-xs text-[var(--tape)] mt-2 font-medium">{eligibilityError}</p>}
              </>
            )}

            {isCheckingEligibility && (
              <div className="py-6 flex flex-col items-center justify-center space-y-3">
                <div className="w-6 h-6 border-2 border-transparent border-t-[var(--gold)] border-b-[var(--gold)] rounded-full animate-spin"></div>
                <div className="text-[var(--gold)] text-xs font-bold font-mono uppercase tracking-widest animate-pulse">
                  Evaluating Eligibility...
                </div>
              </div>
            )}

            {eligibilityResult && (
              <div className="mt-2 animate-fade-in-up">
                {eligibilityResult.advice?.reasons?.length > 0 || eligibilityResult.advice?.nextSteps?.length > 0 ? (
                  <div className="space-y-4">
                    <div className="bg-[var(--tape)]/10 border border-[var(--tape)]/20 p-4 rounded-xl flex items-center gap-3">
                      <span className="text-2xl">⚠️</span>
                      <div>
                        <h4 className="text-sm font-bold text-[var(--tape)] uppercase tracking-wider font-mono">You might not be fully eligible</h4>
                        <p className="text-sm text-[var(--text)] mt-1">Based on your profile, there are some gaps. Review the reasons and next steps below.</p>
                      </div>
                    </div>
                    
                    {eligibilityResult.advice?.reasons?.length > 0 && (
                      <div className="bg-[var(--surface-2)] border border-black/5 p-4 rounded-xl">
                        <h4 className="text-sm font-bold text-[var(--tape)] uppercase tracking-wider mb-2 font-mono">Reasons:</h4>
                        <ul className="space-y-2">
                          {eligibilityResult.advice.reasons.map((r, i) => (
                            <li key={i} className="text-sm text-[var(--text)] flex items-start">
                              <span className="text-[var(--tape)] mr-2 mt-0.5">•</span> <span>{r}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {eligibilityResult.advice?.nextSteps?.length > 0 && (
                      <div className="bg-[var(--surface-2)] border border-black/5 p-4 rounded-xl">
                        <h4 className="text-sm font-bold text-[var(--gold)] uppercase tracking-wider mb-2 font-mono">Next Steps:</h4>
                        <ul className="space-y-2">
                          {eligibilityResult.advice.nextSteps.map((s, i) => (
                            <li key={i} className="text-sm text-[var(--text)] flex items-start">
                              <span className="text-[var(--gold)] mr-2 mt-0.5">➔</span> <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <button onClick={() => { setEligibilityResult(null); }} className="text-xs text-[var(--text-muted)] underline hover:text-black mt-2">
                      Check again
                    </button>
                  </div>
                ) : (
                  <div className="bg-[var(--ok)]/10 border border-[var(--ok)]/20 p-4 rounded-xl flex items-center gap-3">
                     <span className="text-2xl">🎉</span>
                     <div>
                       <h4 className="text-sm font-bold text-[var(--ok)] uppercase tracking-wider font-mono">You appear to be eligible!</h4>
                       <p className="text-sm text-[var(--text)] mt-1">Based on what you provided, you meet the criteria. Please review the official application process below to apply.</p>
                     </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center mb-10 border-b border-black/10 pb-6">
           <h2 className="text-xl font-display font-bold">Scheme Information</h2>
           <button 
             onClick={() => isSimplified ? setIsSimplified(false) : handleExplain()}
             className={`px-4 py-2 rounded-lg text-xs font-bold font-mono tracking-widest transition-all ${isSimplified ? 'bg-[var(--gold)] text-white shadow-sm' : 'bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-black border border-black/10'}`}
           >
             {isSimplified ? "AI SIMPLIFIED ✦ ON" : "AI SIMPLIFIED ✦ OFF"}
           </button>
        </div>

        {/* Details Grid */}
        <div className="space-y-12">
          
          <section>
            <h3 className="text-xs font-mono font-bold tracking-widest uppercase text-[var(--text-muted)] mb-4 flex items-center">
              <span className="w-4 h-px bg-[var(--gold)] mr-3"></span>
              Overview
            </h3>
            <div className="bg-white border border-black/5 rounded-2xl p-6 md:p-8 shadow-sm min-h-[100px] flex flex-col justify-center">
              {isSimplified ? (
                summarizing ? <div className="animate-pulse space-y-3 w-full py-2">
                  <div className="h-3 bg-black/10 rounded-full w-3/4"></div>
                  <div className="h-3 bg-black/10 rounded-full w-full"></div>
                  <div className="h-3 bg-black/10 rounded-full w-5/6"></div>
                </div> : 
                (aiSummary?.overview ? renderContent(aiSummary.overview) : renderContent(scheme.detailed_description))
              ) : renderContent(scheme.detailed_description)}
            </div>
          </section>

          <section>
            <h3 className="text-xs font-mono font-bold tracking-widest uppercase text-[var(--text-muted)] mb-4 flex items-center">
              <span className="w-4 h-px bg-[var(--gold)] mr-3"></span>
              Benefits & Entitlements
            </h3>
            <div className="bg-white border border-black/5 rounded-2xl p-6 md:p-8 shadow-sm border-l-4 border-l-[var(--ok)] min-h-[100px] flex flex-col justify-center">
              {isSimplified ? (
                summarizing ? <div className="animate-pulse space-y-3 w-full py-2">
                  <div className="h-3 bg-black/10 rounded-full w-3/4"></div>
                  <div className="h-3 bg-black/10 rounded-full w-full"></div>
                  <div className="h-3 bg-black/10 rounded-full w-5/6"></div>
                </div> : 
                (aiSummary?.benefits ? renderContent(aiSummary.benefits) : renderContent(scheme.benefits))
              ) : renderContent(scheme.benefits)}
            </div>
          </section>

          <section>
            <h3 className="text-xs font-mono font-bold tracking-widest uppercase text-[var(--text-muted)] mb-4 flex items-center">
              <span className="w-4 h-px bg-[var(--gold)] mr-3"></span>
              Eligibility Criteria
            </h3>
            <div className="bg-white border border-black/5 rounded-2xl p-6 md:p-8 shadow-sm min-h-[100px] flex flex-col justify-center">
              {isSimplified ? (
                summarizing ? <div className="animate-pulse space-y-3 w-full py-2">
                  <div className="h-3 bg-black/10 rounded-full w-3/4"></div>
                  <div className="h-3 bg-black/10 rounded-full w-full"></div>
                  <div className="h-3 bg-black/10 rounded-full w-5/6"></div>
                </div> : 
                (aiSummary?.eligibility ? renderContent(aiSummary.eligibility) : renderContent(scheme.eligibility))
              ) : renderContent(scheme.eligibility)}
            </div>
          </section>

          <section>
            <h3 className="text-xs font-mono font-bold tracking-widest uppercase text-[var(--text-muted)] mb-4 flex items-center">
              <span className="w-4 h-px bg-[var(--gold)] mr-3"></span>
              Application Process
            </h3>
            <div className="bg-white border border-black/5 rounded-2xl p-6 md:p-8 shadow-sm min-h-[100px] flex flex-col justify-center">
              {scheme.application_mode && (
                <div className="mb-4">
                  <span className="bg-[var(--surface-2)] text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-md border border-black/5 inline-block">
                    Mode: {scheme.application_mode}
                  </span>
                </div>
              )}
              {isSimplified ? (
                summarizing ? <div className="animate-pulse space-y-3 w-full py-2">
                  <div className="h-3 bg-black/10 rounded-full w-3/4"></div>
                  <div className="h-3 bg-black/10 rounded-full w-full"></div>
                  <div className="h-3 bg-black/10 rounded-full w-5/6"></div>
                </div> : 
                (aiSummary?.applicationProcess ? renderContent(aiSummary.applicationProcess) : renderContent(scheme.application_process))
              ) : renderContent(scheme.application_process)}
            </div>
          </section>

          <section>
            <h3 className="text-xs font-mono font-bold tracking-widest uppercase text-[var(--text-muted)] mb-4 flex items-center">
              <span className="w-4 h-px bg-[var(--gold)] mr-3"></span>
              Required Documents
            </h3>
            <div className="bg-white border border-black/5 rounded-2xl p-6 md:p-8 shadow-sm">
              {renderContent(scheme.documents_required || scheme.required_documents || scheme.documents)}
            </div>
          </section>

          {scheme.references && (
            <section>
              <h3 className="text-xs font-mono font-bold tracking-widest uppercase text-[var(--text-muted)] mb-4 flex items-center">
                <span className="w-4 h-px bg-[var(--gold)] mr-3"></span>
                Official References
              </h3>
              <div className="bg-[var(--surface-2)] rounded-2xl p-6">
                {renderContent(scheme.references)}
              </div>
            </section>
          )}

        </div>

      </div>
    </div>
  );
}

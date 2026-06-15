import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRecommendationsFromSession } from '../api/recommendation.api';
import { submitAnswer, getCurrentSession } from '../api/session.api';

const getBriefDesc = (scheme) => {
  const desc = scheme.brief_description || scheme.description || scheme.detailed_description;
  if (!desc) return 'Click to view detailed information about this scheme and check your eligibility.';
  if (Array.isArray(desc)) return desc.join(' ');
  return desc;
};

// Loading messages sequence
const LOADING_MESSAGES = [
  "Decrypting secure session...",
  "Cross-referencing 1500+ Schemes...",
  "Calculating weighted match scores...",
  "Generating AI Eligibility Analysis...",
  "Finalizing case files..."
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



const CustomDropdown = ({ value, options, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative">
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white border border-black/10 rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-[var(--gold)] flex items-center justify-between shadow-sm hover:border-black/20 transition-colors w-full"
      >
        <span className="truncate">{options.find(o => o.value === value)?.label || label}</span>
        <svg className={`w-4 h-4 ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </button>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
          <ul className="absolute z-20 mt-1 w-full bg-white border border-black/10 rounded-lg shadow-lg max-h-60 overflow-auto py-1">
            {options.map((opt) => (
              <li 
                key={opt.value}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-[var(--surface-2)] transition-colors ${value === opt.value ? 'font-bold text-[var(--gold)] bg-[var(--surface-2)]' : 'text-[var(--text)]'}`}
              >
                {opt.label}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

// Edit Modal Component
function EditProfileModal({ isOpen, onClose, currentProfile, onSave }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (currentProfile) {
      setFormData(currentProfile);
    }
  }, [currentProfile]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in-up">
      <div className="bg-[var(--surface)] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-black/10 flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-black/5 flex justify-between items-center shrink-0">
          <h2 className="text-lg font-bold font-display">Edit Profile</h2>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--tape)] font-bold text-sm">✕</button>
        </div>
        
        <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar pb-48">
          <div>
            <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">State</label>
            <input value={formData.state || ''} onChange={(e) => handleChange('state', e.target.value)} className="w-full bg-white border border-black/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--gold)] shadow-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Primary Goal</label>
            <CustomDropdown 
              value={formData.primaryGoal || formData.goal || ''} 
              onChange={(val) => handleChange('primaryGoal', val)} 
              label="Select Goal..."
              options={[
                { value: "Scholarships & Education", label: "Scholarships & Education" },
                { value: "Healthcare Support", label: "Healthcare Support" },
                { value: "Financial Assistance", label: "Financial Assistance" },
                { value: "Housing & Welfare", label: "Housing & Welfare" },
                { value: "Business Funding", label: "Business Funding" },
                { value: "Startup Support", label: "Startup Support" },
                { value: "Agriculture Support", label: "Agriculture Support" },
                { value: "Skill Development", label: "Skill Development" },
                { value: "Pension & Senior Benefits", label: "Pension & Senior Benefits" },
                { value: "Women Empowerment", label: "Women Empowerment" }
              ]} 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Occupation</label>
              <CustomDropdown 
                value={formData.bestProfileType || formData.occupation || ''} 
                onChange={(val) => handleChange('bestProfileType', val)} 
                label="Select Occupation..."
                options={[
                  { value: "Student", label: "Student" },
                  { value: "Farmer", label: "Farmer" },
                  { value: "Business Owner", label: "Business Owner" },
                  { value: "Job Seeker", label: "Job Seeker" },
                  { value: "Employee", label: "Employee" },
                  { value: "Homemaker", label: "Homemaker" },
                  { value: "Senior Citizen", label: "Senior Citizen" },
                  { value: "Other", label: "Other" }
                ]} 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Education Level</label>
              <CustomDropdown 
                value={formData.educationLevel || ''} 
                onChange={(val) => handleChange('educationLevel', val)} 
                label="Select Level..."
                options={[
                  { value: "School", label: "School" },
                  { value: "12th", label: "12th" },
                  { value: "Diploma", label: "Diploma" },
                  { value: "Undergraduate", label: "Undergraduate" },
                  { value: "Postgraduate", label: "Postgraduate" },
                  { value: "PhD", label: "PhD" }
                ]} 
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Gender</label>
              <CustomDropdown 
                value={formData.gender || ''} 
                onChange={(val) => handleChange('gender', val)} 
                label="Select Gender..."
                options={[
                  { value: "Male", label: "Male" },
                  { value: "Female", label: "Female" },
                  { value: "Other", label: "Other" },
                  { value: "Prefer not to say", label: "Prefer not to say" }
                ]} 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Category (Caste)</label>
              <CustomDropdown 
                value={formData.category || formData.casteCategory || ''} 
                onChange={(val) => handleChange('category', val)} 
                label="Select Category..."
                options={[
                  { value: "General", label: "General" },
                  { value: "OBC", label: "OBC" },
                  { value: "SC", label: "SC" },
                  { value: "ST", label: "ST" },
                  { value: "EWS", label: "EWS" },
                  { value: "Prefer not to say", label: "Prefer not to say" }
                ]} 
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Age Range</label>
              <CustomDropdown 
                value={formData.ageRange || ''} 
                onChange={(val) => handleChange('ageRange', val)} 
                label="Select Age..."
                options={[
                  { value: "Below 18", label: "Below 18" },
                  { value: "18 – 25", label: "18 – 25" },
                  { value: "26 – 40", label: "26 – 40" },
                  { value: "41 – 59", label: "41 – 59" },
                  { value: "60+", label: "60+" }
                ]} 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Income Range</label>
              <CustomDropdown 
                value={formData.incomeRange || ''} 
                onChange={(val) => handleChange('incomeRange', val)} 
                label="Select Income..."
                options={[
                  { value: "Below ₹1.5 Lakh", label: "Below ₹1.5 Lakh" },
                  { value: "₹1.5L – ₹3L", label: "₹1.5L – ₹3L" },
                  { value: "₹3L – ₹5L", label: "₹3L – ₹5L" },
                  { value: "₹5L – ₹8L", label: "₹5L – ₹8L" },
                  { value: "₹8L – ₹12L", label: "₹8L – ₹12L" },
                  { value: "Above ₹12L", label: "Above ₹12L" }
                ]} 
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Disability Status</label>
            <CustomDropdown 
                value={formData.disability || ''} 
                onChange={(val) => handleChange('disability', val)} 
                label="Select..."
                options={[
                  { value: "No", label: "No" },
                  { value: "Yes", label: "Yes" }
                ]} 
              />
          </div>
        </div>

        <div className="p-6 border-t border-black/5 bg-[var(--surface-2)] flex justify-end">
          <button onClick={handleSave} className="bg-[var(--text)] text-[var(--bg)] px-6 py-2.5 rounded-lg text-sm font-bold font-mono tracking-wider hover:opacity-80 transition-opacity">
            Save & Re-Scan
          </button>
        </div>
      </div>
    </div>
  );
}


export default function RecommendationsPage() {
  const navigate = useNavigate();
  
  const [results, setResults] = useState(() => {
    const cached = sessionStorage.getItem('cachedRecommendations');
    return cached ? JSON.parse(cached) : null;
  });
  const [loading, setLoading] = useState(() => {
    return !sessionStorage.getItem('cachedRecommendations');
  });
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(() => {
    return parseInt(sessionStorage.getItem('cachedRecommendationsPage')) || 1;
  });
  const [fetchingPage, setFetchingPage] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const triggerLoadingSequence = () => {
    sessionStorage.removeItem('cachedRecommendations');
    sessionStorage.removeItem('cachedRecommendationsPage');
    setLoading(true);
    setLoadingMsgIdx(0);
    setError(null);
    setResults(null);
  };

  const fetchResults = async (pageNumber = currentPage) => {
    try {
      setFetchingPage(true);
      const data = await getRecommendationsFromSession(pageNumber, 10);
      
      sessionStorage.setItem('cachedRecommendations', JSON.stringify(data));
      sessionStorage.setItem('cachedRecommendationsPage', pageNumber.toString());

      if (sessionStorage.getItem('hasSeenLoading')) {
        setResults(data);
        setLoading(false);
      } else {
        setTimeout(() => {
          setResults(data);
          setLoading(false);
          sessionStorage.setItem('hasSeenLoading', 'true');
        }, 2500);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to generate recommendations. Please try again.");
      setLoading(false);
    } finally {
      setFetchingPage(false);
    }
  };

  const handlePageChange = async (pageNumber) => {
    setCurrentPage(pageNumber);
    try {
      setFetchingPage(true);
      const data = await getRecommendationsFromSession(pageNumber, 10);
      sessionStorage.setItem('cachedRecommendations', JSON.stringify(data));
      sessionStorage.setItem('cachedRecommendationsPage', pageNumber.toString());
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingPage(false);
      window.scrollTo(0, 0);
    }
  };

  useEffect(() => {
    if (!loading) return;

    const msgInterval = setInterval(() => {
      setLoadingMsgIdx((prev) => (prev < LOADING_MESSAGES.length - 1 ? prev + 1 : prev));
    }, 500);

    fetchResults(currentPage);

    return () => clearInterval(msgInterval);
  }, [loading]);

  const handleSaveProfile = async (newProfile) => {
    setIsEditModalOpen(false);
    setCurrentPage(1);
    sessionStorage.removeItem('cachedRecommendations');
    sessionStorage.removeItem('cachedRecommendationsPage');
    
    // 1. Submit each field and await so we don't trigger a fetch before saving!
    for (const [key, value] of Object.entries(newProfile)) {
      if (!value) continue;
      try {
        await submitAnswer(key, value);
      } catch (e) {
        console.error(`Failed to update ${key}`);
      }
    }

    // 2. Clear cache and trigger the animated refetch
    sessionStorage.removeItem('hasSeenLoading');
    triggerLoadingSequence();
  };

  if (loading) {
    if (sessionStorage.getItem('hasSeenLoading')) {
      return (
        <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center font-sans">
          <div className="relative flex items-center justify-center w-16 h-16 mb-4">
            <div className="absolute inset-0 border-2 border-transparent border-t-[var(--gold)] border-b-[var(--gold)] rounded-full animate-spin"></div>
            <div className="w-4 h-4 bg-[var(--gold)] rounded-full animate-pulse"></div>
          </div>
          <p className="text-[var(--gold)] font-mono tracking-widest text-xs font-bold uppercase animate-pulse">
            Loading Recommendations...
          </p>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-[var(--bg-dark)] flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 border-4 border-white/10 border-t-[var(--gold)] rounded-full animate-spin mb-8"></div>
        <div className="text-[var(--gold)] font-mono text-sm tracking-widest font-bold uppercase animate-pulse text-center">
          {LOADING_MESSAGES[loadingMsgIdx]}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold font-display text-[var(--tape)] mb-4">Analysis Failed</h2>
        <p className="text-[var(--text-muted)] mb-8">{error}</p>
        <button onClick={() => navigate('/')} className="bg-[var(--text)] text-[var(--bg)] px-6 py-3 rounded-lg font-bold font-mono tracking-wider text-sm">
          Return Home
        </button>
      </div>
    );
  }

  const { profile, recommendedSchemes } = results || {};

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans flex flex-col">
      
      {/* Top Nav Dashboard Header */}
      <header className="bg-[var(--bg-dark)] text-[var(--text-on-dark)] border-b border-black/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3 select-none">
            <span className="text-xl font-bold tracking-tight font-display leading-none">Govt Compass Dashboard</span>
          </div>
          <button onClick={() => navigate('/')} className="text-[var(--text-muted-on-dark)] hover:text-[var(--gold)] text-xs font-bold tracking-widest uppercase font-mono transition-colors">
            Exit ✕
          </button>
        </div>
      </header>

      {/* Profile Strip */}
      <div className="bg-white border-b border-black/5 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-mono font-bold uppercase text-[var(--text-muted)] mr-2">Profile Snapshot:</span>
            {profile?.state && <span className="bg-[var(--surface-2)] text-[var(--text)] px-3 py-1 rounded-md text-sm font-medium border border-black/5">{profile.state}</span>}
            {profile?.occupation && <span className="bg-[var(--surface-2)] text-[var(--text)] px-3 py-1 rounded-md text-sm font-medium border border-black/5">{profile.occupation}</span>}
            {profile?.gender && <span className="bg-[var(--surface-2)] text-[var(--text)] px-3 py-1 rounded-md text-sm font-medium border border-black/5">{profile.gender}</span>}
            {profile?.casteCategory && <span className="bg-[var(--surface-2)] text-[var(--text)] px-3 py-1 rounded-md text-sm font-medium border border-black/5">{profile.casteCategory}</span>}
          </div>
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center space-x-2 text-sm font-bold bg-[var(--surface-2)] hover:bg-black/5 border border-black/10 px-4 py-2 rounded-lg transition-colors"
          >
            <span>Edit Profile</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.89 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.89l12.673-12.673z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="flex-grow max-w-7xl mx-auto w-full p-6 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold leading-tight">
            {results?.total || 0} Schemes Matched
          </h1>
          <p className="text-[var(--text-muted)] mt-1 text-sm font-medium">Ranked by highest eligibility score.</p>
        </div>

        {recommendedSchemes?.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-black/5">
            <p className="text-[var(--text-muted)] font-medium">No highly matched schemes found for this profile.</p>
            <button onClick={() => setIsEditModalOpen(true)} className="mt-4 text-[var(--gold)] font-bold underline hover:text-black">Try loosening your criteria.</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedSchemes?.map((item, idx) => {
              const scheme = item.scheme_data;
              const score = item.matching_data.matchPercentage;
              const passed = item.matching_data.matched;
              const failed = item.matching_data.failedCriteria;
              
              return (
                <div key={scheme._id || idx} className="relative bg-white border border-black/10 rounded-2xl p-6 flex flex-col animate-fade-in-up hover:shadow-md transition-shadow" style={{ animationDelay: `${idx * 100}ms`, opacity: 0, animationFillMode: 'forwards' }}>

                  <div className="mb-4">
                    <div className="text-[9px] font-mono font-bold tracking-widest text-[var(--gold)] uppercase mb-1">
                      {scheme.categories?.[0] || scheme.ministry || 'Govt of India'}
                    </div>
                    <h2 className="text-lg font-bold text-[var(--text)] font-display tracking-tight leading-snug mb-2">
                      {scheme.scheme_name}
                    </h2>
                    <p className="text-sm text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                      {getBriefDesc(scheme)}
                    </p>
                  </div>

                  {/* Badges for Criteria Count */}
                  <div className="flex space-x-2 mb-6">
                    <div className="text-xs font-semibold bg-[var(--ok)]/10 text-[var(--ok)] px-2.5 py-1 rounded-md border border-[var(--ok)]/20">
                      {passed.length} Passed
                    </div>
                    <div className="text-xs font-semibold bg-[var(--tape)]/10 text-[var(--tape)] px-2.5 py-1 rounded-md border border-[var(--tape)]/20">
                      {failed.length} Failed
                    </div>
                  </div>

                  <div className="flex-grow space-y-4">
                    {/* Passed Criteria List */}
                    {passed.length > 0 && (
                      <div>
                        <div className="text-[10px] font-mono font-bold uppercase text-[var(--ok)] mb-1">Matched Requirements:</div>
                        <ul className="text-sm text-[var(--text)] space-y-1 font-medium opacity-80">
                          {passed.map((c, i) => (
                            <li key={i} className="flex items-start text-[var(--ok)]"><span className="mr-1.5">•</span><span className="text-[var(--text)]">{c}</span></li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Failed Criteria List (Focus on missing) */}
                    {failed.length > 0 && (
                      <div>
                        <div className="text-[10px] font-mono font-bold uppercase text-[var(--tape)] mb-1">Missing Requirements:</div>
                        <ul className="text-sm text-[var(--text)] space-y-1 font-medium">
                          {failed.map((c, i) => (
                            <li key={i} className="flex items-start text-[var(--tape)]"><span className="mr-1.5">•</span><span className="text-[var(--text)]">{c.expected || String(c)}</span></li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* View Details Section (Bottom Attached) */}
                  <div className="mt-6 pt-4 border-t border-black/5">
                    <button 
                      onClick={() => navigate(`/scheme/${scheme._id}`, { state: { scheme, score, passed, failed, profile } })}
                      className="w-full text-xs font-bold font-mono tracking-widest text-[var(--text)] bg-[var(--surface-2)] border border-black/10 px-4 py-2.5 rounded-lg hover:bg-[var(--text)] hover:text-white transition-all"
                    >
                      VIEW FULL DETAILS ➔
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {results?.totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center space-x-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || fetchingPage}
              className="px-4 py-2 bg-white border border-black/10 rounded-lg text-xs font-bold font-mono tracking-wider hover:bg-[var(--surface-2)] disabled:opacity-40 disabled:hover:bg-white transition-all shadow-sm"
            >
              ◀ PREV
            </button>
            <span className="text-xs font-mono font-bold text-[var(--text-muted)]">
              Page {currentPage} of {results.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === results.totalPages || fetchingPage}
              className="px-4 py-2 bg-white border border-black/10 rounded-lg text-xs font-bold font-mono tracking-wider hover:bg-[var(--surface-2)] disabled:opacity-40 disabled:hover:bg-white transition-all shadow-sm"
            >
              NEXT ▶
            </button>
          </div>
        )}
      </div>

      <EditProfileModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        currentProfile={{
           state: results?.profile?.state,
           primaryGoal: results?.profile?.primaryGoal || results?.profile?.goal,
           bestProfileType: results?.profile?.bestProfileType || results?.profile?.occupation,
           educationLevel: results?.profile?.educationLevel,
           gender: results?.profile?.gender,
           category: results?.profile?.category || results?.profile?.casteCategory,
           ageRange: results?.profile?.ageRange,
           incomeRange: results?.profile?.incomeRange,
           disability: results?.profile?.disability
        }}
        onSave={handleSaveProfile}
      />
    </div>
  );
}

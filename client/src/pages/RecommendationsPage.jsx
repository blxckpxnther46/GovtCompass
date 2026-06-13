import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRecommendationsFromSession } from '../api/recommendation.api';
import { submitAnswer } from '../api/session.api';

const getBriefDesc = (scheme) => {
  const desc = scheme.brief_description || scheme.description || scheme.detailed_description;
  if (!desc) return 'Click to view detailed information about this scheme and check your eligibility.';
  if (Array.isArray(desc)) return desc.join(' ');
  return desc;
};

// Loading messages sequence
const LOADING_MESSAGES = [
  "Decrypting secure session...",
  "Cross-referencing 50+ Schemes...",
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



// Edit Modal Component
function EditProfileModal({ isOpen, onClose, currentProfile, onSave }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (currentProfile) {
      setFormData(currentProfile);
    }
  }, [currentProfile]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in-up">
      <div className="bg-[var(--surface)] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-black/10">
        <div className="p-6 border-b border-black/5 flex justify-between items-center">
          <h2 className="text-lg font-bold font-display">Edit Profile</h2>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--tape)] font-bold text-sm">✕</button>
        </div>
        
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
          <div>
            <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">State</label>
            <input name="state" value={formData.state || ''} onChange={handleChange} className="w-full bg-[var(--surface-2)] border border-black/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[var(--gold)]" />
          </div>
          <div>
            <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Primary Goal</label>
            <select name="goal" value={formData.goal || formData.primaryGoal || ''} onChange={handleChange} className="w-full bg-[var(--surface-2)] border border-black/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[var(--gold)]">
              <option value="">Select Goal...</option>
              <option value="Education/Scholarship">Education/Scholarship</option>
              <option value="Business/Startup">Business/Startup</option>
              <option value="Agriculture">Agriculture</option>
              <option value="Healthcare/Medical">Healthcare/Medical</option>
              <option value="Housing">Housing</option>
              <option value="Pension/Social Security">Pension/Social Security</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Occupation</label>
              <select name="bestProfileType" value={formData.bestProfileType || formData.occupation || ''} onChange={handleChange} className="w-full bg-[var(--surface-2)] border border-black/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[var(--gold)]">
                <option value="Student">Student</option>
                <option value="Farmer">Farmer</option>
                <option value="Unemployed">Unemployed</option>
                <option value="Self Employed">Self Employed</option>
                <option value="Salaried">Salaried</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Education Level</label>
              <select name="educationLevel" value={formData.educationLevel || ''} onChange={handleChange} className="w-full bg-[var(--surface-2)] border border-black/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[var(--gold)]">
                <option value="">Select Level...</option>
                <option value="No Formal Education">No Formal Education</option>
                <option value="Primary School">Primary School</option>
                <option value="High School">High School</option>
                <option value="Undergraduate">Undergraduate</option>
                <option value="Postgraduate">Postgraduate</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Gender</label>
              <select name="gender" value={formData.gender || ''} onChange={handleChange} className="w-full bg-[var(--surface-2)] border border-black/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[var(--gold)]">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Category (Caste)</label>
              <select name="category" value={formData.casteCategory || formData.category || ''} onChange={handleChange} className="w-full bg-[var(--surface-2)] border border-black/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[var(--gold)]">
                <option value="General">General</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="EWS">EWS</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Age Range</label>
              <select name="ageRange" value={formData.ageRange || ''} onChange={handleChange} className="w-full bg-[var(--surface-2)] border border-black/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[var(--gold)]">
                <option value="">Select Age...</option>
                <option value="0-14">0-14</option>
                <option value="15-24">15-24</option>
                <option value="25-59">25-59</option>
                <option value="60+">60+</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Income Range</label>
              <select name="incomeRange" value={formData.incomeRange || ''} onChange={handleChange} className="w-full bg-[var(--surface-2)] border border-black/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[var(--gold)]">
                <option value="">Select Income...</option>
                <option value="Below ₹1 Lakh">Below ₹1 Lakh</option>
                <option value="₹1 Lakh - ₹3 Lakhs">₹1 Lakh - ₹3 Lakhs</option>
                <option value="₹3 Lakhs - ₹8 Lakhs">₹3 Lakhs - ₹8 Lakhs</option>
                <option value="Above ₹8 Lakhs">Above ₹8 Lakhs</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Disability Status</label>
            <select name="disability" value={formData.disability || ''} onChange={handleChange} className="w-full bg-[var(--surface-2)] border border-black/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[var(--gold)]">
              <option value="">Select...</option>
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
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
  
  const [loading, setLoading] = useState(true);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const triggerLoadingSequence = () => {
    setLoading(true);
    setLoadingMsgIdx(0);
    setError(null);
    setResults(null);
  };

  const fetchResults = async () => {
    try {
      const data = await getRecommendationsFromSession();
      if (sessionStorage.getItem('hasSeenLoading')) {
        setResults(data);
        setLoading(false);
      } else {
        setTimeout(() => {
          setResults(data);
          setLoading(false);
          sessionStorage.setItem('hasSeenLoading', 'true');
        }, 2500); // Artificial delay for effect
      }
    } catch (err) {
      console.error(err);
      setError("Failed to generate recommendations. Please try again.");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading) return;

    const msgInterval = setInterval(() => {
      setLoadingMsgIdx((prev) => (prev < LOADING_MESSAGES.length - 1 ? prev + 1 : prev));
    }, 500);

    fetchResults();

    return () => clearInterval(msgInterval);
  }, [loading]);

  const handleSaveProfile = async (newProfile) => {
    setIsEditModalOpen(false);
    sessionStorage.removeItem('hasSeenLoading');
    triggerLoadingSequence();
    
    // Submit each changed field to the session API
    for (const [key, value] of Object.entries(newProfile)) {
      if (results?.profile?.[key] !== value) {
        try {
          await submitAnswer(key, value);
        } catch (e) {
          console.error(`Failed to update ${key}`);
        }
      }
    }

    // After updating session, loading effect triggers fetchResults
  };

  if (loading) {
    if (sessionStorage.getItem('hasSeenLoading')) {
      return <div className="min-h-screen bg-[var(--bg)]"></div>; // Blank screen for a split second while instant fetch happens
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
            {recommendedSchemes?.length || 0} Schemes Matched
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
                  


                  <div className="pr-12 mb-4">
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
                      onClick={() => navigate(`/scheme/${scheme._id}`, { state: { scheme, score, passed, failed } })}
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
      </div>

      <EditProfileModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        currentProfile={{
           ...results?.profile,
           category: results?.profile?.casteCategory || results?.profile?.category
        }}
        onSave={handleSaveProfile}
      />
    </div>
  );
}

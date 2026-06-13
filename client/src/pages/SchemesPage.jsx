import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSchemes, searchSchemes } from '../api/scheme.api';
import { intakeProfileFromText } from '../api/ai.api';
import { getRecommendationsFromProfile } from '../api/recommendation.api';

const getBriefDesc = (scheme) => {
  const desc = scheme.brief_description || scheme.description || scheme.detailed_description;
  if (!desc) return 'Click to view detailed information about this scheme.';
  if (Array.isArray(desc)) return desc.join(' ');
  return desc;
};

const CustomDropdown = ({ value, options, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white border border-black/10 rounded px-4 py-2 text-xs font-medium focus:outline-none focus:border-[var(--gold)] flex items-center justify-between min-w-[140px] shadow-sm hover:border-black/20 transition-colors"
      >
        <span className="truncate">{options.find(o => o.value === value)?.label || label}</span>
        <svg className={`w-3 h-3 ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </button>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
          <ul className="absolute z-20 mt-1 w-full bg-white border border-black/10 rounded shadow-lg max-h-60 overflow-auto py-1">
            {options.map((opt) => (
              <li 
                key={opt.value}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                className={`px-4 py-2 text-xs cursor-pointer hover:bg-[var(--surface-2)] transition-colors ${value === opt.value ? 'font-bold text-[var(--gold)] bg-[var(--surface-2)]' : 'text-[var(--text)]'}`}
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

export default function SchemesPage() {
  const navigate = useNavigate();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [searchMode, setSearchMode] = useState('search'); // 'search' or 'describe'
  const [filters, setFilters] = useState({ state: 'All', level: 'All' });
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    // Reset page when filters change
    setCurrentPage(1);
    // If search box is empty, automatically refetch when filters change
    if (!searchQuery.trim()) {
      fetchSchemes();
    }
    // eslint-disable-next-line
  }, [filters]);

  const fetchSchemes = async () => {
    setLoading(true);
    try {
      // Fetch up to 5000 schemes to support full-database client-side pagination
      const res = await getSchemes(1, 5000, filters);
      setSchemes(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setCurrentPage(1);
    if (!searchQuery.trim()) {
      fetchSchemes();
      return;
    }
    
    if (searchMode === 'describe') {
      setIsAiProcessing(true);
      setLoading(true);
      try {
        const aiProfileRes = await intakeProfileFromText(searchQuery);
        const profile = aiProfileRes.data || aiProfileRes.profile || aiProfileRes;
        
        // Pass filters along with the AI profile
        const payload = { ...profile };
        if (filters.state !== 'All') payload.state = filters.state;
        
        const recommendations = await getRecommendationsFromProfile(payload);
        setSchemes(recommendations || []);
      } catch (err) {
         console.error("AI Intake Failed, falling back to standard search", err);
         const res = await searchSchemes(searchQuery, filters);
         setSchemes(res.data || []);
      } finally {
        setIsAiProcessing(false);
        setLoading(false);
      }
    } else {
      setLoading(true);
      try {
        const res = await searchSchemes(searchQuery, filters);
        setSchemes(res.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
  };

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

      <div className="flex-grow max-w-7xl mx-auto w-full p-6 md:p-8">
        <div className="flex flex-col gap-4 mb-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl md:text-5xl font-display font-bold leading-tight">Explore Schemes</h1>
              <p className="text-[var(--text-muted)] mt-2 font-medium">Browse our full database of government programs.</p>
            </div>
            
            <form onSubmit={handleSearch} className="w-full md:w-auto flex flex-col space-y-3">
              <div className="flex justify-end">
                <div className="bg-[var(--surface-2)] p-1 rounded-lg border border-black/10 flex">
                  <button type="button" onClick={() => setSearchMode('search')} className={`px-3 py-1.5 text-xs font-bold font-mono uppercase tracking-widest rounded-md transition-colors ${searchMode === 'search' ? 'bg-white shadow-sm text-black' : 'text-[var(--text-muted)]'}`}>Search</button>
                  <button type="button" disabled className="px-3 py-1.5 text-xs font-bold font-mono uppercase tracking-widest rounded-md opacity-40 cursor-not-allowed text-[var(--text-muted)]">Describe ✦</button>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <input 
                  type="text" 
                  placeholder={searchMode === 'describe' ? "I am a 25 yr old farmer from UP..." : "Search schemes..."} 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-grow w-full md:w-80 bg-white border border-black/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[var(--gold)] shadow-sm"
                />
                <button type="submit" className="whitespace-nowrap bg-[var(--text)] text-white px-4 py-2 rounded-lg text-xs font-bold font-mono tracking-widest uppercase hover:bg-black/80 transition-colors">
                  {searchMode === 'describe' ? 'AI Search' : 'Search'}
                </button>
              </div>
            </form>
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-4 border-t border-black/5 pt-6 mt-2">
            <span className="text-xs font-bold font-mono uppercase tracking-widest text-[var(--text-muted)]">Filters:</span>
            
            <CustomDropdown 
              value={filters.state}
              onChange={(val) => setFilters({...filters, state: val})}
              label="All States"
              options={[
                { value: "All", label: "All States" },
                { value: "Central", label: "Central Govt" },
                { value: "Andhra Pradesh", label: "Andhra Pradesh" },
                { value: "Maharashtra", label: "Maharashtra" },
                { value: "Punjab", label: "Punjab" },
                { value: "Uttar Pradesh", label: "Uttar Pradesh" },
                { value: "Kerala", label: "Kerala" },
                { value: "Karnataka", label: "Karnataka" },
              ]}
            />
            
            <CustomDropdown 
              value={filters.level}
              onChange={(val) => setFilters({...filters, level: val})}
              label="All Levels"
              options={[
                { value: "All", label: "All Levels" },
                { value: "Central", label: "Central" },
                { value: "State", label: "State" }
              ]}
            />
            {(filters.state !== 'All' || filters.level !== 'All' || searchQuery !== '') && (
              <button 
                onClick={() => {
                  setFilters({ state: 'All', level: 'All' });
                  setSearchQuery('');
                  setSearchMode('search');
                  // fetchSchemes will trigger via useEffect since searchQuery is cleared
                }} 
                className="text-xs text-[var(--text-muted)] hover:text-black underline transition-colors"
              >
                Reset All
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            {isAiProcessing ? (
               <div className="flex flex-col items-center">
                 <div className="w-8 h-8 border-2 border-transparent border-t-[var(--gold)] border-b-[var(--gold)] rounded-full animate-spin mb-4"></div>
                 <div className="text-[var(--gold)] font-mono tracking-widest text-xs font-bold uppercase animate-pulse">
                   AI Processing Profile...
                 </div>
               </div>
            ) : (
               <div className="text-[var(--gold)] font-mono tracking-widest font-bold uppercase animate-pulse">
                 Loading Directory...
               </div>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {schemes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((scheme) => (
              <div key={scheme._id} className="relative bg-white border border-black/10 rounded-2xl p-6 flex flex-col hover:shadow-md transition-shadow">
                <div className="mb-4 flex-grow">
                  <div className="text-[9px] font-mono font-bold tracking-widest text-[var(--gold)] uppercase mb-1">
                    {scheme.categories?.[0] || scheme.ministry || 'Govt of India'}
                  </div>
                  <h2 className="text-lg font-bold text-[var(--text)] font-display tracking-tight leading-snug mb-2">
                    {scheme.scheme_name}
                  </h2>
                  <p className="text-sm text-[var(--text-muted)] line-clamp-3 leading-relaxed">
                    {getBriefDesc(scheme)}
                  </p>
                </div>
                
                <div className="mt-4 pt-4 border-t border-black/5">
                  <button 
                    onClick={() => navigate(`/scheme/${scheme._id}`, { state: { scheme } })}
                    className="w-full text-xs font-bold font-mono tracking-widest text-[var(--text)] bg-[var(--surface-2)] border border-black/10 px-4 py-2.5 rounded-lg hover:bg-[var(--text)] hover:text-white transition-all"
                  >
                    VIEW FULL DETAILS ➔
                  </button>
                </div>
              </div>
            ))}
            {schemes.length === 0 && (
              <div className="col-span-full text-center py-10 text-[var(--text-muted)] font-medium">
                No schemes found matching your search and filters.
              </div>
            )}
            </div>

            {/* Pagination Controls */}
            {schemes.length > itemsPerPage && (
              <div className="flex justify-center items-center mt-12 space-x-2">
                <button
                  onClick={() => { setCurrentPage(prev => Math.max(prev - 1, 1)); window.scrollTo(0, 0); }}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg text-xs font-bold font-mono uppercase tracking-widest transition-colors ${currentPage === 1 ? 'bg-black/5 text-black/20 cursor-not-allowed' : 'bg-[var(--surface-2)] text-[var(--text)] hover:bg-black/10'}`}
                >
                  Prev
                </button>
                <div className="text-xs font-bold font-mono tracking-widest text-[var(--text-muted)] px-4">
                  Page {currentPage} of {Math.ceil(schemes.length / itemsPerPage)}
                </div>
                <button
                  onClick={() => { setCurrentPage(prev => Math.min(prev + 1, Math.ceil(schemes.length / itemsPerPage))); window.scrollTo(0, 0); }}
                  disabled={currentPage === Math.ceil(schemes.length / itemsPerPage)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold font-mono uppercase tracking-widest transition-colors ${currentPage === Math.ceil(schemes.length / itemsPerPage) ? 'bg-black/5 text-black/20 cursor-not-allowed' : 'bg-[var(--surface-2)] text-[var(--text)] hover:bg-black/10'}`}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

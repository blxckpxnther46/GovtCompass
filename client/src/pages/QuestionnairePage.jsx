import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllQuestions, createSession, submitAnswer } from '../api/session.api';

const SearchableSelect = ({ options, onSelect, placeholder }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  const filtered = options.filter(opt => opt.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md">
      <input
        type="text"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
        onFocus={() => setIsOpen(true)}
        className="w-full bg-[var(--surface)] border border-black/10 rounded-lg px-4 py-3 text-sm font-medium text-[var(--text)] focus:outline-none focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)] transition-all placeholder:text-[var(--text-muted)]"
        placeholder={placeholder}
      />
      {isOpen && (
        <ul className="absolute z-50 w-full mt-2 bg-[var(--surface)] border border-black/10 rounded-lg max-h-60 overflow-y-auto custom-scrollbar">
          {filtered.length === 0 ? (
            <li className="px-4 py-3 text-sm text-[var(--text-muted)]">No results found</li>
          ) : (
            filtered.map(opt => (
              <li
                key={opt}
                onClick={() => { setQuery(opt); setIsOpen(false); onSelect(opt); }}
                className="px-4 py-3 text-sm font-medium text-[var(--text)] hover:bg-[var(--surface-2)] cursor-pointer transition-colors"
              >
                {opt}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

export default function QuestionnairePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [inputValue, setInputValue] = useState("");
  const [history, setHistory] = useState([]);
  
  // Animation state
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    async function initSession() {
      try {
        sessionStorage.removeItem('hasSeenLoading');
        await createSession();
        const res = await getAllQuestions();
        if (res.success && res.data.questions) {
          setQuestions(res.data.questions);
        }
        setTimeout(() => setLoading(false), 1200);
      } catch (err) {
        console.error("Failed to initialize session:", err);
        setLoading(false);
      }
    }
    initSession();
  }, []);

  const getNextStepIndex = (currentIndex, currentAnswers) => {
    let nextIndex = currentIndex + 1;
    while (nextIndex < questions.length) {
      const qId = questions[nextIndex].id;
      const profile = currentAnswers['bestProfileType'];
      
      if (['educationLevel', 'fieldOfStudy'].includes(qId) && profile !== 'Student') {
        nextIndex++;
        continue;
      }

      if (qId === 'fieldOfStudy' && currentAnswers['educationLevel'] === 'School') {
        nextIndex++;
        continue;
      }

      if (qId === 'landHolding' && currentAnswers['landOwnership'] === 'No') {
        nextIndex++;
        continue;
      }

      if (['landOwnership', 'landHolding'].includes(qId) && profile !== 'Farmer') {
        nextIndex++;
        continue;
      }
      if (['businessStage', 'businessType'].includes(qId) && profile !== 'Business Owner') {
        nextIndex++;
        continue;
      }
      break;
    }
    return nextIndex;
  };

  const handleOptionSelect = async (questionId, value) => {
    if (isExiting) return;
    
    // Save to answers
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);

    try {
      // Post to backend silently
      await submitAnswer(questionId, value);
    } catch (err) {
      console.error("Failed to submit answer:", err);
    }

    // Trigger Exit animation
    setIsExiting(true);

    setTimeout(() => {
      const nextIndex = getNextStepIndex(currentStep, newAnswers);
      
      if (nextIndex < questions.length) {
        setHistory(prev => [...prev, currentStep]);
        setCurrentStep(nextIndex);
        setInputValue("");
        setIsExiting(false);
      } else {
        // Finished
        navigate('/recommendations');
      }
    }, 300); // Wait for exit animation
  };

  const handleBack = () => {
    if (history.length === 0 || isExiting) return;
    setIsExiting(true);
    setTimeout(() => {
      const prevStep = history[history.length - 1];
      setHistory(history.slice(0, -1));
      setCurrentStep(prevStep);
      setInputValue("");
      setIsExiting(false);
    }, 300);
  };

  const handleTextSubmit = (questionId) => {
    if (!inputValue.trim()) return;
    handleOptionSelect(questionId, inputValue.trim());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center font-sans">
        <div className="relative flex items-center justify-center w-24 h-24 mb-8">
          <div className="absolute inset-0 border-2 border-transparent border-t-[var(--gold)] border-b-[var(--gold)] rounded-full animate-spin-slow"></div>
          <div className="absolute inset-2 border-2 border-transparent border-l-[var(--text-muted)] border-r-[var(--text-muted)] rounded-full animate-spin-reverse"></div>
          <div className="w-6 h-6 bg-[var(--gold)] rounded-full animate-pulse"></div>
        </div>
        <h2 className="text-[var(--text)] font-mono tracking-widest text-xs font-bold uppercase opacity-80">
          Initializing Secure Session
        </h2>
      </div>
    );
  }

  if (questions.length === 0) return null;

  const currentQ = questions[currentStep];
  const progress = Math.round(((currentStep) / questions.length) * 100);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col md:flex-row relative overflow-hidden font-sans">
      
      {/* Left Pane - Context */}
      <div className="w-full md:w-[35%] lg:w-[30%] bg-[var(--bg-dark)] text-[var(--text-on-dark)] flex flex-col justify-between p-8 md:p-12 relative z-20">
        {/* Top: Logo & Cancel (Mobile only) */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3 select-none">
            <span className="text-xl font-bold tracking-tight font-display leading-none">Govt Compass</span>
          </div>
          <button onClick={() => navigate('/')} className="md:hidden text-[var(--text-muted-on-dark)] hover:text-[var(--gold)] text-xs font-bold tracking-widest uppercase font-mono transition-colors">
            Cancel ✕
          </button>
        </div>

        {/* Middle: Progress Indicator */}
        <div className="my-12 md:my-16">
          <div className="text-[var(--gold)] font-mono text-sm tracking-widest uppercase mb-2 opacity-90">
            Progress
          </div>
          <div className="text-5xl md:text-7xl font-display font-bold text-[var(--text-on-dark)] mb-6">
            {String(currentStep + 1).padStart(2, '0')}
            <span className="text-[var(--text-muted-on-dark)] text-2xl md:text-3xl ml-2">/ {String(questions.length).padStart(2, '0')}</span>
          </div>
          
          {/* Progress Bar inside Left Pane */}
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-8">
            <div 
              className="h-full bg-[var(--gold)] transition-all duration-700 ease-in-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        {/* Bottom: Meta Info */}
        <div className="hidden md:block text-xs text-[var(--text-muted-on-dark)] opacity-50 font-mono">
          Secure Session: {localStorage.getItem('sessionId')?.substring(0, 8) || 'Init'}...
        </div>
      </div>

      {/* Right Pane - Action */}
      <div className="w-full md:w-[65%] lg:w-[70%] flex flex-col justify-center p-8 md:p-16 lg:p-24 relative z-10 bg-[var(--bg)] min-h-[60vh] md:min-h-screen overflow-y-auto">
        
        {/* Absolute Back Button */}
        {history.length > 0 && (
          <div className="absolute top-0 left-0 p-4 md:p-12 z-20">
            <button onClick={handleBack} className="text-[var(--text-muted)] hover:text-[var(--text)] text-xs font-bold tracking-widest uppercase font-mono transition-colors bg-[var(--surface)]/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-black/10 md:bg-transparent md:border-none md:p-0">
              ← Back
            </button>
          </div>
        )}

        {/* Absolute Cancel Button (Desktop only) */}
        <div className="hidden md:block absolute top-0 right-0 p-8 md:p-12 z-20">
          <button onClick={() => navigate('/')} className="text-[var(--text-muted)] hover:text-[var(--text)] text-xs font-bold tracking-widest uppercase font-mono transition-colors">
            Cancel ✕
          </button>
        </div>

        <div 
          key={currentQ.id}
          className={`w-full max-w-xl transform transition-all duration-300 pt-16 md:pt-0 ${isExiting ? 'opacity-0 -translate-y-8' : 'animate-fade-in-up'}`}
        >
          {/* Question Text */}
          <h1 className="text-xl md:text-2xl font-display font-bold leading-snug mb-6 text-[var(--text)]">
            {currentQ.label}
          </h1>

          {/* Answer Inputs */}
          {currentQ.type === 'select' && currentQ.options.length > 8 ? (
            <div className="w-full max-w-sm">
              <SearchableSelect 
                options={currentQ.options} 
                onSelect={(val) => handleOptionSelect(currentQ.id, val)}
                placeholder="Type to search..."
              />
            </div>
          ) : currentQ.type === 'select' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
              {currentQ.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleOptionSelect(currentQ.id, opt)}
                  className="text-left px-4 py-3 rounded-lg border border-black/10 bg-[var(--surface)] hover:bg-[var(--surface-2)] hover:border-[var(--gold)]/40 active:scale-[0.98] transition-all duration-200 text-sm font-medium text-[var(--text)]"
                >
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col space-y-4 max-w-sm">
              <input 
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTextSubmit(currentQ.id)}
                className="w-full bg-[var(--surface)] border border-black/10 rounded-lg px-4 py-3 text-sm font-medium text-[var(--text)] focus:outline-none focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)] transition-all placeholder:text-[var(--text-muted)]"
                placeholder="Type your answer here..."
                autoFocus
              />
              <button 
                onClick={() => handleTextSubmit(currentQ.id)}
                className="self-start bg-[var(--text)] text-[var(--bg)] px-6 py-2.5 rounded-lg font-bold font-mono tracking-wider hover:opacity-80 active:scale-[0.98] transition-all text-xs"
              >
                CONFIRM ✓
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

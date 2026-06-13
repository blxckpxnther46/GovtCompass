import React, { createContext, useContext, useEffect, useState } from 'react';
import { createSession } from '../api/session.api';

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [sessionId, setSessionId] = useState(localStorage.getItem('sessionId') || null);
  const [isLoading, setIsLoading] = useState(!sessionId);

  useEffect(() => {
    const initializeSession = async () => {
      if (!sessionId) {
        try {
          const response = await createSession();
          if (response.success && response.sessionId) {
            setSessionId(response.sessionId);
          }
        } catch (error) {
          console.error("Failed to initialize session:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    initializeSession();
  }, [sessionId]);

  return (
    <SessionContext.Provider value={{ sessionId, isLoading }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);

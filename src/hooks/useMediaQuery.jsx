import { useState, useEffect, useMemo } from 'react';

export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  const mediaQuery = useMemo(() => window.matchMedia(query), [query]);

  useEffect(() => {
    const handler = (event) => setMatches(event.matches);
    mediaQuery.addEventListener('change', handler);
    setMatches(mediaQuery.matches);

    return () => mediaQuery.removeEventListener('change', handler);
  }, [mediaQuery]);

  return matches;
};
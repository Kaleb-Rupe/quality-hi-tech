import { useState, useEffect } from 'react';

const useScreenSize = () => {
  const checkIsMobile = () => window.innerWidth <= 1080;
  const [isMobile, setIsMobile] = useState(checkIsMobile);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(checkIsMobile());
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return isMobile;
};

export default useScreenSize;

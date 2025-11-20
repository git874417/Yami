import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll window
    window.scrollTo(0, 0);
    
    // También scroll en el elemento root si existe
    const root = document.getElementById('root');
    if (root) {
      root.scrollTop = 0;
    }
  }, [pathname]);
};

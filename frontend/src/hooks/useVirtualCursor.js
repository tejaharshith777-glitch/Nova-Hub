import { useState, useEffect } from 'react';

export const useVirtualCursor = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [hovered, setHovered] = useState(false);
  const [cursorType, setCursorType] = useState('default'); // 'default', 'button', 'card', 'node'

  useEffect(() => {
    // Return early if touch device is detected
    if (typeof window !== 'undefined' && 'ontouchstart' in window) {
      return;
    }

    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      if (!target) return;

      const isInteractive = 
        target.closest('button, a, input, select, textarea, [role="button"], .cursor-pointer, .interactive-target') ||
        (target instanceof HTMLElement && (target.style.cursor === 'pointer' || target.closest('[style*="cursor: pointer"], [style*="cursor:pointer"]')));

      if (isInteractive) {
        setHovered(true);
        if (target.closest('.bracket-node')) {
          setCursorType('node');
        } else if (
          target.closest('.tournament-card') || 
          target.closest('[class*="card"]') || 
          target.closest('[class*="Carousel"]') || 
          target.closest('[class*="Card"]')
        ) {
          setCursorType('card');
        } else {
          setCursorType('button');
        }
      } else {
        setHovered(false);
        setCursorType('default');
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);

    // Disable standard cursor globally
    document.documentElement.style.cursor = 'none';
    document.body.style.cursor = 'none';

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      document.documentElement.style.cursor = 'auto';
      document.body.style.cursor = 'auto';
    };
  }, []);

  return { position, hovered, cursorType };
};

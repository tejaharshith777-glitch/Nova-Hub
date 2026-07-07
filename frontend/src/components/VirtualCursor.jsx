import React, { useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useVirtualCursor } from '../hooks/useVirtualCursor';

export const VirtualCursor = () => {
  const { position, hovered, cursorType } = useVirtualCursor();

  // Position motion values
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);

  // Springs for multi-layered organic trailing delay
  const spring1 = { stiffness: 700, damping: 32, mass: 0.2 };
  const spring2 = { stiffness: 450, damping: 25, mass: 0.3 };
  const spring3 = { stiffness: 300, damping: 20, mass: 0.4 };
  const spring4 = { stiffness: 200, damping: 16, mass: 0.5 };
  const spring5 = { stiffness: 120, damping: 12, mass: 0.6 };

  const cursorX = useSpring(x, spring1);
  const cursorY = useSpring(y, spring1);

  const trailX1 = useSpring(x, spring2);
  const trailY1 = useSpring(y, spring2);

  const trailX2 = useSpring(x, spring3);
  const trailY2 = useSpring(y, spring3);

  const trailX3 = useSpring(x, spring4);
  const trailY3 = useSpring(y, spring4);

  const trailX4 = useSpring(x, spring5);
  const trailY4 = useSpring(y, spring5);

  useEffect(() => {
    x.set(position.x);
    y.set(position.y);
  }, [position.x, position.y]);

  if (typeof window !== 'undefined' && 'ontouchstart' in window) {
    return null;
  }

  // Determine styles for the retro sticker cursor
  const getCursorStyles = () => {
    switch (cursorType) {
      case 'button':
        return {
          size: 44,
          bg: '#fef08a', // yellow
          label: 'PLAY'
        };
      case 'card':
        return {
          size: 58,
          bg: '#ffedd5', // orange
          label: 'VIEW'
        };
      case 'node':
        return {
          size: 48,
          bg: '#fecdd3', // pink
          label: 'EDIT'
        };
      default:
        return {
          size: 22,
          bg: '#cffafe', // cyan
          label: ''
        };
    }
  };

  const styles = getCursorStyles();

  return (
    <>
      {/* Outer Retro Ring */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[99999] rounded-full border-[3px] border-[#1a1a1a] flex items-center justify-center shadow-[3px_3px_0px_rgba(26,26,26,1)]"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
          width: styles.size,
          height: styles.size,
          backgroundColor: styles.bg,
        }}
        animate={{
          scale: hovered ? 1.2 : 1.0,
          rotate: hovered ? 45 : 0
        }}
        transition={{ type: 'spring', stiffness: 450, damping: 18 }}
      >
        {/* Crosshair ticks */}
        <div className="absolute w-[3px] h-[7px] bg-[#1a1a1a] top-0" />
        <div className="absolute w-[3px] h-[7px] bg-[#1a1a1a] bottom-0" />
        <div className="absolute h-[3px] w-[7px] bg-[#1a1a1a] left-0" />
        <div className="absolute h-[3px] w-[7px] bg-[#1a1a1a] right-0" />

        {styles.label && (
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute text-[8px] font-bold tracking-widest text-[#1a1a1a] uppercase font-mono bg-white border-2 border-[#1a1a1a] px-1 rounded shadow-[1px_1px_0px_rgba(26,26,26,1)]"
            style={{ top: styles.size - 6 }}
          >
            {styles.label}
          </motion.span>
        )}
      </motion.div>

      {/* Trailing Ring Node 1 */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[99998] rounded-full border-2 border-[#1a1a1a]/30"
        style={{
          x: trailX1,
          y: trailY1,
          translateX: '-50%',
          translateY: '-50%',
          width: styles.size * 0.7,
          height: styles.size * 0.7,
        }}
      />

      {/* Trailing Dot Node 2 */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[99997] rounded-full bg-[#e86c3f]/50 border border-[#1a1a1a]/20"
        style={{
          x: trailX2,
          y: trailY2,
          translateX: '-50%',
          translateY: '-50%',
          width: 12,
          height: 12,
        }}
      />

      {/* Trailing Dot Node 3 */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[99996] rounded-full bg-[#1a1a1a]/20"
        style={{
          x: trailX3,
          y: trailY3,
          translateX: '-50%',
          translateY: '-50%',
          width: 8,
          height: 8,
        }}
      />

      {/* Trailing Dot Node 4 */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[99995] rounded-full bg-[#1a1a1a]/10"
        style={{
          x: trailX4,
          y: trailY4,
          translateX: '-50%',
          translateY: '-50%',
          width: 5,
          height: 5,
        }}
      />

      {/* Central Sticker Dot */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[100000] rounded-full border-2 border-[#1a1a1a]"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
          width: 8,
          height: 8,
          backgroundColor: '#ffb3ba' // pastel pink center
        }}
      />
    </>
  );
};

export default VirtualCursor;

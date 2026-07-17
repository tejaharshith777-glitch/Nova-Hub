import React from 'react';
import { motion } from 'framer-motion';

export const ScrollReveal = ({ 
  children, 
  direction = 'up', 
  delay = 0, 
  duration = 0.6, 
  distance = 40,
  className = '',
  once = true,
  threshold = 0.1
}) => {
  // Determine initial coordinates based on direction
  const getDirections = () => {
    switch (direction) {
      case 'up':
        return { y: distance, x: 0 };
      case 'down':
        return { y: -distance, x: 0 };
      case 'left':
        return { y: 0, x: distance };
      case 'right':
        return { y: 0, x: -distance };
      case 'zoom-in':
        return { scale: 0.9, opacity: 0 };
      case 'zoom-out':
        return { scale: 1.1, opacity: 0 };
      default:
        return { y: distance, x: 0 };
    }
  };

  const initialVal = {
    opacity: 0,
    ...getDirections()
  };

  const animateVal = {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    transition: {
      type: 'tween',
      ease: [0.16, 1, 0.3, 1], // Custom premium easeOutExpo curve
      duration: duration,
      delay: delay
    }
  };

  return (
    <motion.div
      initial={initialVal}
      whileInView={animateVal}
      viewport={{ once: once, amount: threshold }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;

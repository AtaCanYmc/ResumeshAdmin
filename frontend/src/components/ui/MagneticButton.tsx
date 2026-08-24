import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
  as?: 'button' | 'a';
}

export default function MagneticButton({ children, className = '', onClick, href, as = 'button', ...props }: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  const Component = motion.div;

  const content = (
    <Component
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={`relative inline-block ${className}`}
    >
      {as === 'button' ? (
        <button onClick={onClick} className="w-full h-full flex items-center justify-center focus:outline-none" {...props}>
          {children}
        </button>
      ) : (
        <a href={href} className="w-full h-full flex items-center justify-center focus:outline-none" target={href?.startsWith('http') ? '_blank' : '_self'} rel="noopener noreferrer">
          {children}
        </a>
      )}
    </Component>
  );

  return content;
}

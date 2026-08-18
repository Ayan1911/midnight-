import React, { useEffect, useRef } from 'react';

export const HeroPipeline: React.FC = () => {
  const pipelineRef = useRef<HTMLDivElement>(null);
  const nodeStackRef = useRef<HTMLDivElement>(null);
  const nodeXRef = useRef<HTMLDivElement>(null);
  const nodeShieldRef = useRef<HTMLDivElement>(null);
  const glowPathRef = useRef<SVGPathElement>(null);
  const corePathRef = useRef<SVGPathElement>(null);
  const gradientRef = useRef<SVGLinearGradientElement>(null);
  const splashRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animId: number;
    let state = 'p1'; // 'p1' -> 'splash' -> 'p2' -> 'idle'
    let lastStateChange = performance.now();

    const updatePathCoordinates = () => {
      if (!pipelineRef.current || !nodeStackRef.current || !nodeXRef.current || !nodeShieldRef.current) return;
      const pRect = pipelineRef.current.getBoundingClientRect();
      const sRect = nodeStackRef.current.getBoundingClientRect();
      const xRect = nodeXRef.current.getBoundingClientRect();
      const shRect = nodeShieldRef.current.getBoundingClientRect();

      const startX = sRect.left + sRect.width / 2 - pRect.left;
      const startY = sRect.top + sRect.height / 2 - pRect.top;
      const midX = xRect.left + xRect.width / 2 - pRect.left;
      const midY = xRect.top + xRect.height / 2 - pRect.top;
      const endX = shRect.left + shRect.width / 2 - pRect.left;
      const endY = shRect.top + shRect.height / 2 - pRect.top;

      const d = `M ${startX},${startY} L ${midX},${midY} L ${endX},${endY}`;
      if (glowPathRef.current) glowPathRef.current.setAttribute('d', d);
      if (corePathRef.current) corePathRef.current.setAttribute('d', d);
    };

    updatePathCoordinates();
    window.addEventListener('resize', updatePathCoordinates);

    const animate = (timestamp: number) => {
      const elapsed = timestamp - lastStateChange;

      if (state === 'p1') {
        const duration = 800;
        const progress = Math.min(elapsed / duration, 1);
        const percentage = progress * 0.5; // 0 -> 0.5

        if (progress < 0.4) {
          nodeStackRef.current?.classList.add('active');
        } else {
          nodeStackRef.current?.classList.remove('active');
        }

        const center = percentage * 100;
        if (gradientRef.current) {
          gradientRef.current.setAttribute('x1', `${center - 5}%`);
          gradientRef.current.setAttribute('x2', `${center + 5}%`);
        }

        if (progress >= 1) {
          state = 'splash';
          lastStateChange = timestamp;
          if (glowPathRef.current) glowPathRef.current.style.opacity = '0';
          if (corePathRef.current) corePathRef.current.style.opacity = '0';
          splashRef.current?.classList.add('animate');
        }
      } else if (state === 'splash') {
        if (elapsed >= 800) {
          state = 'p2';
          lastStateChange = timestamp;
          splashRef.current?.classList.remove('animate');
          if (glowPathRef.current) glowPathRef.current.style.opacity = '0.6';
          if (corePathRef.current) corePathRef.current.style.opacity = '1';
        }
      } else if (state === 'p2') {
        const duration = 800;
        const progress = Math.min(elapsed / duration, 1);
        const percentage = 0.5 + progress * 0.5; // 0.5 -> 1.0

        if (progress > 0.6) {
          nodeShieldRef.current?.classList.add('active');
        } else {
          nodeShieldRef.current?.classList.remove('active');
        }

        const center = percentage * 100;
        if (gradientRef.current) {
          gradientRef.current.setAttribute('x1', `${center - 5}%`);
          gradientRef.current.setAttribute('x2', `${center + 5}%`);
        }

        if (progress >= 1) {
          nodeShieldRef.current?.classList.remove('active');
          state = 'idle';
          lastStateChange = timestamp;
        }
      } else if (state === 'idle') {
        if (elapsed >= 1000) {
          state = 'p1';
          lastStateChange = timestamp;
        }
      }

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', updatePathCoordinates);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="icon-pipeline" ref={pipelineRef}>
      <svg className="beam-svg">
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <linearGradient id="beam-gradient" gradientUnits="userSpaceOnUse" y1="0%" y2="0%">
            <stop offset="0%" stopColor="#b04090" stopOpacity="0" />
            <stop offset="20%" stopColor="#b04090" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="80%" stopColor="#c8a0e0" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#c8a0e0" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path ref={glowPathRef} stroke="url(#beam-gradient)" strokeWidth="2" filter="url(#glow)" opacity="0.6" fill="none" />
        <path ref={corePathRef} stroke="url(#beam-gradient)" strokeWidth="0.8" fill="none" />
      </svg>

      {/* Left Node: Private Witness (Credential) */}
      <div className="icon-node node-light-right" ref={nodeStackRef} id="node-stack" title="Local Private Witness">
        <svg viewBox="0 0 24 24">
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      </div>

      <div className="pipeline-line" />

      {/* Center Node: ZK Proving Circuit Engine */}
      <div className="center-wrapper">
        <div className="splash" ref={splashRef} />
        <div className="icon-node-center" ref={nodeXRef} id="node-x" title="Midnight Zero-Knowledge Circuit Engine">
          <svg viewBox="0 0 40 40">
            <path d="M10 10 L30 30 M30 10 L10 30" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      <div className="pipeline-line right" />

      {/* Right Node: Public Ledger (Verified Tally) */}
      <div className="icon-node node-light-left" ref={nodeShieldRef} id="node-shield" title="Public Blockchain Ledger">
        <svg viewBox="0 0 24 24">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <polyline points="9 12 11 14 15 10" />
        </svg>
      </div>
    </div>
  );
};

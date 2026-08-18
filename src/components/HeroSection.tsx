import React, { useEffect, useRef, useState } from 'react';
import { Layers, ShieldCheck } from 'lucide-react';
import './HeroSection.css';

export interface HeroSectionProps {
  onLogin?: () => void;
  onSignup?: () => void;
  onGetStarted?: () => void;
  onMethodClick?: () => void;
  onPricingClick?: () => void;
  onDocsClick?: () => void;
  title?: string;
  titleAccent?: string;
  subtitle?: string;
  ctaText?: string;
  brandName?: string;
  isLoggedIn?: boolean;
  userAddress?: string | null;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onLogin,
  onSignup,
  onGetStarted,
  onMethodClick,
  onPricingClick,
  onDocsClick,
  title = 'The simple way',
  titleAccent = 'encryption your data',
  subtitle = 'Fully managed data encrypting service and annotation platform for teams of all industries.',
  ctaText = 'Get Started',
  brandName = 'Xero',
  isLoggedIn = false,
  userAddress = null,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // DOM Refs for animation pipeline
  const pipelineRef = useRef<HTMLDivElement | null>(null);
  const nodeStackRef = useRef<HTMLDivElement | null>(null);
  const nodeXRef = useRef<HTMLDivElement | null>(null);
  const nodeShieldRef = useRef<HTMLDivElement | null>(null);
  const splashRef = useRef<HTMLDivElement | null>(null);
  const beamSvgRef = useRef<SVGSVGElement | null>(null);
  const glowPathRef = useRef<SVGPathElement | null>(null);
  const corePathRef = useRef<SVGPathElement | null>(null);
  const gradientRef = useRef<SVGLinearGradientElement | null>(null);

  // Body scroll lock on mobile menu toggle
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (mobileMenuOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
    };
  }, [mobileMenuOpen]);

  // Animation state machine loop
  useEffect(() => {
    let animId: number;
    let stage: 'p1' | 'splash' | 'p2' | 'idle' = 'p1';
    let stageStartTime = performance.now();

    const STAGE_DURATIONS = {
      p1: 800,
      splash: 800,
      p2: 800,
      idle: 1000,
    };

    // Calculate beam path coordinates
    const updatePath = () => {
      if (
        !pipelineRef.current ||
        !nodeStackRef.current ||
        !nodeXRef.current ||
        !nodeShieldRef.current ||
        !glowPathRef.current ||
        !corePathRef.current
      ) {
        return;
      }

      const pRect = pipelineRef.current.getBoundingClientRect();
      const sRect = nodeStackRef.current.getBoundingClientRect();
      const xRect = nodeXRef.current.getBoundingClientRect();
      const shRect = nodeShieldRef.current.getBoundingClientRect();

      const startX = sRect.left - pRect.left + sRect.width / 2;
      const startY = sRect.top - pRect.top + sRect.height / 2;

      const midX = xRect.left - pRect.left + xRect.width / 2;
      const midY = xRect.top - pRect.top + xRect.height / 2;

      const endX = shRect.left - pRect.left + shRect.width / 2;
      const endY = shRect.top - pRect.top + shRect.height / 2;

      const d = `M ${startX.toFixed(1)},${startY.toFixed(1)} L ${midX.toFixed(1)},${midY.toFixed(1)} L ${endX.toFixed(1)},${endY.toFixed(1)}`;
      glowPathRef.current.setAttribute('d', d);
      corePathRef.current.setAttribute('d', d);
    };

    updatePath();
    window.addEventListener('resize', updatePath);

    // Main animation step
    const step = (now: number) => {
      const elapsed = now - stageStartTime;

      if (stage === 'p1') {
        const progress = Math.min(elapsed / STAGE_DURATIONS.p1, 1);
        const percentage = progress * 0.5; // 0 -> 0.5

        if (gradientRef.current) {
          const center = percentage * 100;
          gradientRef.current.setAttribute('x1', `${(center - 5).toFixed(2)}%`);
          gradientRef.current.setAttribute('x2', `${(center + 5).toFixed(2)}%`);
          gradientRef.current.setAttribute('y1', '0%');
          gradientRef.current.setAttribute('y2', '0%');
        }

        if (nodeStackRef.current) {
          if (percentage < 0.4) {
            nodeStackRef.current.classList.add('active');
          } else {
            nodeStackRef.current.classList.remove('active');
          }
        }

        if (progress >= 1) {
          stage = 'splash';
          stageStartTime = now;
          if (beamSvgRef.current) beamSvgRef.current.style.opacity = '0';
          if (splashRef.current) {
            splashRef.current.classList.remove('animate');
            // Force reflow
            void splashRef.current.offsetWidth;
            splashRef.current.classList.add('animate');
          }
        }
      } else if (stage === 'splash') {
        if (elapsed >= STAGE_DURATIONS.splash) {
          stage = 'p2';
          stageStartTime = now;
          if (splashRef.current) splashRef.current.classList.remove('animate');
          if (beamSvgRef.current) beamSvgRef.current.style.opacity = '1';
        }
      } else if (stage === 'p2') {
        const progress = Math.min(elapsed / STAGE_DURATIONS.p2, 1);
        const percentage = 0.5 + progress * 0.5; // 0.5 -> 1.0

        if (gradientRef.current) {
          const center = percentage * 100;
          gradientRef.current.setAttribute('x1', `${(center - 5).toFixed(2)}%`);
          gradientRef.current.setAttribute('x2', `${(center + 5).toFixed(2)}%`);
          gradientRef.current.setAttribute('y1', '0%');
          gradientRef.current.setAttribute('y2', '0%');
        }

        if (nodeShieldRef.current) {
          if (percentage > 0.6) {
            nodeShieldRef.current.classList.add('active');
          } else {
            nodeShieldRef.current.classList.remove('active');
          }
        }

        if (progress >= 1) {
          stage = 'idle';
          stageStartTime = now;
          if (nodeShieldRef.current) nodeShieldRef.current.classList.remove('active');
        }
      } else if (stage === 'idle') {
        if (elapsed >= STAGE_DURATIONS.idle) {
          stage = 'p1';
          stageStartTime = now;
        }
      }

      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', updatePath);
    };
  }, []);

  const handleNavClick = (callback?: () => void) => {
    setMobileMenuOpen(false);
    if (callback) callback();
  };

  return (
    <div className="hero-wrapper">
      {/* 1. Navbar Implementation */}
      <nav className="hero-nav">
        <span
          className="nav-logo"
          onClick={() => handleNavClick(onMethodClick)}
        >
          {brandName}
        </span>

        {/* Mobile Hamburger Trigger */}
        <button
          type="button"
          className={`menu-toggle ${mobileMenuOpen ? 'active' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          <span></span>
          <span></span>
        </button>

        <div className={`nav-menu ${mobileMenuOpen ? 'active' : ''}`}>
          <ul className="nav-links">
            <li>
              <a
                href="#method"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(onMethodClick);
                }}
              >
                Method
              </a>
            </li>
            <li>
              <a
                href="#pricing"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(onPricingClick);
                }}
              >
                Pricing
              </a>
            </li>
            <li>
              <a
                href="#docs"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(onDocsClick);
                }}
              >
                Docs
              </a>
            </li>
          </ul>

          <div className="nav-actions">
            {isLoggedIn ? (
              <button
                type="button"
                className="btn-login"
                onClick={() => handleNavClick(onLogin)}
              >
                {userAddress ? `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}` : 'Connected'}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="btn-login"
                  onClick={() => handleNavClick(onLogin)}
                >
                  Log In
                </button>
                <button
                  type="button"
                  className="btn-signup"
                  onClick={() => handleNavClick(onSignup || onGetStarted)}
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* 2. Hero Card & Visual Arc */}
      <section className="hero-card">
        <div className="hero-grid" aria-hidden="true"></div>

        {/* 3. Animated Icon Pipeline (Centerpiece) */}
        <div className="icon-pipeline" ref={pipelineRef}>
          {/* Beam SVG */}
          <svg className="beam-svg" ref={beamSvgRef}>
            <defs>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blurOut" />
                <feComposite in="SourceGraphic" in2="blurOut" operator="over" />
              </filter>
              <linearGradient
                id="beam-gradient"
                ref={gradientRef}
                gradientUnits="userSpaceOnUse"
                x1="0%"
                y1="0%"
                x2="10%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#b04090" stopOpacity="0" />
                <stop offset="20%" stopColor="#b04090" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="80%" stopColor="#c8a0e0" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#c8a0e0" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              ref={glowPathRef}
              stroke="url(#beam-gradient)"
              strokeWidth="2"
              filter="url(#glow)"
              opacity="0.6"
              fill="none"
            />
            <path
              ref={corePathRef}
              stroke="url(#beam-gradient)"
              strokeWidth="0.8"
              fill="none"
            />
          </svg>

          {/* Left Node */}
          <div
            id="node-stack"
            className="icon-node node-light-right"
            ref={nodeStackRef}
          >
            <Layers className="w-5 h-5 text-zinc-300" />
          </div>

          {/* Left Pipeline Line */}
          <div className="pipeline-line"></div>

          {/* Center Wrapper */}
          <div className="center-wrapper">
            <div className="splash" ref={splashRef}></div>
            <div
              id="node-x"
              className="icon-node-center"
              ref={nodeXRef}
            >
              {/* 28x28 white Xero "X" SVG */}
              <svg
                width="28"
                height="28"
                viewBox="0 0 28 28"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 6L22 22M22 6L6 22"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* Right Pipeline Line */}
          <div className="pipeline-line pipeline-line-reversed"></div>

          {/* Right Node */}
          <div
            id="node-shield"
            className="icon-node node-light-left"
            ref={nodeShieldRef}
          >
            <ShieldCheck className="w-5 h-5 text-zinc-300" />
          </div>
        </div>

        {/* 4. Hero Content & Copy */}
        <div className="hero-content">
          <h1 className="hero-heading">
            {title}
            <strong>{titleAccent}</strong>
          </h1>
          <p className="hero-sub">{subtitle}</p>
          <button
            type="button"
            className="btn-cta"
            onClick={onGetStarted}
          >
            {ctaText}
          </button>
        </div>
      </section>

      {/* 5. Monochrome Brands Row */}
      <div className="brands">
        {/* 1. Expedia */}
        <div className="brand-item">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polygon points="12 8 8 16 16 16" fill="currentColor" fillOpacity="0.2" />
          </svg>
          <span>Expedia</span>
        </div>

        {/* 2. asana */}
        <div className="brand-item">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="7" r="4" />
            <circle cx="5" cy="16" r="3.5" />
            <circle cx="19" cy="16" r="3.5" />
          </svg>
          <span>asana</span>
        </div>

        {/* 3. zenefits */}
        <div className="brand-item">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="4,8 12,8 20,8" />
            <polyline points="4,12 12,12 20,12" />
            <polyline points="4,16 12,16 20,16" />
          </svg>
          <span>zenefits</span>
        </div>

        {/* 4. HubSpot */}
        <div className="brand-item">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="18" cy="6" r="3" />
            <circle cx="6" cy="18" r="3" />
            <line x1="8.5" y1="15.5" x2="15.5" y2="8.5" />
          </svg>
          <span>
            HubSp<span className="hubspot-dot"></span>t
          </span>
        </div>

        {/* 5. loom */}
        <div className="brand-item">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="8" y1="8" x2="16" y2="16" />
            <line x1="16" y1="8" x2="8" y2="16" />
          </svg>
          <span>loom</span>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;

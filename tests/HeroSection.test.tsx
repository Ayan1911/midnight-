import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import { HeroSection } from '../src/components/HeroSection';

describe('HeroSection Component (Xero Landing Hero)', () => {
  afterEach(() => cleanup());

  it('renders Xero branding, heading, and call to action', () => {
    render(<HeroSection />);
    expect(screen.getByText('Xero')).toBeInTheDocument();
    expect(screen.getByText(/The simple way/i)).toBeInTheDocument();
    expect(screen.getByText(/encryption your data/i)).toBeInTheDocument();
    expect(screen.getByText('Get Started')).toBeInTheDocument();
  });

  it('renders all 5 monochrome brand items', () => {
    render(<HeroSection />);
    expect(screen.getByText('Expedia')).toBeInTheDocument();
    expect(screen.getByText('asana')).toBeInTheDocument();
    expect(screen.getByText('zenefits')).toBeInTheDocument();
    expect(screen.getByText(/HubSp/i)).toBeInTheDocument();
    expect(screen.getByText('loom')).toBeInTheDocument();
  });

  it('handles CTA, Login, and Signup click events', () => {
    const handleGetStarted = vi.fn();
    const handleLogin = vi.fn();
    const handleSignup = vi.fn();

    render(
      <HeroSection
        onGetStarted={handleGetStarted}
        onLogin={handleLogin}
        onSignup={handleSignup}
      />
    );

    const ctaButton = screen.getByText('Get Started');
    fireEvent.click(ctaButton);
    expect(handleGetStarted).toHaveBeenCalledTimes(1);

    const loginButton = screen.getByText('Log In');
    fireEvent.click(loginButton);
    expect(handleLogin).toHaveBeenCalledTimes(1);

    const signupButton = screen.getByText('Sign Up');
    fireEvent.click(signupButton);
    expect(handleSignup).toHaveBeenCalledTimes(1);
  });

  it('toggles mobile navigation menu', () => {
    render(<HeroSection />);
    const toggleButton = screen.getByLabelText('Toggle navigation menu');
    expect(toggleButton).toBeInTheDocument();

    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveClass('active');

    fireEvent.click(toggleButton);
    expect(toggleButton).not.toHaveClass('active');
  });
});

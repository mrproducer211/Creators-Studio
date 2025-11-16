import React, { useEffect, useRef } from 'react';
import { FEATURES } from '../constants';
import { Icon } from './shared/Icon';

interface HomePageProps {
  onNavigateToLogin: () => void;
  onNavigateToSignup: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigateToLogin, onNavigateToSignup }) => {
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      {
        threshold: 0.1,
      }
    );

    const features = featuresRef.current?.querySelectorAll('.feature-card');
    if (features) {
      features.forEach((feature) => observer.observe(feature));
    }

    return () => {
      if (features) {
        features.forEach((feature) => observer.unobserve(feature));
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white font-['Inter',_sans-serif]">
      <style>{`
        @keyframes aurora {
          from {
            background-position: 50% 50%, 50% 50%;
          }
          to {
            background-position: 350% 50%, 350% 50%;
          }
        }
        .aurora-bg {
          position: relative;
          background-image: radial-gradient(100% 200% at 100% 0%, rgba(168, 85, 247, 0.2) 0%, rgba(99, 102, 241, 0.15) 40%, rgba(59, 130, 246, 0.0) 100%);
          animation: aurora 20s linear infinite;
        }
        .feature-card {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        .feature-card.visible {
          opacity: 1;
          transform: translateY(0);
        }
        ${FEATURES.map((_, i) => `.feature-card:nth-child(${i + 1}) { transition-delay: ${i * 100}ms; }`).join('\n')}

        .cta-glow {
            animation: cta-glow-pulse 2s infinite;
        }
        @keyframes cta-glow-pulse {
            0%, 100% {
                box-shadow: 0 0 20px rgba(168, 85, 247, 0.3);
            }
            50% {
                box-shadow: 0 0 35px rgba(168, 85, 247, 0.5);
            }
        }
      `}</style>

      <div className="relative isolate overflow-hidden aurora-bg">
        <header className="absolute inset-x-0 top-0 z-50">
          <nav className="flex items-center justify-between p-4 lg:px-8 max-w-7xl mx-auto" aria-label="Global">
            <div className="flex lg:flex-1">
              <a href="#" className="-m-1.5 p-1.5 flex items-center gap-2">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 2a1 1 0 00-1 1v1h14V3a1 1 0 00-1-1H5zM3 6h14v10a2 2 0 01-2 2H5a2 2 0 01-2-2V6zm9.5 2a.5.5 0 000 1h2a.5.5 0 000-1h-2zM6 9a.5.5 0 01.5-.5h5a.5.5 0 010 1h-5A.5.5 0 016 9zm.5 3.5a.5.5 0 000 1h5a.5.5 0 000-1h-5z" clipRule="evenodd" />
                </svg>
                <span className="text-xl font-bold tracking-tighter">Creator Studio</span>
              </a>
            </div>
            <div className="flex items-center lg:flex-1 lg:justify-end gap-x-6">
              <button onClick={onNavigateToLogin} className="text-sm font-semibold leading-6 text-gray-300 hover:text-white transition-colors duration-200">
                Sign In
              </button>
              <button onClick={onNavigateToSignup} className="rounded-md bg-white px-3.5 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-colors duration-200">
                Sign Up
              </button>
            </div>
          </nav>
        </header>

        <div className="mx-auto max-w-4xl pt-32 pb-24 sm:pt-48 sm:pb-32 px-6 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl leading-tight">
            Unleash Your Creativity with Generative AI
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-300 max-w-2xl mx-auto">
            Generate breathtaking images, craft dynamic videos, and edit visuals with the power of Ai. Your vision, instantly realized.
          </p>
          <div className="mt-10">
            <button
              onClick={onNavigateToSignup}
              className="rounded-md bg-purple-600 px-5 py-3 text-base font-semibold text-white hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500 transition-all duration-300 transform hover:scale-105 cta-glow"
            >
              Start Creating for Free
            </button>
          </div>
        </div>
      </div>

      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-purple-400">Your Complete AI Toolkit</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              From Idea to Masterpiece
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-400">
              Leverage Google's state-of-the-art Gemini models in a seamless workflow designed for professional-quality results.
            </p>
          </div>
          <div ref={featuresRef} className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
              {FEATURES.map((feature) => (
                <div key={feature.id} className="feature-card flex flex-col p-6 bg-white/5 border border-white/10 rounded-2xl transition-all duration-300 hover:bg-white/10 hover:border-purple-400/50 hover:-translate-y-2">
                  <dt className="flex items-center gap-x-3 text-lg font-semibold leading-7 text-white">
                    <div className="h-12 w-12 flex-none rounded-lg bg-purple-600/20 flex items-center justify-center text-purple-300 ring-1 ring-inset ring-purple-400/20">
                        <Icon name={feature.icon} className="h-6 w-6" />
                    </div>
                    {feature.title}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-400">
                    <p className="flex-auto">{feature.description}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center text-gray-500 text-sm">
            <p>&copy; 2025 Creator Studio. All rights reserved. Powered by @menoftomorrow on Telegram.</p>
        </div>
      </footer>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { ImageGenerator } from './components/ImageGenerator';
import { ImageEditor } from './components/ImageEditor';
import { VideoGenerator } from './components/VideoGenerator';
import { ImageAnalyzer } from './components/ImageAnalyzer';
import { PromptBot } from './components/Chatbot';
import { ImageEnhancer } from './components/ImageEnhancer';
import { LoginPage } from './components/auth/LoginPage';
import { SignupPage } from './components/auth/SignupPage';
import { HomePage } from './components/HomePage';
import { FEATURES } from './constants';
import { Feature } from './types';
import { Icon } from './components/shared/Icon';

type PageState = 'homepage' | 'auth' | 'studio';

const App: React.FC = () => {
  const [pageState, setPageState] = useState<PageState>('homepage');
  const [authPage, setAuthPage] = useState<'login' | 'signup'>('login');
  const [activeFeature, setActiveFeature] = useState<Feature>(FEATURES[0]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const userSession = localStorage.getItem('gemini-creator-studio-session');
    if (userSession === 'true') {
      setPageState('studio');
    } else {
      setPageState('homepage');
    }
  }, []);

  useEffect(() => {
    if (window.innerWidth < 1024) { // lg breakpoint
      setIsSidebarOpen(false);
    }
  }, [activeFeature]);

  const handleLogin = () => {
    localStorage.setItem('gemini-creator-studio-session', 'true');
    setPageState('studio');
  };

  const handleSignup = () => {
    localStorage.setItem('gemini-creator-studio-session', 'true');
    setPageState('studio');
  };
  
  const handleLogout = () => {
    localStorage.removeItem('gemini-creator-studio-session');
    localStorage.removeItem('gemini-creator-studio-user'); 
    setPageState('homepage');
  };

  const renderActiveFeature = () => {
    switch (activeFeature.id) {
      case 'generate-image':
        return <ImageGenerator />;
      case 'edit-image':
        return <ImageEditor />;
      case 'generate-video':
        return <VideoGenerator />;
      case 'analyze-image':
        return <ImageAnalyzer />;
      case 'chatbot':
        return <PromptBot />;
      case 'enhance-image':
        return <ImageEnhancer />;
      default:
        return <ImageGenerator />;
    }
  };

  if (pageState === 'homepage') {
    return <HomePage 
      onNavigateToLogin={() => { setAuthPage('login'); setPageState('auth'); }}
      onNavigateToSignup={() => { setAuthPage('signup'); setPageState('auth'); }}
    />;
  }

  if (pageState === 'auth') {
    if (authPage === 'login') {
      return <LoginPage 
        onLogin={handleLogin} 
        onSwitchToSignup={() => setAuthPage('signup')} 
        onBackToHome={() => setPageState('homepage')}
      />;
    }
    return <SignupPage 
      onSignup={handleSignup} 
      onSwitchToLogin={() => setAuthPage('login')} 
      onBackToHome={() => setPageState('homepage')}
    />;
  }

  if (pageState === 'studio') {
    return (
      <div className="relative min-h-screen bg-gray-900 text-gray-100 font-sans lg:flex">
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}
        <nav className={`fixed top-0 left-0 h-full w-64 bg-gray-800 p-4 border-r border-gray-700 flex flex-col z-20 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 lg:flex-shrink-0`}>
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 2a1 1 0 00-1 1v1h14V3a1 1 0 00-1-1H5zM3 6h14v10a2 2 0 01-2 2H5a2 2 0 01-2-2V6zm9.5 2a.5.5 0 000 1h2a.5.5 0 000-1h-2zM6 9a.5.5 0 01.5-.5h5a.5.5 0 010 1h-5A.5.5 0 016 9zm.5 3.5a.5.5 0 000 1h5a.5.5 0 000-1h-5z" clipRule="evenodd" />
              </svg>
              Creator Studio
            </h1>
          </div>
          <ul className="flex-grow">
            {FEATURES.map((feature) => (
              <li key={feature.id} className="mb-2">
                <button
                  onClick={() => setActiveFeature(feature)}
                  className={`w-full text-left flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                    activeFeature.id === feature.id
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Icon name={feature.icon} className="w-5 h-5 mr-3" />
                  <span className="font-medium">{feature.title}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="border-t border-gray-700 pt-2">
            <button
              onClick={handleLogout}
              className="w-full text-left flex items-center px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
            >
              <Icon name="logout" className="w-5 h-5 mr-3" />
              <span className="font-medium">Logout</span>
            </button>
            <div className="text-xs text-gray-500 mt-2 px-4">Enjoy Ai Today</div>
          </div>
        </nav>
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
           <button 
            className="lg:hidden text-gray-300 hover:text-white mb-4 p-2 -ml-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
          <div>
              <h2 className="text-3xl font-bold mb-2 text-white">{activeFeature.title}</h2>
              <p className="text-gray-400 mb-6">{activeFeature.description}</p>
              <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-4 md:p-6">
                   {renderActiveFeature()}
              </div>
          </div>
        </main>
      </div>
    );
  }

  return null; // Should not be reached
};

export default App;

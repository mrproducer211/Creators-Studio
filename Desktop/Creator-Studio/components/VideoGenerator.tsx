import React from 'react';

export const VideoGenerator: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center h-96 bg-gray-800/50 rounded-lg p-6">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-purple-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.55a2.5 2.5 0 010 4.04l-4.55 2.63M5 10v4a2 2 0 002 2h10a2 2 0 002-2v-4M3 7h18a2 2 0 012 2v8a2 2 0 01-2 2H3a2 2 0 01-2-2V9a2 2 0 012-2z" />
      </svg>
      <h3 className="text-2xl font-bold text-white">Video Generation is Coming Soon!</h3>
    </div>
  );
};
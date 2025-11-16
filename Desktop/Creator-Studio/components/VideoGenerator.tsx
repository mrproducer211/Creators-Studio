import React from 'react';

export const VideoGenerator: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center h-96 bg-gray-800/50 rounded-lg p-6">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-purple-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
      <h3 className="text-2xl font-bold text-white">Video Generation is Coming Soon!</h3>
    </div>
  );
};
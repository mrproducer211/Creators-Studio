
import React from 'react';

interface LoaderProps {
  message?: string;
}

export const Loader: React.FC<LoaderProps> = ({ message }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
    {message && <p className="mt-4 text-lg text-gray-300">{message}</p>}
  </div>
);

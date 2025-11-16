import React, { useState } from 'react';
import { analyzeImage } from '../services/apiClient';
import { fileToBase64 } from '../services/utils';
import { FileUpload } from './shared/FileUpload';
import { Loader } from './shared/Loader';

interface ImageFile {
  file: File;
  base64: string;
  mimeType: string;
  url: string;
}

export const ImageAnalyzer: React.FC = () => {
  const [imageFile, setImageFile] = useState<ImageFile | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('Describe this image in detail.');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeepAnalysis, setIsDeepAnalysis] = useState<boolean>(false);

  const handleFileUpload = async (file: File) => {
    try {
      const { data, mimeType } = await fileToBase64(file);
      setImageFile({ file, base64: data, mimeType, url: URL.createObjectURL(file) });
      setAnalysis(null);
      setError(null);
    } catch (e) {
      console.error(e);
      setError('Failed to load image.');
    }
  };

  const handleAnalyze = async () => {
    if (!imageFile || !prompt) {
      setError('Please upload an image and enter a prompt.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const result = await analyzeImage(imageFile.base64, imageFile.mimeType, prompt, isDeepAnalysis);
      setAnalysis(result);
    } catch (e) {
      console.error(e);
      setError('Failed to analyze image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {!imageFile ? (
        <FileUpload onFileUpload={handleFileUpload} accept="image/*" title="Upload an image to analyze" />
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 flex-grow min-h-0">
          <div className="lg:w-1/2 flex flex-col space-y-4">
            <div className="flex-shrink-0">
              <img src={imageFile.url} alt="To be analyzed" className="w-full rounded-md object-contain max-h-80" />
            </div>
             <button
                onClick={() => { setImageFile(null); setAnalysis(null);}}
                className="w-full bg-gray-600 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
            >
                Use a different image
            </button>
            <div>
              <label htmlFor="analyze-prompt" className="block text-sm font-medium text-gray-300 mb-2">Question</label>
              <textarea
                id="analyze-prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., What is the main subject of this image?"
                className="w-full h-24 p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-purple-500 focus:border-purple-500 text-white resize-none"
              />
            </div>
            <div className="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
              <div>
                <label htmlFor="thinking-mode-toggle" className="font-medium text-white">Deeper Analysis</label>
                <p className="text-xs text-gray-400">Slower, more detailed results for complex images.</p>
              </div>
              <button
                role="switch"
                aria-checked={isDeepAnalysis}
                onClick={() => setIsDeepAnalysis(!isDeepAnalysis)}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500 ${
                  isDeepAnalysis ? 'bg-purple-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${
                    isDeepAnalysis ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <button
              onClick={handleAnalyze}
              disabled={isLoading}
              className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-md hover:bg-purple-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Analyzing...' : 'Analyze Image'}
            </button>
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </div>

          <div className="flex-1 bg-gray-900 rounded-lg p-4 min-h-[300px] lg:min-h-0 overflow-y-auto">
            {isLoading && <Loader message="Thinking..." />}
            {!isLoading && analysis && (
              <div className="prose prose-invert max-w-none text-gray-200 whitespace-pre-wrap">{analysis}</div>
            )}
            {!isLoading && !analysis && (
              <div className="text-center text-gray-500 flex items-center justify-center h-full">
                <p>The analysis will appear here.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
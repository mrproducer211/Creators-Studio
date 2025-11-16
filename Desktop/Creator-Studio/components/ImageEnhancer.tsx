import React, { useState } from 'react';
import { enhanceWithESRGAN } from '../services/apiClient';
import { fileToBase64 } from '../services/utils';
import { FileUpload } from './shared/FileUpload';
import { Loader } from './shared/Loader';

interface ImageFile {
  file: File;
  base64: string;
  mimeType: string;
  url: string;
}

export const ImageEnhancer: React.FC = () => {
  const [sourceImage, setSourceImage] = useState<ImageFile | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    try {
      const { data, mimeType } = await fileToBase64(file);
      setSourceImage({ file, base64: data, mimeType, url: URL.createObjectURL(file) });
      setEnhancedImage(null);
      setError(null);
    } catch (e) {
      console.error(e);
      setError('Failed to load image.');
    }
  };

  const handleEnhance = async () => {
    if (!sourceImage) {
      setError('Please upload an image to enhance.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setEnhancedImage(null);
    try {
      const resultUrl = await enhanceWithESRGAN(sourceImage.base64);
      setEnhancedImage(resultUrl);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'An unknown error occurred during enhancement.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (imageUrl: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `enhanced-${sourceImage?.file.name || 'image'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-full flex flex-col">
      {!sourceImage ? (
        <FileUpload onFileUpload={handleFileUpload} accept="image/*" title="Upload an image to enhance" />
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 flex-grow min-h-0">
          <div className="lg:w-1/3 flex flex-col space-y-4">
            <button
              onClick={handleEnhance}
              disabled={isLoading}
              className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-md hover:bg-purple-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Enhancing...' : 'Enhance Image'}
            </button>
            <button
                onClick={() => { setSourceImage(null); setEnhancedImage(null);}}
                className="w-full bg-gray-600 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-700 transition-colors mt-auto"
            >
                Use a different image
            </button>
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </div>

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 bg-gray-900 rounded-lg p-4 min-h-[400px]">
             <div className="flex flex-col items-center justify-center">
                <h4 className="text-lg font-semibold mb-2 text-gray-400">Original</h4>
                <div className="w-full h-full bg-gray-800 rounded-md flex items-center justify-center overflow-hidden">
                    <img src={sourceImage.url} alt="Source" className="max-w-full max-h-full object-contain" />
                </div>
            </div>
             <div className="flex flex-col items-center justify-center">
                <h4 className="text-lg font-semibold mb-2 text-gray-400">Enhanced</h4>
                <div className="w-full h-full bg-gray-800 rounded-md flex items-center justify-center overflow-hidden relative group">
                    {isLoading && <Loader message="Applying AI magic..." />}
                    {!isLoading && enhancedImage && (
                        <>
                            <img src={enhancedImage} alt="Enhanced" className="max-w-full max-h-full object-contain" />
                            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleDownload(enhancedImage)}
                                    className="bg-purple-600 text-white font-bold py-2 px-4 rounded-md hover:bg-purple-700 transition-colors flex items-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                    Download
                                </button>
                            </div>
                        </>
                    )}
                    {!isLoading && !enhancedImage && (
                        <div className="text-center text-gray-500">
                            <p>The enhanced result will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
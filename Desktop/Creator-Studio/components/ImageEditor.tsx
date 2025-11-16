import React, { useState } from 'react';
import { editImage } from '../services/apiClient';
import { fileToBase64 } from '../services/utils';
import { FileUpload } from './shared/FileUpload';
import { Loader } from './shared/Loader';

interface ImageFile {
  file: File;
  base64: string;
  mimeType: string;
  url: string;
}

export const ImageEditor: React.FC = () => {
  const [sourceImage, setSourceImage] = useState<ImageFile | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('Add a retro filter');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    try {
      const { data, mimeType } = await fileToBase64(file);
      setSourceImage({ file, base64: data, mimeType, url: URL.createObjectURL(file) });
      setEditedImage(null);
      setError(null);
    } catch (e) {
      console.error(e);
      setError('Failed to load image.');
    }
  };

  const handlePromptEdit = async () => {
    if (!sourceImage || !prompt) {
      setError('Please upload an image and enter a prompt.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setEditedImage(null);
    try {
      const resultUrl = await editImage(sourceImage.base64, sourceImage.mimeType, prompt);
      setEditedImage(resultUrl);
    } catch (e) {
      console.error(e);
      setError('Failed to edit image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {!sourceImage ? (
        <FileUpload onFileUpload={handleFileUpload} accept="image/*" title="Upload an image to edit" />
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 flex-grow min-h-0">
          <div className="lg:w-1/3 flex flex-col space-y-4">
            <div>
              <label htmlFor="edit-prompt" className="block text-sm font-medium text-gray-300 mb-2">Editing Prompt</label>
              <textarea
                id="edit-prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Make the background blurry"
                className="w-full h-24 p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-purple-500 focus:border-purple-500 text-white resize-none"
              />
            </div>
            <button
              onClick={handlePromptEdit}
              disabled={isLoading}
              className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-md hover:bg-purple-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Applying...' : 'Apply Edit'}
            </button>
            <button
                onClick={() => { setSourceImage(null); setEditedImage(null);}}
                className="w-full bg-gray-600 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-700 transition-colors mt-auto"
            >
                Use a different image
            </button>
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </div>

          <div className="flex-1 bg-gray-900 rounded-lg flex items-center justify-center p-4 min-h-[300px] lg:min-h-0">
            {isLoading && <Loader message="Applying your creative edits..." />}
            
            {!isLoading && editedImage && (
              <img src={editedImage} alt="Edited" className="max-w-full max-h-full object-contain rounded-md" />
            )}
            
            {!isLoading && !editedImage && sourceImage && (
                <img src={sourceImage.url} alt="Source" className="max-w-full max-h-full object-contain rounded-md select-none" />
            )}
            
            {!isLoading && !editedImage && !sourceImage && (
              <div className="text-center text-gray-500">
                <p>Your edited image will appear here.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

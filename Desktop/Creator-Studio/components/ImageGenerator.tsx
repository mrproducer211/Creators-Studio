import React, { useState, useEffect } from 'react';
import { generateImage } from '../services/apiClient';
import { AspectRatio, ImageResolution, ImageStyle, ImageModel, ConcreteImageModel, ImageGenerationHistoryEntry } from '../types';
import { IMAGE_ASPECT_RATIOS, IMAGE_RESOLUTIONS, IMAGE_STYLES, IMAGE_MODELS } from '../constants';
import { Loader } from './shared/Loader';

const HISTORY_KEY = 'gemini-creator-studio-image-history';

export const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('A photorealistic image of a futuristic city skyline at sunset, with flying cars.');
  const [selectedModel, setSelectedModel] = useState<ImageModel>('auto');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [resolution, setResolution] = useState<ImageResolution>('1080p');
  const [selectedStyles, setSelectedStyles] = useState<ImageStyle[]>([]);
  const [numberOfImages, setNumberOfImages] = useState<number>(1);
  const [generatedImages, setGeneratedImages] = useState<string[] | null>(null);
  const [history, setHistory] = useState<ImageGenerationHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadOptionsOpen, setDownloadOptionsOpen] = useState<number | null>(null);

  useEffect(() => {
    try {
        const storedHistory = localStorage.getItem(HISTORY_KEY);
        if (storedHistory) {
            setHistory(JSON.parse(storedHistory));
        }
    } catch (error) {
        console.error("Failed to load image generation history:", error);
    }
  }, []);

  useEffect(() => {
    try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
        console.error("Failed to save image generation history:", error);
    }
  }, [history]);

  const handleStyleToggle = (style: ImageStyle) => {
    setSelectedStyles(prev =>
      prev.includes(style)
        ? prev.filter(s => s !== style)
        : [...prev, style]
    );
  };

  const handleGenerate = async () => {
    if (!prompt) {
      setError('Please enter a prompt.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedImages(null);
    try {
      const modelToUse: ConcreteImageModel = selectedModel === 'auto' ? 'imagen-4.0-generate-001' : selectedModel;
      const imagesToGenerate = modelToUse === 'imagen-4.0-generate-001' ? numberOfImages : 1;
      
      const imageUrls = await generateImage(prompt, aspectRatio, resolution, selectedStyles, modelToUse, imagesToGenerate);
      setGeneratedImages(imageUrls);

      const newHistoryEntry: ImageGenerationHistoryEntry = {
          id: `gen-${Date.now()}`,
          prompt,
          model: modelToUse,
          aspectRatio,
          resolution,
          styles: selectedStyles,
          numberOfImages: imagesToGenerate,
          imageUrls,
          timestamp: new Date().toISOString(),
      };
      setHistory(prev => [newHistoryEntry, ...prev]);

    } catch (e) {
      console.error(e);
      setError('Failed to generate image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (imageUrl: string, index: number, format: 'jpeg' | 'png') => {
    const sanitizedPrompt = prompt.substring(0, 20).replace(/\s/g, '_');
    const filename = `generated-image-${sanitizedPrompt}-${index + 1}.${format}`;

    if (format === 'jpeg') {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                setError('Could not get canvas context to convert image.');
                return;
            }
            ctx.drawImage(img, 0, 0);
            const pngUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = pngUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };
        img.onerror = () => {
            setError('Failed to load image for PNG conversion. Please try downloading as JPEG.');
        };
        img.src = imageUrl;
    }
    setDownloadOptionsOpen(null);
  };

  const isImagenModel = selectedModel === 'imagen-4.0-generate-001' || selectedModel === 'auto';
  
  const modelDescription = selectedModel === 'auto' 
    ? IMAGE_MODELS.find(m => m.id === 'imagen-4.0-generate-001')?.description
    : IMAGE_MODELS.find(m => m.id === selectedModel)?.description;

  return (
    <div>
        <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-1/3 flex flex-col space-y-4">
                {/* Controls */}
                <div className="overflow-y-auto pr-2 space-y-4">
                    <div>
                        <label htmlFor="model-select" className="block text-sm font-medium text-gray-300 mb-2">Image Model</label>
                        <select
                            id="model-select"
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value as ImageModel)}
                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-purple-500 focus:border-purple-500 text-white"
                        >
                            <option value="auto">Auto (Imagen 4)</option>
                            {IMAGE_MODELS.map((model) => (
                            <option key={model.id} value={model.id}>
                                {model.name}
                            </option>
                            ))}
                        </select>
                        {modelDescription && (
                            <p className="text-xs text-gray-400 mt-2">{modelDescription}</p>
                        )}
                    </div>
                    <div>
                        <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">Prompt</label>
                        <textarea
                            id="prompt"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., A cute cat wearing a wizard hat"
                            className="w-full h-24 p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-purple-500 focus:border-purple-500 text-white resize-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Styles</label>
                        <div className="flex flex-wrap gap-2">
                            {IMAGE_STYLES.map((style) => (
                            <button
                                key={style}
                                onClick={() => handleStyleToggle(style)}
                                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                                selectedStyles.includes(style) ? 'bg-purple-600 text-white' : 'bg-gray-700 hover:bg-gray-600'
                                }`}
                            >
                                {style}
                            </button>
                            ))}
                        </div>
                    </div>
                    {isImagenModel && (
                        <>
                             <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Number of Images</label>
                                <div className="flex items-center space-x-2">
                                    {[1, 2, 3, 4].map(num => (
                                        <button
                                            key={num}
                                            onClick={() => setNumberOfImages(num)}
                                            className={`w-12 h-10 flex items-center justify-center text-sm rounded-md transition-colors ${
                                                numberOfImages === num ? 'bg-purple-600 text-white' : 'bg-gray-700 hover:bg-gray-600'
                                            }`}
                                        >
                                            {num}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Aspect Ratio</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {IMAGE_ASPECT_RATIOS.map((ratio) => (
                                    <button
                                        key={ratio}
                                        onClick={() => setAspectRatio(ratio)}
                                        className={`px-4 py-2 text-sm rounded-md transition-colors ${
                                        aspectRatio === ratio ? 'bg-purple-600 text-white' : 'bg-gray-700 hover:bg-gray-600'
                                        }`}
                                    >
                                        {ratio}
                                    </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Resolution</label>
                                <div className="flex flex-wrap gap-2">
                                    {IMAGE_RESOLUTIONS.map((res) => (
                                    <button
                                        key={res}
                                        onClick={() => setResolution(res)}
                                        className={`px-4 py-2 text-sm rounded-md transition-colors ${
                                        resolution === res ? 'bg-purple-600 text-white' : 'bg-gray-700 hover:bg-gray-600'
                                        }`}
                                    >
                                        {res}
                                    </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
                 <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-md hover:bg-purple-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors mt-auto"
                >
                    {isLoading ? 'Generating...' : `Generate ${isImagenModel ? numberOfImages : 1} Image${isImagenModel && numberOfImages > 1 ? 's' : ''}`}
                </button>
                {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </div>

            <div className="flex-1 bg-gray-900 rounded-lg flex items-center justify-center p-4 min-h-[400px] lg:min-h-0">
                {isLoading && <Loader message="Creating your masterpiece(s)..." />}
                {!isLoading && generatedImages && generatedImages.length > 0 && (
                <div className={`grid gap-4 w-full h-full ${generatedImages.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {generatedImages.map((imageUrl, index) => (
                    <div key={index} className="relative group bg-gray-800 rounded-md flex items-center justify-center">
                        <img src={imageUrl} alt={`Generated ${index + 1}`} className="max-w-full max-h-full object-contain rounded-md" />
                        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                            <div className="relative">
                                <button
                                    onClick={() => setDownloadOptionsOpen(downloadOptionsOpen === index ? null : index)}
                                    className="bg-purple-600 text-white font-bold py-2 px-4 rounded-md hover:bg-purple-700 transition-colors flex items-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                    Download
                                </button>
                                {downloadOptionsOpen === index && (
                                <div className="absolute bottom-full mb-2 w-full bg-gray-700 rounded-md shadow-lg z-10 overflow-hidden">
                                    <button
                                        onClick={() => handleDownload(imageUrl, index, 'jpeg')}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-purple-600"
                                    >
                                    as JPEG
                                    </button>
                                    <button
                                        onClick={() => handleDownload(imageUrl, index, 'png')}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-purple-600"
                                    >
                                    as PNG
                                    </button>
                                </div>
                                )}
                            </div>
                        </div>
                    </div>
                    ))}
                </div>
                )}
                {!isLoading && (!generatedImages || generatedImages.length === 0) && (
                <div className="text-center text-gray-500">
                    <p>Your generated images will appear here.</p>
                </div>
                )}
            </div>
        </div>

        <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Generation History</h3>
                {history.length > 0 && (
                    <button
                        onClick={() => setHistory([])}
                        className="text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1 rounded-md transition-colors"
                    >
                        Clear History
                    </button>
                )}
            </div>
            {history.length === 0 ? (
                <div className="bg-gray-800/50 rounded-lg p-6 text-center text-gray-500">
                    <p>Your past generations will be saved here.</p>
                </div>
            ) : (
                <div className="flex overflow-x-auto gap-4 pb-4">
                    {history.map(entry => (
                        <div key={entry.id} className="bg-gray-700 p-3 rounded-lg flex-shrink-0 w-64 cursor-pointer hover:bg-gray-600 transition-colors"
                            onClick={() => {
                                setPrompt(entry.prompt);
                                setSelectedModel(entry.model);
                                setAspectRatio(entry.aspectRatio);
                                setResolution(entry.resolution);
                                setSelectedStyles(entry.styles);
                                setNumberOfImages(entry.numberOfImages);
                                setGeneratedImages(entry.imageUrls);
                            }}
                        >
                            <div className="grid grid-cols-2 gap-1 mb-2">
                                {entry.imageUrls.slice(0, 4).map((url, i) => (
                                    <img key={i} src={url} alt="" className="w-full h-20 object-cover rounded" />
                                ))}
                            </div>
                            <p className="text-sm font-semibold truncate" title={entry.prompt}>{entry.prompt}</p>
                            <p className="text-xs text-gray-400 mt-1">{new Date(entry.timestamp).toLocaleString()}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );
};
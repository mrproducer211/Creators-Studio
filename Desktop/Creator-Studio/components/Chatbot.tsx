import React, { useState, useEffect, useRef } from 'react';
import { generatePromptOptions, polishPrompt } from '../services/apiClient';
import { ChatMessage } from '../types';
import { CAMERA_ANGLES, PROMPT_BOT_QUESTIONS } from '../constants';
import { Loader } from './shared/Loader';


const defaultMessage: ChatMessage = {
  sender: 'ai' as const,
  text: "Hello! Describe an idea, and I'll help you craft a detailed prompt for generating amazing visuals."
};

export const PromptBot: React.FC = () => {
  const [step, setStep] = useState(0); // 0: initial, 1-4: questions, 5: generating, 6: done
  const [promptDetails, setPromptDetails] = useState<Record<string, string>>({});
  const [currentOptions, setCurrentOptions] = useState<string[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([defaultMessage]);
  const [userInput, setUserInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedMessageIndex, setCopiedMessageIndex] = useState<number | null>(null);
  const [cameraAngle, setCameraAngle] = useState<string>(CAMERA_ANGLES[0]);
  const [isCustomInput, setIsCustomInput] = useState<boolean>(false);
  const [customAnswer, setCustomAnswer] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentOptions]);

  const handleStartPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const initialSubject = userInput;
    setMessages([{ sender: 'user', text: initialSubject }]);
    setPromptDetails({ subject: initialSubject });
    setUserInput('');
    setStep(1);
  };

  const handleOptionSelect = (option: string) => {
    setMessages(prev => [...prev, { sender: 'user', text: option }]);
    const currentQuestionKey = PROMPT_BOT_QUESTIONS[step - 1].key;
    const newPromptDetails = { ...promptDetails, [currentQuestionKey]: option };
    setPromptDetails(newPromptDetails);
    setStep(prev => prev + 1);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAnswer.trim()) return;

    handleOptionSelect(customAnswer); // Re-use the option selection logic
    
    // Reset custom input state
    setIsCustomInput(false);
    setCustomAnswer('');
  };

  useEffect(() => {
    const fetchOptions = async () => {
      setIsLoadingOptions(true);
      setCurrentOptions([]);
      const questionInfo = PROMPT_BOT_QUESTIONS[step - 1];
      const context = Object.values(promptDetails).join(', ');
      
      const aiQuestion = questionInfo.question(promptDetails.subject);
      setMessages(prev => [...prev, { sender: 'ai', text: aiQuestion }]);

      try {
        const options = await generatePromptOptions(context, questionInfo.prompt(context));
        setCurrentOptions(options);
      } catch (error) {
          console.error("Failed to fetch prompt options", error);
          setMessages(prev => [...prev, {sender: 'ai', text: "I had trouble thinking of options. Please try starting over."}]);
      } finally {
        setIsLoadingOptions(false);
      }
    };

    const generateFinalPrompt = async () => {
        setIsLoading(true);
        setMessages(prev => [...prev, { sender: 'ai', text: 'Perfect! Let me craft that into a detailed prompt for you...' }]);
        
        try {
            const finalPrompt = await polishPrompt(promptDetails, cameraAngle);
            setMessages(prev => [...prev, { sender: 'ai', text: finalPrompt }]);
        } catch (error) {
            console.error("Failed to polish prompt", error);
            setMessages(prev => [...prev, { sender: 'ai', text: "Sorry, I couldn't generate the final prompt. Please try again." }]);
        } finally {
            setIsLoading(false);
            setStep(6);
        }
    };

    if (step > 0 && step <= PROMPT_BOT_QUESTIONS.length) {
      fetchOptions();
    } else if (step === PROMPT_BOT_QUESTIONS.length + 1) {
      generateFinalPrompt();
    }
  }, [step]);
  
  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageIndex(index);
    setTimeout(() => {
        setCopiedMessageIndex(null);
    }, 2000);
  };

  const handleStartOver = () => {
    setStep(0);
    setPromptDetails({});
    setCurrentOptions([]);
    setMessages([defaultMessage]);
    setIsLoading(false);
    setIsLoadingOptions(false);
    setIsCustomInput(false);
    setCustomAnswer('');
  };
  
  const isCopyable = (msg: ChatMessage) => {
      return msg.sender === 'ai' && step === 6 && !isLoading;
  }

  return (
    <div className="h-full flex flex-col">
       <div className="p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold">Prompt Bot</h3>
          <p className="text-sm text-gray-400">Improve your Prompting Skill</p>
      </div>
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <div
              className={`max-w-xl p-3 rounded-lg shadow-md ${
                msg.sender === 'user' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-200'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
            {isCopyable(msg) && (
                <button 
                    onClick={() => handleCopy(msg.text, index)}
                    className="mt-2 flex items-center gap-2 text-xs bg-gray-600 hover:bg-gray-500 text-gray-300 px-3 py-1 rounded-md transition-colors"
                >
                    {copiedMessageIndex === index ? (
                        <><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>Copied!</>
                    ) : (
                        <><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" /><path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h6a2 2 0 00-2-2H5z" /></svg>Copy Prompt</>
                    )}
                </button>
            )}
          </div>
        ))}
        {isLoading && (
            <div className="flex justify-start">
                <div className="max-w-lg p-3 rounded-lg bg-gray-700 text-gray-200">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-75"></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-150"></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-300"></div>
                    </div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-700">
        {step > 0 && step < 5 && (
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Camera Angle</label>
                <div className="flex flex-wrap gap-2">
                    {CAMERA_ANGLES.map((angle) => (
                    <button
                        key={angle}
                        onClick={() => setCameraAngle(angle)}
                        className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                        cameraAngle === angle ? 'bg-purple-600 text-white' : 'bg-gray-700 hover:bg-gray-600'
                        }`}
                    >
                        {angle}
                    </button>
                    ))}
                </div>
            </div>
        )}

        {step === 0 && (
            <form onSubmit={handleStartPrompt} className="flex items-center space-x-2">
                <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Start with a simple idea (e.g., 'a dog')..."
                    className="flex-grow p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-white"
                />
                <button type="submit" disabled={!userInput.trim()} className="bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                </button>
            </form>
        )}

        {(step >= 1 && step <= 4) && (
            <div>
                {isLoadingOptions && <Loader message="Coming up with some ideas..." />}
                
                {!isLoadingOptions && !isCustomInput && currentOptions.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                        {currentOptions.map((option, index) => (
                        <button key={index} onClick={() => handleOptionSelect(option)} className="px-4 py-2 text-sm font-medium bg-gray-700 hover:bg-purple-600 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105">
                            {option}
                        </button>
                        ))}
                         <button onClick={() => setIsCustomInput(true)} className="px-4 py-2 text-sm font-medium bg-gray-600 hover:bg-purple-600 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105">
                            Custom...
                        </button>
                    </div>
                )}

                {isCustomInput && (
                    <form onSubmit={handleCustomSubmit} className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={customAnswer}
                            onChange={(e) => setCustomAnswer(e.target.value)}
                            placeholder="Type your own response..."
                            className="flex-grow p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-white"
                            autoFocus
                        />
                        <button type="submit" disabled={!customAnswer.trim()} className="bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                        </button>
                         <button type="button" onClick={() => setIsCustomInput(false)} className="bg-gray-600 text-white p-3 rounded-lg hover:bg-gray-700 transition-colors" aria-label="Cancel custom input">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </form>
                )}
            </div>
        )}
        
        {step === 6 && (
            <button onClick={handleStartOver} className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-md hover:bg-purple-700 disabled:bg-gray-500 transition-colors">
                Start New Prompt
            </button>
        )}
      </div>
    </div>
  );
};
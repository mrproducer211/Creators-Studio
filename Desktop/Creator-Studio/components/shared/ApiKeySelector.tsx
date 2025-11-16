
import React from 'react';

interface ApiKeySelectorProps {
    onKeySelected: () => void;
}

export const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onKeySelected }) => {
    const handleSelectKey = async () => {
        try {
            await window.aistudio.openSelectKey();
            // Assume success after the dialog opens to handle race conditions.
            onKeySelected();
        } catch (error) {
            console.error("Error opening API key selection:", error);
        }
    };

    return (
        <div className="bg-gray-700 p-6 rounded-lg text-center shadow-lg">
            <h3 className="text-xl font-bold mb-2 text-white">API Key Required</h3>
            <p className="mb-4 text-gray-300">
                To generate videos with Veo, you need to select an API key. This will be used for billing purposes.
            </p>
            <button
                onClick={handleSelectKey}
                className="bg-purple-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-purple-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
            >
                Select API Key
            </button>
            <p className="mt-4 text-sm text-gray-400">
                For more information, please see the{' '}
                <a
                    href="https://ai.google.dev/gemini-api/docs/billing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:underline"
                >
                    billing documentation
                </a>.
            </p>
        </div>
    );
};

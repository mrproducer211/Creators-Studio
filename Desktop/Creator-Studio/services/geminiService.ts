import { GoogleGenAI, Chat, Modality, GenerateContentResponse, Operation, HarmCategory, HarmBlockThreshold, Type } from "@google/genai";
import { AspectRatio, VideoAspectRatio, VideoResolution, ImageResolution, ImageStyle, ConcreteImageModel } from '../types';
import { CAMERA_TYPES } from '../constants';

let ai: GoogleGenAI;

const getAi = () => {
  if (!ai) {
    // Use GEMINI_API_KEY from environment (set in Netlify)
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
];

export const generateImage = async (
    prompt: string, 
    aspectRatio: AspectRatio, 
    resolution: ImageResolution, 
    styles: ImageStyle[],
    model: ConcreteImageModel,
    numberOfImages: number
): Promise<string[]> => {
  const ai = getAi();
  
  let finalPrompt = prompt;
  if (styles.length > 0) {
      finalPrompt += `, in the style of ${styles.join(', ')}`;
  }

  if (model === 'imagen-4.0-generate-001') {
    switch (resolution) {
      case '480p':
        break;
      case '720p':
        finalPrompt += ', 720p, HD, high definition';
        break;
      case '1080p':
        finalPrompt += ', 1080p, Full HD, high resolution, detailed';
        break;
      case '2K':
        finalPrompt += ', 2K resolution, QHD, highly detailed, professional quality';
        break;
      case '4K':
        finalPrompt += ', 4K, ultra high resolution, professional quality, sharp focus';
        break;
    }
    
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: finalPrompt,
      config: {
        numberOfImages,
        outputMimeType: 'image/jpeg',
        aspectRatio,
      },
      safetySettings,
    });
  
    if (!response.generatedImages || response.generatedImages.length === 0) {
      throw new Error("Image generation failed. The model did not return any images, possibly due to safety filters or an internal error.");
    }
    
    return response.generatedImages.map(img => `data:image/jpeg;base64,${img.image.imageBytes}`);
  } else if (model === 'gemini-2.5-flash-image') {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [{ text: finalPrompt }],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
        safetySettings,
    });

    if (!response.candidates || response.candidates.length === 0) {
        throw new Error("Image generation failed. The model did not return a response, possibly due to safety filters.");
    }

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            return [`data:${part.inlineData.mimeType};base64,${base64ImageBytes}`];
        }
    }
    throw new Error("No image was generated.");
  }

  throw new Error(`Unsupported image model: ${model}`);
};

export const editImage = async (base64Image: string, mimeType: string, prompt: string): Promise<string> => {
    const ai = getAi();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                { inlineData: { data: base64Image, mimeType } },
                { text: prompt },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
        safetySettings,
    });

    if (!response.candidates || response.candidates.length === 0) {
        throw new Error("Image editing failed. The model did not return a response, possibly due to safety filters.");
    }

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
        }
    }
    throw new Error("No image was generated.");
};

export const enhanceImage = async (base64Image: string, mimeType: string, targetResolution: ImageResolution): Promise<string> => {
    const ai = getAi();

    let enhancementPrompt = `
Your role is an expert digital image processing AI specializing in super-resolution. Your task is to upscale the provided image to a ${targetResolution} resolution. The result must be a masterpiece of clarity and detail.

**Core Directives:**

1.  **Primary Goal: Tack-Sharp Output:** The final image must be exceptionally sharp, crisp, and clear. Eliminate all forms of blur, haziness, and digital compression artifacts. Details, edges, and textures must be perfectly defined and resolved.
2.  **Authenticity is Paramount:** You must NOT invent, hallucinate, or alter the content of the image. Faithfully reconstruct and enhance only the details present in the original source. The identity and structure of objects, faces, and text are inviolable.
3.  **Texture and Micro-Detail Fidelity:**
    *   Preserve and enhance high-frequency details and micro-textures. Avoid creating a smooth, "airbrushed," or "painterly" effect. The output should look natural, not artificial.
    *   For human subjects, ensure natural skin texture is maintained. Pores, fine lines, and individual hair strands must be rendered realistically.
    *   For artwork, preserve the original artist's style, including brushwork and canvas/paper texture.
4.  **Artifact and Noise Removal:** Meticulously remove digital noise (e.g., JPEG artifacts, sensor noise) using advanced de-noising techniques without sacrificing critical image detail.
5.  **Subtle Corrections Only:** Apply minimal and subtle improvements to lighting, contrast, and color balance only if it is absolutely essential for achieving photorealism. Respect the original color palette.

**Output Mandate:**

The final output must be a high-resolution, photorealistic, and artifact-free upscale. It must withstand intense scrutiny and high levels of magnification (200% to 500%), appearing sharp and detailed, NOT blurry, smudged, or plasticky.
    `;
    
    if (targetResolution === '8K') {
        enhancementPrompt += `
**Critical 8K Upscaling Protocol - MAXIMUM FIDELITY**

This is an 8K (7680x4320) super-resolution task. Standard upscaling is insufficient. Execute a professional-grade, multi-stage enhancement process with zero tolerance for softness or artifacts.

*   **De-Blurring & Sharpening:** Apply a deconvolution sharpening algorithm to counteract any source image softness. The goal is not just sharpness, but *acutance*—the perceived sharpness of edges. All edges must be crisp and well-defined without haloing.
*   **Detail Reconstruction:** Focus on reconstructing and generating high-frequency details. This includes textures like fabric weave, wood grain, skin pores, and fine lines in architecture. The result must not look upscaled; it must look like it was captured natively at 8K.
*   **Noise & Artifact Elimination:** Perform a meticulous analysis and removal of any compression artifacts (JPEG blocking) or sensor noise. The final image must have a clean, smooth tonal transition in all areas.
*   **Zoom Scrutiny Mandate:** The primary success metric is clarity under magnification. The output image **MUST** be tack-sharp, clear, and detailed when viewed at 200% magnification. Any visible blur, pixelation, or smudging at this zoom level is an absolute failure of the task.
*   **Final Output Standard:** The deliverable must be an image of professional photographic quality, suitable for high-end digital displays and large-format printing. Do not compromise.
`;
    }


    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                { inlineData: { data: base64Image, mimeType } },
                { text: enhancementPrompt },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
        safetySettings,
    });

    if (!response.candidates || response.candidates.length === 0) {
        throw new Error("Image enhancement failed. The model did not return a response, possibly due to safety filters.");
    }

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
        }
    }
    throw new Error("No enhanced image was generated.");
};

export const enhanceWithESRGAN = async (base64Image: string): Promise<string> => {
  // NOTE: This points to a deployed ESRGAN backend service.
  const API_URL = 'https://mrproducer211-vdm-upscale.hf.space/enhance';

  // The backend expects the raw base64 string, not the data URL prefix.
  const rawBase64 = base64Image.split(',')[1] || base64Image;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image_base64: rawBase64 }),
    });

    if (!response.ok) {
      let errorBody = 'Unknown server error';
      try {
        const errorData = await response.json();
        errorBody = errorData.detail || JSON.stringify(errorData);
      } catch (e) {
        errorBody = await response.text();
      }
      throw new Error(`ESRGAN API request failed with status ${response.status}: ${errorBody}`);
    }

    const result = await response.json();
    if (!result.enhanced_image_base64 || !result.mime_type) {
        throw new Error('Invalid response from ESRGAN API.');
    }
    
    return `data:${result.mime_type};base64,${result.enhanced_image_base64}`;
  } catch (error) {
    console.error("Error calling ESRGAN enhancement service:", error);
    throw new Error('The custom enhancement service is not available or failed to process the image. Please ensure the backend server is running.');
  }
};


export const generateVideo = async (prompt: string, aspectRatio: VideoAspectRatio, resolution: VideoResolution, image?: { data: string; mimeType: string }): Promise<Operation> => {
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    const ai = new GoogleGenAI({ apiKey }); // Re-init to get latest key
    
    let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt,
        image: image ? { imageBytes: image.data, mimeType: image.mimeType } : undefined,
        config: {
            numberOfVideos: 1,
            resolution,
            aspectRatio
        },
    });
    return operation;
};

export const checkVideoOperation = async (operation: Operation): Promise<Operation> => {
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    const ai = new GoogleGenAI({ apiKey }); // Re-init to get latest key
    return await ai.operations.getVideosOperation({ operation });
}

export const analyzeImage = async (base64Image: string, mimeType: string, prompt: string, isDeepAnalysis: boolean): Promise<string> => {
  const ai = getAi();
  const imagePart = {
    inlineData: {
      mimeType,
      data: base64Image,
    },
  };
  const textPart = {
    text: prompt,
  };
  
  const model = isDeepAnalysis ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
  const config = isDeepAnalysis ? { thinkingConfig: { thinkingBudget: 32768 } } : {};

  const response = await ai.models.generateContent({
    model,
    contents: { parts: [imagePart, textPart] },
    config,
    safetySettings,
  });

  return response.text;
};

export const generatePromptOptions = async (context: string, promptForOptions: string): Promise<string[]> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `${promptForOptions} Return the response as a JSON object with a single key "options" which is an array of 5 strings.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          options: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
            },
          },
        },
        required: ['options'],
      },
    },
    safetySettings,
  });

  try {
    const jsonStr = response.text.trim();
    const parsed = JSON.parse(jsonStr);
    if (parsed.options && Array.isArray(parsed.options)) {
        return parsed.options.slice(0, 5);
    }
    return [];
  } catch (e) {
    console.error("Failed to parse options from Gemini:", e);
    return ["An interesting choice", "A classic option", "Something unexpected", "A vibrant setting", "A minimalist approach"];
  }
};


export const polishPrompt = async (promptDetails: Record<string, string>, cameraAngle: string): Promise<string> => {
    const ai = getAi();
    const context = `
        Subject: ${promptDetails.subject}
        Action: ${promptDetails.action}
        Setting: ${promptDetails.setting}
        Style: ${promptDetails.style}
        Mood/Lighting: ${promptDetails.mood}
        Camera Angle: ${cameraAngle}
    `;

    const randomCameraType = CAMERA_TYPES[Math.floor(Math.random() * CAMERA_TYPES.length)];

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: `Based on the following details, craft a single, rich, detailed paragraph to be used as a prompt for an image generation model. Combine the elements smoothly and creatively. End the entire prompt with the phrase: ", ${randomCameraType}". Do not return anything else except the prompt itself, with no extra formatting or quotation marks. \n\n${context}`,
        safetySettings,
    });

    return response.text.trim();
};
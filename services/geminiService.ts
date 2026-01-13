import { GoogleGenerativeAI } from '@google/generative-ai';

// Gemini API Key from environment variables
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(API_KEY);

export interface ChatMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
}

export const getGeminiResponse = async (
    messages: ChatMessage[],
    systemInstruction: string,
    temperature: number = 0.2
) => {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: systemInstruction
        });

        const chat = model.startChat({
            history: messages.slice(0, -1), // Everything except the last message
            generationConfig: {
                temperature: temperature,
                maxOutputTokens: 2048,
            },
        });

        const lastMessage = messages[messages.length - 1];
        const result = await chat.sendMessage(lastMessage.parts[0].text);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw error;
    }
};

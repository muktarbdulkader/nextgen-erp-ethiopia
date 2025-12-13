import { Message } from "../types";
import { fetchClient } from './api'; // Use existing api helper

/**
 * Sends a message to the backend AI endpoint.
 * Uses public endpoint for guests, authenticated endpoint for logged-in users.
 */
export const sendMessageToGemini = async (
  message: string, 
  history: Message[], 
  attachment?: { mimeType: string, data: string },
  language: 'EN' | 'AM' | 'OR' = 'EN'
): Promise<string> => {
  try {
    // Check if user is logged in
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    
    // Use public endpoint if not logged in, authenticated endpoint if logged in
    const endpoint = token ? '/ai/chat' : '/ai/public-chat';
    
    const response = await fetchClient<{ response: string }>(endpoint, {
        method: 'POST',
        body: JSON.stringify({
            message,
            history: history.filter(h => h.role !== 'model' || h.content !== ''), // Clean history
            language,
            attachment // Backend can handle attachment logic if expanded
        })
    });
    
    return response.response;

  } catch (error) {
    console.error("AI Service Error:", error);
    
    // Check if it's an auth error
    if (error instanceof Error && error.message.includes('Authentication required')) {
      return "Please sign up or log in to continue chatting with unlimited access to Mukti AI.";
    }
    
    return "I'm having trouble connecting to the server. Please try again.";
  }
};

// For streaming, we temporarily fallback to non-streaming for the backend implementation 
// to keep the architecture simple for this iteration.
export const sendMessageToGeminiStream = async function* (
  message: string, 
  history: Message[], 
  attachment?: { mimeType: string; data: string },
  language: 'EN' | 'AM' | 'OR' = 'EN',
  signal?: AbortSignal
): AsyncGenerator<string, void, unknown> {
  try {
    // Simulate stream for UI compatibility, but fetch once
    const responseText = await sendMessageToGemini(message, history, attachment, language);
    
    // Split into chunks to simulate typing effect
    const chunkSize = 10;
    for (let i = 0; i < responseText.length; i += chunkSize) {
      // Check if the request was aborted
      if (signal?.aborted) {
        throw new Error('Request was cancelled');
      }
      
      yield responseText.substring(i, i + chunkSize);
      await new Promise(r => setTimeout(r, 10)); // Tiny delay for effect
    }
  } catch (error) {
    console.error('Error in sendMessageToGeminiStream:', error);
    if (error instanceof Error) {
      yield `Error: ${error.message}`;
    } else {
      yield 'An unknown error occurred while processing your request.';
    }
  }
};
import { GoogleGenAI } from "@google/genai";
import { Message } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function* streamChat(messages: Message[]) {
  const history = messages.slice(0, -1).map(m => ({
    role: m.role,
    parts: [{ text: m.content }]
  }));
  
  const lastMessage = messages[messages.length - 1].content;

  try {
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: "Kamu adalah sixverseAI, asisten pribadi yang cerdas. Selalu gunakan Bahasa Indonesia. Selalu panggil pengguna dengan sebutan 'Zacky'. Bersikaplah ramah dan membantu.",
      },
      history: history,
    });

    const result = await chat.sendMessageStream({ message: lastMessage });

    for await (const chunk of result) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}

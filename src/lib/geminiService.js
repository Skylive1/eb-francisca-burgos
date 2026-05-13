import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Inicializamos la IA de forma perezosa (lazy) para evitar errores de importación
let genAI = null;
const getGenAI = () => {
  if (!genAI) {
    if (!API_KEY) {
      console.warn("⚠️ [Gemini] VITE_GEMINI_API_KEY no detectada. Verifica tu archivo .env.local y reinicia el servidor.");
      return null;
    }
    genAI = new GoogleGenerativeAI(API_KEY);
  }
  return genAI;
};

/**
 * Servicio para interactuar con Gemini AI
 */
export const geminiService = {
  /**
   * Genera un resumen en bullet points de un contenido académico
   */
  async generateSummary(title, description) {
    try {
      const client = getGenAI();
      if (!client) throw new Error("API Key de Gemini no configurada");
      
      const model = client.getGenerativeModel({ 
        model: "gemini-2.0-flash",
        systemInstruction: "Eres un asistente educativo de la F.E.B.D. que genera resúmenes concisos en bullet points con emojis."
      });
      const prompt = `Genera un resumen para: ${title}\nContexto: ${description}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("❌ [Gemini Error]:", error);
      return "Hubo un error generando el resumen. Inténtalo de nuevo.";
    }
  },

  async semanticSearch(query, contents) {
    try {
      const client = getGenAI();
      if (!client) throw new Error("API Key de Gemini no configurada");

      const model = client.getGenerativeModel({ 
        model: "gemini-2.0-flash",
        systemInstruction: "Identifica clases relevantes para el alumno basándote en su pregunta."
      });
      const contentsStr = contents.map(c => `- ${c.title}`).join('\n');
      const prompt = `Lista: ${contentsStr}\nPregunta: "${query}"\nDevuelve solo los títulos relevantes.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      return "Error en la búsqueda.";
    }
  },

  async getChatResponse(message, history = []) {
    try {
      const client = getGenAI();
      if (!client) throw new Error("API Key de Gemini no configurada");
      
      const systemContext = `Eres el "Mentor Académico" de la U.E.P. Francisca Elena Burgos Delmoral (F.E.B.D.).
      Ayudas con materias, resúmenes y calendario. Eres amable, profesional y usas emojis. Responde siempre en español.`;

      const model = client.getGenerativeModel({ 
        model: "gemini-2.0-flash",
        systemInstruction: systemContext 
      });

      const chat = model.startChat({ history });
      const result = await chat.sendMessage(message);
      const response = await result.response;
      return response.text();
      
    } catch (error) {
      console.error("❌ [Gemini 2.0 Error]:", error);
      return `Ups, error con Gemini 2.0: ${error.message || "revisa tu conexión o API Key"}`;
    }
  }
};

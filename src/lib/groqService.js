import Groq from "groq-sdk";

const API_KEY = import.meta.env.VITE_GROQ_API_KEY;

// Inicialización perezosa (lazy) para evitar errores si no hay key
let groq = null;
const getGroqClient = () => {
  if (!groq && API_KEY) {
    groq = new Groq({
      apiKey: API_KEY,
      dangerouslyAllowBrowser: true // Necesario para ejecución del lado del cliente (Vite)
    });
  }
  return groq;
};

// El conocimiento institucional ahora debe gestionarse desde la base de datos o contexto dinámico


/**
 * Servicio para interactuar con Groq (Llama 3.3)
 */
export const groqService = {
  /**
   * Genera un resumen en bullet points usando Llama 3.3
   */
  async generateSummary(title, description) {
    try {
      const client = getGroqClient();
      if (!client) throw new Error("API Key de Groq no configurada");

      const completion = await client.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "Eres un asistente educativo que genera resúmenes concisos en bullet points con emojis."
          },
          {
            role: "user",
            content: `Genera un resumen breve en 3 o 4 puntos clave para este contenido:\nTítulo: ${title}\nContexto: ${description}`
          }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
      });

      return completion.choices[0]?.message?.content || "No se pudo generar el resumen.";
    } catch (error) {
      console.error("❌ [Groq Summary Error]:", error);
      return `Error con Groq: ${error.message || "revisa tu conexión"}`;
    }
  },

  /**
   * Respuesta de chat general para el asistente tipo burbuja (Mentor IA)
   */
  async getChatResponse(message, history = []) {
    try {
      const client = getGroqClient();
      if (!client) throw new Error("API Key de Groq no configurada");

      // Adaptamos el historial al formato de OpenAI/Groq
      const formattedHistory = history.map(h => ({
        role: h.role === 'user' ? 'user' : 'assistant',
        content: h.content
      }));

      const completion = await client.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `Eres el "Mentor Académico" de la U.E.P. Francisca Elena Burgos Delmoral (F.E.B.D.). 
            Ayudas con materias, resúmenes y calendario. Eres amable, profesional y usas emojis. 
            Responde siempre en español.`
          },
          ...formattedHistory,
          { role: "user", content: message }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.8,
      });

      return completion.choices[0]?.message?.content || "No tengo respuesta en este momento.";
    } catch (error) {
      console.error("❌ [Groq Chat Error]:", error);
      return `Ups, error con Groq: ${error.message || "revisa tu conexión o API Key de Groq"}`;
    }
  },

  /**
   * TUTOR DE GUARDIA / MENTOR ACADÉMICO: Responde basándose en el contexto del aula.
   */
  async getTutorResponse(message, history = [], role = "estudiante") {
    try {
      const client = getGroqClient();
      if (!client) throw new Error("API Key de Groq no configurada");

      // Por ahora, eliminamos la carga local de JSON por ser código innecesario según el requerimiento.
      // En el futuro, esto podría consultar una tabla 'knowledge_base' en Supabase.
      const contextualInfo = ""; 

      const isStudent = role === "estudiante";
      
      const systemPrompt = isStudent 
        ? `Eres el "Mentor Académico" de la U.E.P. Francisca Elena Burgos Delmoral (F.E.B.D.). 
           Ayudas con materias, resúmenes y calendario. Eres amable, profesional y usas emojis. 
           Responde siempre en español.`
        : `Eres el "Tutor de Guardia" del Aula Virtual F.E.B.D.
           Ayudas a los usuarios con consultas sobre el sistema.`;

      const finalPrompt = `${systemPrompt}
      
      ${contextualInfo ? `MATERIAL DE CLASE DISPONIBLE:\n${contextualInfo}` : ""}
      
      Reglas:
      - Sé muy pedagógico y alentador.
      - Si el usuario pregunta por algo que no conoces, indícale amablemente que estás para consultas escolares.`;

      const formattedHistory = history.map(h => ({
        role: h.role === 'user' ? 'user' : 'assistant',
        content: h.content
      }));

      const completion = await client.chat.completions.create({
        messages: [
          { role: "system", content: finalPrompt },
          ...formattedHistory,
          { role: "user", content: message }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.5,
      });

      return completion.choices[0]?.message?.content || "El Mentor está analizando la consulta...";
    } catch (error) {
      console.error("❌ [Groq Tutor Error]:", error);
      return `Lo siento, hubo un problema: ${error.message}`;
    }
  },

  /**
   * GENERADOR DE RETOS FLASH: Para profesores.
   */
  async generateTeacherChallenge(topic) {
    try {
      const client = getGroqClient();
      if (!client) return null;

      const completion = await client.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `Eres un consultor pedagógico experto. Generas retos educativos creativos en formato JSON.
            El JSON debe incluir: "pregunta" (string), "opciones" (array de 4 strings), "respuesta_correcta" (número del 0 al 3 indicando el índice de la opción correcta), "explicacion" (string con la justificación pedagógica).
            Responde ÚNICAMENTE el JSON puro, sin texto adicional.`
          },
          {
            role: "user",
            content: `Genera un reto flash académico sobre el tema: "${topic}".`
          }
        ],
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" }
      });

      return JSON.parse(completion.choices[0]?.message?.content);
    } catch (error) {
      console.error("❌ [Groq Challenge Gen Error]:", error);
      return null;
    }
  },

  /**
   * FEEDBACK CREATIVO: Para el Dev-Log de alumnos.
   */
  async getCreativeFeedback(content, type = "codigo") {
    try {
      const client = getGroqClient();
      if (!client) return "Mentor offline.";

      const completion = await client.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `Eres el Mentor de feedback creativo. Tu tono es SIEMPRE académico, motivador y constructivo.
            Analizas lo que suben los alumnos (código o proyectos) y les das un consejo útil para mejorar. 
            No seas sarcástico. Sé el mejor profesor que hayan tenido.`
          },
          {
            role: "user",
            content: `Este alumno ha subido un aporte de ${type}:\n"${content}"\n\nDame un feedback breve y muy motivador en nombre del Mentor IA.`
          }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.9,
      });

      return completion.choices[0]?.message?.content || "¡Buen trabajo! Sigue esforzándote.";
    } catch (error) {
       return "El Mentor está revisando tu trabajo, ¡vuelve pronto!";
    }
  }
};

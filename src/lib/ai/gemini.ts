import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export function getModel() {
  const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  return genAI.getGenerativeModel({ model: modelName });
}

export async function generateJSON<T>(
  systemPrompt: string,
  userPrompt: string,
  parse: (text: string) => T,
  retries = 2
): Promise<T> {
  const model = getModel();

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        systemInstruction: { role: "model", parts: [{ text: systemPrompt }] },
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });

      const text = result.response.text();
      return parse(text);
    } catch (err) {
      if (attempt === retries) throw err;
      console.warn(`Gemini attempt ${attempt + 1} failed, retrying...`, err);
    }
  }

  throw new Error("Failed to generate content");
}

export async function generateStream(
  systemPrompt: string,
  messages: { role: "user" | "model"; content: string }[]
) {
  const model = getModel();

  const contents = messages.map((m) => ({
    role: m.role,
    parts: [{ text: m.content }],
  }));

  const result = await model.generateContentStream({
    contents,
    systemInstruction: { role: "model", parts: [{ text: systemPrompt }] },
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    },
  });

  return result.stream;
}

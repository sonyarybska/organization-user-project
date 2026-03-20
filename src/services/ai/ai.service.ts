import OpenAI from 'openai';

export interface IAIService {
  callAI: <T>(prompt: string) => Promise<T>;
}

export function getAIService(apiKey: string): IAIService {
  const client = new OpenAI({
    apiKey,
    baseURL: 'https://api.groq.com/openai/v1'
  });

  return {
    async callAI<T>(prompt: string): Promise<T> {
      const response = await client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 500,
        temperature: 0.3,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: 'Return only valid JSON without markdown formatting.' },
          { role: 'user', content: prompt }
        ]
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('No response from AI');

      return JSON.parse(content) as T;
    }
  };
}

import axios from 'axios';
import { AICallOptions, IAIService } from 'src/types/interfaces/AIService';

export function getAIService(config: { apiKey: string; baseURL: string }): IAIService {
  const { apiKey, baseURL } = config;

  return {
    async callAI<T>(prompt: string, options: AICallOptions): Promise<T> {
      const { model, maxTokens = 500, temperature = 0.3 } = options;

      const response = await axios.post(
        `${baseURL}/chat/completions`,
        {
          model,
          max_tokens: maxTokens,
          temperature,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: 'Return only valid JSON without markdown formatting.' },
            { role: 'user', content: prompt }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`
          }
        }
      );

      const content = response.data?.choices?.[0]?.message?.content;

      if (!content) throw new Error('No response from AI');

      return JSON.parse(content) as T;
    }
  };
}

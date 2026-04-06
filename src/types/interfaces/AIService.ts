export interface AICallOptions {
  model: string;
  maxTokens?: number;
  temperature?: number;
}

export interface IAIService {
  callAI: <T>(prompt: string, options: AICallOptions) => Promise<T>;
}

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export default {};

export class AIService {
  private static instance: AIService;

  private constructor() {}

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async chat(messages: Message[]): Promise<string> {
    // Simulate a response instead of calling OpenAI API
    return Promise.resolve(
      "I'm a simulated AI response. In a real implementation, this would connect to an AI service."
    );
  }
}

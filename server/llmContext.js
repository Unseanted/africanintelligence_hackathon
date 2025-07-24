class LLMStrategy {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async generateResponse(message) {
    throw new Error("Not implemented");
  }
}

class LLMContext {
  constructor(strategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy) {
    this.strategy = strategy;
  }

  async generateResponse(message) {
    return this.strategy.generateResponse(message);
  }
}

module.exports = { LLMStrategy, LLMContext };

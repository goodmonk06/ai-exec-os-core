/**
 * LLM Provider Adapter Interface
 * Enables swapping between different LLM providers (OpenAI, Anthropic, custom)
 */

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMCompletionRequest {
  model: string;
  messages: LLMMessage[];
  temperature?: number;
  maxTokens?: number;
  stopSequences?: string[];
  metadata?: Record<string, unknown>;
}

export interface LLMCompletionResponse {
  content: string;
  finishReason: 'stop' | 'length' | 'error';
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  metadata?: Record<string, unknown>;
}

export interface ILLMAdapter {
  /**
   * Provider name (e.g., "openai", "anthropic", "custom")
   */
  readonly provider: string;

  /**
   * Generate a completion from the LLM
   */
  complete(request: LLMCompletionRequest): Promise<LLMCompletionResponse>;

  /**
   * Check if provider is available
   */
  healthCheck(): Promise<boolean>;
}

/**
 * Mock LLM Adapter (for testing and development)
 */
export class MockLLMAdapter implements ILLMAdapter {
  readonly provider = 'mock';

  async complete(request: LLMCompletionRequest): Promise<LLMCompletionResponse> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 1000));

    const lastMessage = request.messages[request.messages.length - 1];

    return {
      content: `Mock response to: "${lastMessage.content}" (model: ${request.model})`,
      finishReason: 'stop',
      usage: {
        promptTokens: 100,
        completionTokens: 50,
        totalTokens: 150,
      },
      metadata: {
        mockResponse: true,
        temperature: request.temperature || 0.7,
      },
    };
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }
}

/**
 * LLM Adapter Registry
 * Manages multiple LLM providers
 */
class LLMAdapterRegistry {
  private adapters: Map<string, ILLMAdapter> = new Map();
  private defaultProvider = 'mock';

  constructor() {
    // Register mock adapter by default
    this.register(new MockLLMAdapter());
  }

  /**
   * Register an LLM adapter
   */
  register(adapter: ILLMAdapter): void {
    this.adapters.set(adapter.provider, adapter);
  }

  /**
   * Get adapter by provider name
   */
  get(provider: string): ILLMAdapter | undefined {
    return this.adapters.get(provider);
  }

  /**
   * Get default adapter
   */
  getDefault(): ILLMAdapter {
    const adapter = this.adapters.get(this.defaultProvider);
    if (!adapter) {
      throw new Error(`Default LLM adapter "${this.defaultProvider}" not found`);
    }
    return adapter;
  }

  /**
   * Set default provider
   */
  setDefault(provider: string): void {
    if (!this.adapters.has(provider)) {
      throw new Error(`LLM adapter "${provider}" not registered`);
    }
    this.defaultProvider = provider;
  }

  /**
   * List all registered providers
   */
  listProviders(): string[] {
    return Array.from(this.adapters.keys());
  }
}

// Export singleton registry
export const llmRegistry = new LLMAdapterRegistry();

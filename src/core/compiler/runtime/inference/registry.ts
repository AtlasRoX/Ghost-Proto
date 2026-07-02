export interface ModelMetadata {
  id: string;
  providerId: string;
  contextLimit: number;
  inputCostPer1K: number;
  outputCostPer1K: number;
  capabilities: string[]; // e.g. "high_reasoning", "json_mode", "embedding"
}

export interface ProviderMetadata {
  id: string;
  name: string;
  apiKey?: string;
  endpoint?: string;
}

export class ModelRegistry {
  private models = new Map<string, ModelMetadata>();
  private providers = new Map<string, ProviderMetadata>();

  public registerProvider(provider: ProviderMetadata): void {
    this.providers.set(provider.id, provider);
  }

  public registerModel(model: ModelMetadata): void {
    this.models.set(model.id, model);
  }

  public getModel(id: string): ModelMetadata | undefined {
    return this.models.get(id);
  }

  public getModels(): ModelMetadata[] {
    return Array.from(this.models.values());
  }

  public clear(): void {
    this.models.clear();
    this.providers.clear();
  }
}

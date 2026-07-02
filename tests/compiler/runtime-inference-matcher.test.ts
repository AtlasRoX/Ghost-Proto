import { ModelRegistry } from '../../src/core/compiler/runtime/inference/registry';
import { CapabilityMatcher } from '../../src/core/compiler/runtime/inference/matcher';

describe('Inference Capability Matcher', () => {
  it('should route requests to cheapest compatible models', () => {
    const registry = new ModelRegistry();

    registry.registerProvider({ id: 'openai', name: 'OpenAI' });

    // Register expensive reasoning model
    registry.registerModel({
      id: 'gpt-4o',
      providerId: 'openai',
      contextLimit: 128000,
      inputCostPer1K: 0.005,
      outputCostPer1K: 0.015,
      capabilities: ['high_reasoning', 'json_mode']
    });

    // Register cheap reasoning model
    registry.registerModel({
      id: 'gpt-4o-mini',
      providerId: 'openai',
      contextLimit: 128000,
      inputCostPer1K: 0.00015,
      outputCostPer1K: 0.0006,
      capabilities: ['high_reasoning', 'json_mode']
    });

    const matcher = new CapabilityMatcher(registry);
    const matched = matcher.match(['high_reasoning', 'json_mode']);

    expect(matched).toBeDefined();
    expect(matched?.id).toBe('gpt-4o-mini'); // mini is chosen because it's cheaper
  });

  it('should return null if no compatible model is found', () => {
    const registry = new ModelRegistry();
    const matcher = new CapabilityMatcher(registry);
    const matched = matcher.match(['embedding']);
    expect(matched).toBeNull();
  });
});

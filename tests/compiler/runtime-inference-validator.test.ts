import { ResponseValidator } from '../../src/core/compiler/runtime/inference/validator';

describe('Response Validator', () => {
  it('should parse clean JSON and extract markdown backtick JSON structures', () => {
    const rawText = '```json\n{"status": "passed"}\n```';
    const parsed = ResponseValidator.validateJSON(rawText);
    expect(parsed).toEqual({ status: 'passed' });
  });

  it('should validate JSON schemas against required keys', () => {
    const obj = { id: 'test', severity: 'high', description: 'desc' };
    expect(ResponseValidator.validateSchema(obj, ['id', 'severity'])).toBe(true);
    expect(ResponseValidator.validateSchema(obj, ['id', 'category'])).toBe(false);
  });
});

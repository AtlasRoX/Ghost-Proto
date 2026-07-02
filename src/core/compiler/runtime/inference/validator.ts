export class ResponseValidator {
  public static validateJSON(text: string): Record<string, any> | null {
    try {
      return JSON.parse(text);
    } catch {
      // Attempt simple markdown backticks extraction
      const matches = text.match(/```json([\s\S]*?)```/);
      if (matches && matches[1]) {
        try {
          return JSON.parse(matches[1].trim());
        } catch {
          return null;
        }
      }
      return null;
    }
  }

  public static validateSchema(obj: Record<string, any>, requiredKeys: string[]): boolean {
    return requiredKeys.every(key => key in obj);
  }
}

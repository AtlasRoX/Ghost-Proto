import * as crypto from 'crypto';

export class InferenceCache {
  private cache = new Map<string, string>();

  private getHash(prompt: string): string {
    return crypto.createHash('sha256').update(prompt).digest('hex');
  }

  public set(prompt: string, response: string): void {
    this.cache.set(this.getHash(prompt), response);
  }

  public get(prompt: string): string | null {
    return this.cache.get(this.getHash(prompt)) || null;
  }

  public clear(): void {
    this.cache.clear();
  }
}

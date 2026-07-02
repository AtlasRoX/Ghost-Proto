import * as fs from 'fs';

export class ReportWriter {
  public static write(outputPath: string, content: string): void {
    fs.writeFileSync(outputPath, content, 'utf-8');
  }
}

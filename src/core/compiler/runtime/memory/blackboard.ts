export interface RuntimeObservation {
  id: string;
  sourceWorker: string;
  timestamp: string;
  data: Record<string, any>;
}

export class Blackboard {
  private observations: RuntimeObservation[] = [];
  private transactionBuffer: RuntimeObservation[] | null = null;

  public publish(observation: RuntimeObservation): void {
    if (this.transactionBuffer) {
      this.transactionBuffer.push(observation);
    } else {
      this.observations.push(observation);
    }
  }

  public getObservations(): RuntimeObservation[] {
    return this.transactionBuffer || this.observations;
  }

  public beginTransaction(): void {
    this.transactionBuffer = [...this.observations];
  }

  public commitTransaction(): void {
    if (this.transactionBuffer) {
      this.observations = this.transactionBuffer;
      this.transactionBuffer = null;
    }
  }

  public rollbackTransaction(): void {
    this.transactionBuffer = null;
  }

  public clear(): void {
    this.observations = [];
    this.transactionBuffer = null;
  }
}

export interface RuntimeObservation {
    id: string;
    sourceWorker: string;
    timestamp: string;
    data: Record<string, any>;
}
export declare class Blackboard {
    private observations;
    private transactionBuffer;
    publish(observation: RuntimeObservation): void;
    getObservations(): RuntimeObservation[];
    beginTransaction(): void;
    commitTransaction(): void;
    rollbackTransaction(): void;
    clear(): void;
}
//# sourceMappingURL=blackboard.d.ts.map
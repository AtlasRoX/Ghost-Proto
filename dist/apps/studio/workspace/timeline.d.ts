export interface TimelineEvent {
    id: string;
    stepName: string;
    timestamp: string;
    payload: Record<string, any>;
}
export declare class TimelineService {
    private events;
    private currentEventIndex;
    logStep(name: string, payload?: Record<string, any>): void;
    getEvents(): TimelineEvent[];
    getCurrentStep(): TimelineEvent | null;
    scrubTo(index: number): void;
    clear(): void;
}
//# sourceMappingURL=timeline.d.ts.map
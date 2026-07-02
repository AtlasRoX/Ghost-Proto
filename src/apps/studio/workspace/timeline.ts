export interface TimelineEvent {
  id: string;
  stepName: string;
  timestamp: string;
  payload: Record<string, any>;
}

export class TimelineService {
  private events: TimelineEvent[] = [];
  private currentEventIndex = -1;

  public logStep(name: string, payload: Record<string, any> = {}): void {
    const event: TimelineEvent = {
      id: `step_${Date.now()}_${this.events.length}`,
      stepName: name,
      timestamp: new Date().toISOString(),
      payload
    };

    // Remove any steps beyond current index if scrubbed back
    if (this.currentEventIndex < this.events.length - 1) {
      this.events = this.events.slice(0, this.currentEventIndex + 1);
    }

    this.events.push(event);
    this.currentEventIndex = this.events.length - 1;
  }

  public getEvents(): TimelineEvent[] {
    return this.events;
  }

  public getCurrentStep(): TimelineEvent | null {
    if (this.currentEventIndex >= 0 && this.currentEventIndex < this.events.length) {
      return this.events[this.currentEventIndex];
    }
    return null;
  }

  public scrubTo(index: number): void {
    if (index >= -1 && index < this.events.length) {
      this.currentEventIndex = index;
    }
  }

  public clear(): void {
    this.events = [];
    this.currentEventIndex = -1;
  }
}

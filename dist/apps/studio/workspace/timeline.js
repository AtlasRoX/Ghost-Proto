"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimelineService = void 0;
class TimelineService {
    constructor() {
        this.events = [];
        this.currentEventIndex = -1;
    }
    logStep(name, payload = {}) {
        const event = {
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
    getEvents() {
        return this.events;
    }
    getCurrentStep() {
        if (this.currentEventIndex >= 0 && this.currentEventIndex < this.events.length) {
            return this.events[this.currentEventIndex];
        }
        return null;
    }
    scrubTo(index) {
        if (index >= -1 && index < this.events.length) {
            this.currentEventIndex = index;
        }
    }
    clear() {
        this.events = [];
        this.currentEventIndex = -1;
    }
}
exports.TimelineService = TimelineService;
//# sourceMappingURL=timeline.js.map
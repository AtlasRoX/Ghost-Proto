"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Blackboard = void 0;
class Blackboard {
    constructor() {
        this.observations = [];
        this.transactionBuffer = null;
    }
    publish(observation) {
        if (this.transactionBuffer) {
            this.transactionBuffer.push(observation);
        }
        else {
            this.observations.push(observation);
        }
    }
    getObservations() {
        return this.transactionBuffer || this.observations;
    }
    beginTransaction() {
        this.transactionBuffer = [...this.observations];
    }
    commitTransaction() {
        if (this.transactionBuffer) {
            this.observations = this.transactionBuffer;
            this.transactionBuffer = null;
        }
    }
    rollbackTransaction() {
        this.transactionBuffer = null;
    }
    clear() {
        this.observations = [];
        this.transactionBuffer = null;
    }
}
exports.Blackboard = Blackboard;
//# sourceMappingURL=blackboard.js.map
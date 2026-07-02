"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalysisContext = void 0;
const builder_1 = require("./graph/builder");
const evidence_1 = require("./store/evidence");
const registry_1 = require("./rules/registry");
const engine_1 = require("./rules/engine");
const navigation_1 = require("./navigation");
const engine_2 = require("./query/engine");
const executor_1 = require("./query/executor");
class AnalysisContext {
    constructor(repository) {
        this.repository = repository;
        this.callGraph = [];
        this.dependencyGraph = [];
        this.cfgs = new Map();
        this.evidenceStore = new evidence_1.EvidenceStore();
        this.ruleRegistry = new registry_1.RuleRegistry();
        this.diagnostics = [];
        this.navigation = new navigation_1.NavigationService(repository);
        const executor = new executor_1.AnalysisQueryExecutor(this.navigation, repository);
        this.queryEngine = new engine_2.AnalysisQueryEngine(executor);
        this.rebuildGraphs();
    }
    rebuildGraphs() {
        const graphs = builder_1.GraphBuilder.buildGraphs(this.repository);
        this.callGraph = graphs.callGraph;
        this.dependencyGraph = graphs.dependencyGraph;
        this.cfgs = graphs.cfgs;
    }
    async analyze() {
        const engine = new engine_1.RuleEngine(this.ruleRegistry);
        const observations = await engine.runAll(this);
        this.evidenceStore.ingest(observations);
        return this.evidenceStore.getFindings();
    }
}
exports.AnalysisContext = AnalysisContext;
//# sourceMappingURL=context.js.map
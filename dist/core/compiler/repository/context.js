"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepositoryContext = void 0;
const symbol_1 = require("./services/symbol");
const import_1 = require("./services/import");
const reference_1 = require("./services/reference");
const metrics_1 = require("./services/metrics");
const metadata_1 = require("./services/metadata");
const pipeline_1 = require("./query/pipeline");
const executor_1 = require("./query/executor");
class RepositoryContext {
    constructor(index) {
        this.index = index;
        this.symbols = new symbol_1.SymbolService(index);
        this.imports = new import_1.ImportService(index);
        this.references = new reference_1.ReferenceService(index);
        this.metrics = new metrics_1.MetricsService(index);
        this.metadata = new metadata_1.MetadataService(index);
        const executor = new executor_1.QueryExecutor(this.symbols, this.references, this.metrics);
        this.queryPipeline = new pipeline_1.QueryPipeline(executor);
    }
    async query(intent) {
        return this.queryPipeline.query(intent);
    }
    diff(other) {
        return this.index.diff(other.index);
    }
}
exports.RepositoryContext = RepositoryContext;
//# sourceMappingURL=context.js.map
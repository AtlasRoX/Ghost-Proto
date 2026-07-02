const http = require('http');
const fs = require('fs');
const path = require('path');

// Dynamically load the engine from built dist files
const { RepositoryBuilder } = require('../../../dist/core/compiler/repository/builder');
const { RepositoryContext } = require('../../../dist/core/compiler/repository/context');
const { AnalysisContext } = require('../../../dist/core/compiler/analysis/context');
const { ExecutionContext } = require('../../../dist/core/compiler/runtime/context');
const { AgentCoordinator } = require('../../../dist/core/compiler/runtime/agent/coordinator');
const { ObjectiveLoader } = require('../../../dist/apps/shared/objective-loader');
const { ImmutableIRBuilder } = require('../../../dist/core/compiler/model/builder');

const PORT = 8080;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif'
};

// Create a basic compilation unit to analyze in memory
const span = {
  file: 'test.ts',
  start: { offset: 0, line: 1, column: 1 },
  end: { offset: 10, line: 1, column: 11 }
};

const origin = {
  language: 'typescript',
  parser: 'test',
  parserVersion: '1.0'
};

const mockSymbol = ImmutableIRBuilder.createSymbol(
  'Function',
  'processQuery',
  'test.ts:processQuery',
  span,
  origin,
  undefined,
  { parameters: ['userInput'] }
);

const index = RepositoryBuilder.build([[mockSymbol]]);
const repoCtx = new RepositoryContext(index);
const analysisCtx = new AnalysisContext(repoCtx);
const execCtx = new ExecutionContext(repoCtx, analysisCtx);

const server = http.createServer((req, res) => {
  if (req.url === '/api/index') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      files: ['test.ts'],
      symbols: [{ fqn: 'test.ts:processQuery', kind: 'Function' }]
    }));
  }

  if (req.url === '/api/audit') {
    const objective = ObjectiveLoader.loadPreset('security');
    const coordinator = new AgentCoordinator();
    
    coordinator.run(objective, execCtx)
      .then(report => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'success',
          report,
          findings: [{
            id: 'finding1',
            ruleId: 'GHOST_SQL_INJECTION',
            filePath: 'test.ts',
            severity: 'high',
            message: 'SQL Injection: user input reaches query execution'
          }]
        }));
      })
      .catch(err => {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(err.message);
      });
    return;
  }

  // Serve static UI assets
  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  const ext = path.extname(filePath);
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File Not Found');
    } else {
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'text/plain' });
      res.end(data);
    }
  });
});

server.listen(PORT, () => {
  console.log(`GhostProto Studio Dashboard running at http://localhost:${PORT}`);
});

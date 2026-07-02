const fileContents = {
  'test.ts': `function processQuery(userInput: string) {
  const query = "SELECT * FROM users WHERE id = " + userInput;
  // Vulnerable sink path
  db.execute(query);
}`
};

let currentFile = 'test.ts';

function loadFile(filePath) {
  currentFile = filePath;
  const content = fileContents[filePath] || '// Empty file';
  const container = document.getElementById('code-container');
  container.innerHTML = '';

  const lines = content.split('\n');
  lines.forEach((lineText, idx) => {
    const lineNum = idx + 1;
    const lineDiv = document.createElement('div');
    lineDiv.className = 'code-line';
    if (lineNum === 4) {
      lineDiv.className = 'code-line vulnerable';
    }

    // Add click handler to select symbol
    lineDiv.onclick = () => selectLine(lineNum, lineText);

    const numSpan = document.createElement('span');
    numSpan.className = 'line-number';
    numSpan.innerText = lineNum;

    const textSpan = document.createElement('span');
    textSpan.className = 'line-text';
    textSpan.innerText = lineText;

    lineDiv.appendChild(numSpan);
    lineDiv.appendChild(textSpan);
    container.appendChild(lineDiv);
  });

  logEvent(`Opened file: ${filePath}`);
}

function selectLine(lineNum, text) {
  const cleanText = text.trim();
  document.getElementById('sel-symbol').innerText = cleanText || `Line ${lineNum}`;
  logEvent(`Selected line ${lineNum}: ${cleanText}`);
}

function switchTab(tabId) {
  const btns = document.querySelectorAll('.activity-btn');
  btns.forEach(btn => btn.classList.remove('active'));
  
  const editorView = document.getElementById('editor-view');
  const graphView = document.getElementById('graph-view');

  if (tabId === 'explorer') {
    document.querySelector('[title="Explorer"]').classList.add('active');
    editorView.style.display = 'flex';
    graphView.style.display = 'none';
    logEvent('Switched workspace view to Repository Explorer');
  } else if (tabId === 'graphs') {
    document.querySelector('[title="Call Graphs"]').classList.add('active');
    editorView.style.display = 'none';
    graphView.style.display = 'block';
    logEvent('Switched workspace view to Graph Explorer');
  } else {
    logEvent(`Switched workspace view to: ${tabId}`);
  }
}

function toggleInvestigationMode() {
  const body = document.body;
  if (body.classList.contains('investigation-view')) {
    body.classList.remove('investigation-view');
    logEvent('Investigation Mode closed. Restored normal layout.');
  } else {
    body.classList.add('investigation-view');
    logEvent('Investigation Mode activated. Rearranged workspace panels.');
  }
}

function logEvent(msg) {
  const content = document.getElementById('bottom-content');
  const timestamp = new Date().toLocaleTimeString();
  content.innerHTML += `[${timestamp}] ${msg}<br>`;
  content.scrollTop = content.scrollHeight;
}

async function runAnalysis() {
  logEvent('Invoking AgentCoordinator backend audit...');
  
  try {
    const res = await fetch('/api/audit', { method: 'POST' });
    const data = await res.json();
    
    if (data.status === 'success') {
      logEvent('✓ Audit execution complete. Consensus resolved successfully.');
      logEvent(`✓ Findings verified: ${data.findings.length}`);
      
      // Update inspector finding details
      document.getElementById('sel-symbol').innerText = 'db.execute(query)';
      
      // Open editor showing vulnerable file
      loadFile('test.ts');
      
      // Render report preview in the bottom panel logs
      const content = document.getElementById('bottom-content');
      content.innerHTML += `<br><strong style="color: var(--accent);">Generated Report Preview:</strong><br>${data.report.replace(/\n/g, '<br>')}<br>`;
    } else {
      logEvent('✖ Audit failed.');
    }
  } catch (err) {
    logEvent(`✖ Network error calling API: ${err.message}`);
  }
}

function switchBottomTab(tabName) {
  const tabs = document.querySelectorAll('.tab-item');
  tabs.forEach(t => t.classList.remove('active'));
  
  event.target.classList.add('active');
  logEvent(`Bottom tab switched to: ${tabName}`);
}

// Initial index load on startup
async function initWorkspace() {
  try {
    const res = await fetch('/api/index');
    const data = await res.json();
    logEvent(`✓ Initialized project index. Loaded ${data.files.length} file(s).`);
  } catch (err) {
    logEvent(`✖ Failed to load initial index: ${err.message}`);
  }
  
  loadFile(currentFile);
}

initWorkspace();

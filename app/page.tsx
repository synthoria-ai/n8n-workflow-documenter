'use client';

import { useState } from 'react';
import { N8nWorkflow, AnalysisResult } from '@/lib/types';
import { analyzeWorkflowWithGemini, sanitizeWorkflow } from '@/lib/analysis';
import { useGoogleDrive, DriveFolder } from '@/hooks/useGoogleDrive';

export default function Home() {
  const [workflow, setWorkflow] = useState<N8nWorkflow | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [clientId, setClientId] = useState('');

  const [analysis, setAnalysis] = useState<Partial<AnalysisResult> | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);

  // Drive State
  const drive = useGoogleDrive();
  const [sourceFolder, setSourceFolder] = useState<DriveFolder | null>(null);
  const [destFolder, setDestFolder] = useState<DriveFolder | null>(null);
  const [processingLog, setProcessingLog] = useState<string[]>([]);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);

  // Initialize Auth when ID provided
  const handleClientIdSet = (id: string) => {
    setClientId(id);
    drive.initTokenClient(id);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    try {
      const json = JSON.parse(text);
      setWorkflow(json);
      const { warnings: localWarnings } = sanitizeWorkflow(json);
      setWarnings(localWarnings);
    } catch (err) {
      console.error("Invalid JSON", err);
      alert("Invalid JSON file");
    }
  };

  const runAnalysis = async () => {
    if (!apiKey) {
      alert("Please enter a Google Gemini API Key first.");
      return;
    }
    if (!workflow) return;

    setIsAnalyzing(true);
    try {
      const result = await analyzeWorkflowWithGemini(workflow, apiKey);
      setAnalysis(result);
    } catch (error) {
      console.error(error);
      alert("Analysis failed. Check console/API Key.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Drive Workflow
  const handleDriveLogin = () => {
    if (!clientId) {
      alert("Enter Client ID first");
      return;
    }
    drive.login();
  };

  const handlePickSource = async () => {
    const folder = await drive.pickFolder(clientId);
    if (folder) setSourceFolder(folder);
  };

  const handlePickDest = async () => {
    const folder = await drive.pickFolder(clientId);
    if (folder) setDestFolder(folder);
  };

  const runBatchProcessing = async () => {
    if (!drive.isAuthenticated || !sourceFolder || !destFolder || !apiKey) {
      alert("Ensure you are logged in, have selected both folders, and entered an AI Key.");
      return;
    }

    setIsBatchProcessing(true);
    setProcessingLog(prev => [...prev, "Starting batch process..."]);

    const files = await drive.listJsonFiles(sourceFolder.id);
    setProcessingLog(prev => [...prev, `Found ${files.length} JSON files.`]);

    for (const file of files) {
      setProcessingLog(prev => [...prev, `Processing: ${file.name}...`]);
      try {
        const content = await drive.getFileContent(file.id);
        const json = JSON.parse(content);

        // Analyze
        const aiResult = await analyzeWorkflowWithGemini(json, apiKey);

        // Prepare Outputs
        const sanitizedData = sanitizeWorkflow(json);
        const outNameJson = (aiResult.suggestedFilename || file.name.replace('.json', '')) + ".json";
        const outNameDoc = (aiResult.suggestedFilename || file.name.replace('.json', '')) + ".md";

        // Generate Markdwon
        const mdContent = `# ${aiResult.summary}\n\n## Tools\n${aiResult.toolsUsed?.join(', ')}\n\n## Credentials\n${aiResult.credentialsRequired?.join(', ')}\n\n## Notes\n${aiResult.usageNotes || 'No specific notes.'}`;

        // Upload
        await drive.uploadFile(outNameJson, JSON.stringify(sanitizedData.workflow, null, 2), destFolder.id, 'application/json');
        await drive.uploadFile(outNameDoc, mdContent, destFolder.id, 'text/markdown');

        setProcessingLog(prev => [...prev, `Saved: ${outNameJson} & ${outNameDoc}`]);
      } catch (err) {
        setProcessingLog(prev => [...prev, `Error on ${file.name}: ${err}`]);
      }
    }

    setIsBatchProcessing(false);
    setProcessingLog(prev => [...prev, "Batch processing complete."]);
  };

  return (
    <main className="container">
      <header style={{ textAlign: 'center', marginBottom: '3rem', paddingTop: '2rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 700, background: 'linear-gradient(to right, rgb(var(--primary-rgb)), rgb(var(--accent-rgb)))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
          n8n Workflow Analyzer
        </h1>
        <p style={{ opacity: 0.8, marginTop: '1rem' }}>
          AI-powered documentation and sanitization. Connect Drive to bulk process.
        </p>
      </header>

      <div className="glass-panel" style={{ padding: '2rem', minHeight: '400px' }}>

        {/* Settings Bar */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '2rem' }}>
          <input
            type="password"
            placeholder="Gemini API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            style={{ maxWidth: '200px' }}
          />
          <input
            type="text"
            placeholder="Google Client ID (Apps)"
            value={clientId}
            onChange={(e) => handleClientIdSet(e.target.value)}
            style={{ maxWidth: '250px' }}
          />
        </div>

        {/* Auth Status */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          {!drive.isAuthenticated ? (
            <button
              onClick={handleDriveLogin}
              disabled={!drive.isReady || !clientId}
              style={{
                background: drive.isReady ? '#4285F4' : '#ccc',
                color: 'white',
                border: 'none',
                padding: '0.8rem 1.5rem',
                borderRadius: '6px',
                fontWeight: 600
              }}
            >
              Sign in with Google Drive
            </button>
          ) : (
            <span style={{ color: '#4ade80' }}>✓ Drive Connected</span>
          )}
        </div>

        {/* Main Interface Tabs - For now just stacked */}
        {drive.isAuthenticated && (
          <div style={{ marginTop: '2rem', borderTop: '1px solid var(--glass-border)', paddingTop: '2rem' }}>
            <h3>Batch Processor</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
              <div className="glass-panel" style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)' }}>
                <h4>Source</h4>
                {sourceFolder ? (
                  <div style={{ color: '#4ade80' }}>Selected: {sourceFolder.name}</div>
                ) : (
                  <button onClick={handlePickSource} style={{ width: '100%', padding: '0.5rem', background: 'transparent', border: '1px dashed grey', color: 'white' }}>Select Input Folder</button>
                )}
              </div>
              <div className="glass-panel" style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)' }}>
                <h4>Destination</h4>
                {destFolder ? (
                  <div style={{ color: '#4ade80' }}>Selected: {destFolder.name}</div>
                ) : (
                  <button onClick={handlePickDest} style={{ width: '100%', padding: '0.5rem', background: 'transparent', border: '1px dashed grey', color: 'white' }}>Select Output Folder</button>
                )}
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <button
                onClick={runBatchProcessing}
                disabled={isBatchProcessing || !sourceFolder || !destFolder}
                style={{
                  background: 'linear-gradient(to right, rgb(var(--primary-rgb)), rgb(var(--accent-rgb)))',
                  color: 'white',
                  border: 'none',
                  padding: '1rem 3rem',
                  borderRadius: '30px',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  cursor: isBatchProcessing ? 'wait' : 'pointer',
                  opacity: (isBatchProcessing || !sourceFolder || !destFolder) ? 0.5 : 1
                }}
              >
                {isBatchProcessing ? 'Processing Files...' : 'Run Batch Analysis'}
              </button>
            </div>

            {processingLog.length > 0 && (
              <div className="glass-panel" style={{ marginTop: '2rem', padding: '1rem', height: '200px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.9rem', textAlign: 'left', background: 'rgba(0,0,0,0.5)' }}>
                {processingLog.map((log, i) => <div key={i}>{log}</div>)}
              </div>
            )}
          </div>
        )}

        <div style={{ opacity: 0.5, marginTop: '3rem', marginBottom: '1rem' }}>- OR -</div>

        {/* Single File Upload (Legacy) */}
        {!workflow && !drive.isAuthenticated && (
          <div style={{ textAlign: 'center' }}>
            <p>Upload a single local file to test without Drive:</p>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
            />
          </div>
        )}

        {/* ... Rest of Single File Analysis UI from before (simplified here to reuse or keep) ... */}
        {workflow && (
          <div style={{ marginTop: '2rem', textAlign: 'left', borderTop: '1px solid var(--glass-border)', paddingTop: '2rem' }}>
            <h3>Single File Preview</h3>
            <p>Loaded {workflow.nodes.length} nodes.</p>
            <button onClick={runAnalysis}>Analyze This File</button>
            {/* Analysis Display */}
            {analysis && <pre style={{ background: 'black', padding: '1rem', overflow: 'auto' }}>{JSON.stringify(analysis, null, 2)}</pre>}
          </div>
        )}
      </div>
    </main>
  );
}

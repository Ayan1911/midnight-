import React from 'react';

export interface LogEntry {
  timestamp: string;
  text: string;
  type: 'info' | 'success' | 'warn';
}

interface ProofConsoleProps {
  logs: LogEntry[];
}

export const ProofConsole: React.FC<ProofConsoleProps> = ({ logs }) => {
  return (
    <div className="panel-card" id="console" style={{ marginTop: 24, width: '100%', maxWidth: 1600 }}>
      <div className="panel-title">
        <span>Zero-Knowledge Cryptographic Console</span>
        <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)' }}>ZKIR EXECUTION ENGINE</span>
      </div>
      <div className="proof-console mono">
        {logs.map((log, idx) => (
          <div key={idx} className={`console-entry ${log.type}`}>
            <span className="timestamp">[{log.timestamp}]</span>
            <span>{log.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

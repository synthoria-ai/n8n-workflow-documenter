export interface N8nCredential {
    id: string;
    name: string;
}

export interface N8nNode {
    parameters?: Record<string, any>;
    id: string;
    name: string;
    type: string;
    typeVersion: number;
    position: [number, number];
    credentials?: Record<string, N8nCredential>;
    notes?: string;
    notesInFlow?: boolean;
}

export interface N8nConnection {
    main: Array<Array<{
        node: string;
        type: string;
        index: number;
    }>>;
}

export interface N8nWorkflow {
    nodes: N8nNode[];
    connections: Record<string, N8nConnection>;
    meta?: any;
    name?: string;
}

export interface AnalysisResult {
    summary: string;
    toolsUsed: string[];
    credentialsRequired: string[];
    complexityScore: number;
    warnings: string[];
    usageNotes?: string;
    sanitizedJson: N8nWorkflow;
    suggestedFilename: string;
}

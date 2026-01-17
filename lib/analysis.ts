import { GoogleGenerativeAI } from "@google/generative-ai";
import { N8nWorkflow, AnalysisResult, N8nNode } from "./types";

export const sanitizeWorkflow = (workflow: N8nWorkflow): { workflow: N8nWorkflow, warnings: string[] } => {
    const warnings: string[] = [];
    const cleanWorkflow = JSON.parse(JSON.stringify(workflow)) as N8nWorkflow; // Deep clone

    // Regex for common secrets (Generic high-entropy, Slack, Stripe, OpenAI, etc.)
    const secretPatterns = [
        { name: 'OpenAI Key', regex: /sk-[a-zA-Z0-9]{20,}/ },
        { name: 'Slack Token', regex: /xox[baprs]-[0-9]{12}-[0-9]{12}-[a-zA-Z0-9]{24}/ },
        { name: 'Generic Key', regex: /((?<![a-zA-Z0-9])([A-Za-z0-9]{32,})(?![a-zA-Z0-9]))/ }, // 32+ char hex/alphanum
    ];

    cleanWorkflow.nodes.forEach((node: N8nNode) => {
        if (node.parameters) {
            const paramStr = JSON.stringify(node.parameters);

            secretPatterns.forEach(pattern => {
                if (pattern.regex.test(paramStr)) {
                    warnings.push(`Potential ${pattern.name} found in node "${node.name}" (${node.type}).`);
                    // TODO: Actually replace/redact in the object. For now just warning.
                }
            });
        }

        // Check strict credentials object if it exists (usually n8n separates them, but good to check)
        if (node.credentials) {
            // Just flag existence, n8n JSON exports usually keep references not values
            // keys are credential names, values are objects/ids
        }
    });

    return { workflow: cleanWorkflow, warnings };
};

export const analyzeWorkflowWithGemini = async (workflow: N8nWorkflow, apiKey: string): Promise<Partial<AnalysisResult>> => {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
    You are an expert in n8n workflows. Analyze the following workflow JSON and provide a documentation summary.
    
    Workflow Name: ${workflow.name || "Untitled"}
    Nodes: ${workflow.nodes.map(n => n.name + " (" + n.type + ")").join(", ")}
    
    Please return a JSON object with the following fields:
    - summary: A clear, human-readable description of what this workflow does (2-3 sentences).
    - toolsUsed: A list of external services/tools integrated (e.g. Google Sheets, Slack, OpenAI).
    - credentialsRequired: A list of credential types needed (e.g. "Slack API", "Google OAuth").
    - complexityScore: A number from 1-10 (1 = simple, 10 = extremely complex).
    - usageNotes: Any specific warnings or instructions for a user deploying this.
    - suggestedFilename: A concise filename (<50 chars) in the format Service_Action_Hash.json.

    Output PURE JSON only, no markdown formatting.
    
    Workflow Context (JSON structure):
    ${JSON.stringify({ nodes: workflow.nodes.map(n => ({ name: n.name, type: n.type, notes: n.notes })) }).substring(0, 10000)} 
    // Truncated for token limits if necessary, but n8n jsons can be large. 
    // Ideally we send the structure or a summarized structure.
  `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Cleanup markdown code blocks if present // ```json ... ```
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Gemini Analysis Failed", error);
        throw new Error("Failed to analyze workflow with AI.");
    }
};

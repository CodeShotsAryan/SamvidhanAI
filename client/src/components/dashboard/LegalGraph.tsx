import React, { useCallback, useEffect } from 'react';
import ReactFlow, {
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    Node,
    Edge,
    Position,
    MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Scale, Gavel, FileText, AlertTriangle, Lightbulb, ArrowRightLeft, ScrollText } from 'lucide-react';

interface LegalGraphProps {
    messageContent: string;
}

function generateGraphFromContent(content: string) {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    let parsed: any = {};
    try {
        parsed = JSON.parse(content);
    } catch (e) {
        // Fallback for non-JSON content
        console.warn("Graph content is not JSON", e);
    }

    // --- 1. Root Node ---
    let topic = "Legal Query";
    if (parsed.comparison?.title) topic = parsed.comparison.title;
    else if (parsed.topic) topic = parsed.topic;

    nodes.push({
        id: 'root',
        type: 'input',
        data: { label: topic },
        position: { x: 300, y: 0 },
        style: {
            background: '#4f46e5', color: 'white', border: 'none', borderRadius: '12px', padding: '10px 20px', fontWeight: 'bold', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        },
    });

    // --- 2. Law Sections (IPC / BNS) ---
    // Prefer structured comparison data
    let bnsText = parsed.comparison?.bns_section;
    let ipcText = parsed.comparison?.ipc_section;

    // Fallback to Regex if not in comparison structure
    if (!bnsText) {
        const bnsMatch = content.match(/BNS\s+(?:Section\s+)?(\d+)/i) || content.match(/Bharatiya\s+Nyaya\s+Sanhita\s+(?:Section\s+)?(\d+)/i);
        if (bnsMatch) bnsText = `BNS Section ${bnsMatch[1]}`;
    }
    if (!ipcText) {
        const ipcMatch = content.match(/IPC\s+(?:Section\s+)?(\d+)/i) || content.match(/Indian\s+Penal\s+Code\s+(?:Section\s+)?(\d+)/i);
        if (ipcMatch) ipcText = `IPC Section ${ipcMatch[1]}`;
    }

    // Nodes for Sections
    if (ipcText) {
        nodes.push({
            id: 'ipc',
            data: { label: <div className="flex flex-col items-center"><FileText className="w-4 h-4 mb-1" /> <span className="font-semibold">{ipcText}</span><span className="text-[10px] opacity-75">(Old Law)</span></div> },
            position: { x: 100, y: 150 },
            style: { background: '#ffedd5', color: '#9a3412', border: '1px solid #fdba74', borderRadius: '8px', minWidth: '120px' },
        });
        edges.push({ id: 'e-root-ipc', source: 'root', target: 'ipc', animated: true, style: { stroke: '#94a3b8' } });
    }

    if (bnsText) {
        nodes.push({
            id: 'bns',
            data: { label: <div className="flex flex-col items-center"><Scale className="w-4 h-4 mb-1" /> <span className="font-semibold">{bnsText}</span><span className="text-[10px] opacity-75">(New Law)</span></div> },
            position: { x: 500, y: 150 },
            style: { background: '#dbeafe', color: '#1e3a8a', border: '1px solid #93c5fd', borderRadius: '8px', minWidth: '120px' },
        });
        edges.push({ id: 'e-root-bns', source: 'root', target: 'bns', animated: true, style: { stroke: '#94a3b8' } });
    }

    // Link IPC -> BNS if both exist
    if (ipcText && bnsText) {
        edges.push({
            id: 'e-ipc-bns',
            source: 'ipc',
            target: 'bns',
            label: 'Replaced By',
            labelStyle: { fill: '#64748b', fontSize: 10 },
            style: { stroke: '#cbd5e1', strokeDasharray: '5,5' },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#cbd5e1' },
        });
    }

    // --- 3. Key Changes / Comparison ---
    if (parsed.comparison?.key_changes) {
        const changesShort = parsed.comparison.key_changes.length > 50
            ? parsed.comparison.key_changes.substring(0, 50) + "..."
            : parsed.comparison.key_changes;

        nodes.push({
            id: 'changes',
            data: { label: <div className="flex flex-col items-center text-center"><ArrowRightLeft className="w-4 h-4 mb-1" /> <span className="font-bold text-xs uppercase">Key Change</span><span className="text-xs mt-1">{changesShort}</span></div> },
            position: { x: 300, y: 220 },
            style: { background: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd', borderRadius: '8px', maxWidth: '200px' },
        });

        if (ipcText) edges.push({ id: 'e-ipc-changes', source: 'ipc', target: 'changes', type: 'smoothstep' });
        if (bnsText) edges.push({ id: 'e-bns-changes', source: 'bns', target: 'changes', type: 'smoothstep' });
    }

    // --- 4. Penalty Analysis (Real Extraction) ---
    // Search for penalty text in Law Description or General Law text
    let penaltyText = "";
    const lawContent = parsed.law || parsed.comparison?.bns_desc || "";
    // Matches "punished with imprisonment ... for X years" or similar
    const penaltyMatch = lawContent.match(/(?:punishe?d?|imprisonment)\s+(?:with|for)?\s+([^.]*?(?:years|fine|life|death)[^.]*)/i);

    if (penaltyMatch) {
        penaltyText = penaltyMatch[0];
        // Truncate if too long (e.g. > 60 chars)
        if (penaltyText.length > 70) penaltyText = penaltyText.substring(0, 70) + "...";
    }

    if (penaltyText) {
        nodes.push({
            id: 'penalty',
            data: { label: <div className="flex flex-col items-center text-center"><Gavel className="w-4 h-4 mb-1" /> <span className="font-bold text-xs">Penalty</span><span className="text-xs mt-1">{penaltyText}</span></div> },
            position: { x: 300, y: 340 },
            style: { background: '#fef2f2', color: '#991b1b', border: '1px solid #fca5a5', borderRadius: '8px', maxWidth: '220px' },
        });
        // Link from BNS (dominant) or IPC or Root
        const sourceId = bnsText ? 'bns' : (ipcText ? 'ipc' : 'root');
        edges.push({ id: `e-${sourceId}-penalty`, source: sourceId, target: 'penalty', animated: true });
    }

    // --- 5. Interpretation / Summary ---
    let interpretation = parsed.simple_answer || parsed.simpleanswer || "";
    if (interpretation) {
        // Strip markdown
        interpretation = interpretation.replace(/[*#_`]/g, '').replace(/\[\d+\]/g, '');
        const interpShort = interpretation.length > 80 ? interpretation.substring(0, 80) + "..." : interpretation;

        nodes.push({
            id: 'interpret',
            data: { label: <div className="flex flex-col items-center text-center"><Lightbulb className="w-4 h-4 mb-1" /> <span className="font-bold text-xs">Interpretation</span><span className="text-xs mt-1">{interpShort}</span></div> },
            position: { x: 300, y: 460 },
            style: { background: '#f3e8ff', color: '#6b21a8', border: '1px solid #d8b4fe', borderRadius: '8px', maxWidth: '250px' },
        });

        // Link from Changes or Penalty or Root
        let sourceId = 'root';
        if (parsed.comparison?.key_changes) sourceId = 'changes';
        else if (penaltyText) sourceId = 'penalty';

        edges.push({ id: `e-${sourceId}-interpret`, source: sourceId, target: 'interpret' });
    }

    // --- 6. Citations (Real Data) ---
    if (parsed.citations && parsed.citations.length > 0) {
        const interpretId = interpretation ? 'interpret' : 'root';

        parsed.citations.slice(0, 3).forEach((cit: any, i: number) => {
            const nodeId = `cit-${i}`;
            nodes.push({
                id: nodeId,
                data: { label: <div className="flex items-center gap-1 text-xs max-w-[140px] truncate" title={cit.title}><ScrollText className="w-3 h-3" /> {cit.title}</div> },
                position: { x: 100 + (i * 200), y: 560 }, // Spread out
                style: { background: '#f0fdf4', color: '#166534', border: '1px solid #86efac', borderRadius: '6px', fontSize: '12px', padding: '8px' },
            });
            edges.push({ id: `e-${interpretId}-${nodeId}`, source: interpretId, target: nodeId, style: { stroke: '#86efac' } });
        });
    }

    return { nodes, edges };
}

export default function LegalGraph({ messageContent }: LegalGraphProps) {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    useEffect(() => {
        const { nodes: newNodes, edges: newEdges } = generateGraphFromContent(messageContent);
        setNodes(newNodes);
        setEdges(newEdges);
    }, [messageContent, setNodes, setEdges]);

    return (
        <div style={{ width: '100%', height: '100%', minHeight: '500px' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
                attributionPosition="bottom-right"
            >
                <Background color="#e4e4e7" gap={16} />
                <Controls />
            </ReactFlow>
        </div>
    );
}

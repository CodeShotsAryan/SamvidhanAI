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
import { Scale, Gavel, FileText, AlertTriangle, Lightbulb } from 'lucide-react';

interface LegalGraphProps {
    messageContent: string;
}

// Custom Node rendering (we'll implement this inline via logic or use simple styles)
// For simplicity in this file, we'll generate nodes with standard types but custom styles in `style` prop.

function generateGraphFromContent(content: string) {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    let yOffset = 50;

    // 1. Root Node (The Topic)
    // Extract a topic or use "Legal Query"
    let topic = "Legal Interpretation";
    try {
        const parsed = JSON.parse(content);
        if (parsed.law && parsed.law.length > 10) topic = "Legal Query Analysis";
        // If comparison exists
        if (parsed.comparison) topic = parsed.comparison.title || "Comparative Analysis";
    } catch (e) { }

    nodes.push({
        id: 'root',
        type: 'input',
        data: { label: topic },
        position: { x: 250, y: 0 },
        style: {
            background: '#4f46e5', color: 'white', border: 'none', borderRadius: '12px', padding: '10px 20px', fontWeight: 'bold', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        },
    });

    // 2. Parse Content
    let bnsSection = "";
    let ipcSection = "";
    let cases = [];

    // Simplistic extraction for demo
    const bnsMatch = content.match(/BNS\s+(?:Section\s+)?(\d+)/i) || content.match(/Bharatiya\s+Nyaya\s+Sanhita\s+(?:Section\s+)?(\d+)/i);
    const ipcMatch = content.match(/IPC\s+(?:Section\s+)?(\d+)/i) || content.match(/Indian\s+Penal\s+Code\s+(?:Section\s+)?(\d+)/i);

    if (bnsMatch) bnsSection = `BNS Section ${bnsMatch[1]}`;
    if (ipcMatch) ipcSection = `IPC Section ${ipcMatch[1]}`;

    // 3. Section Nodes
    if (bnsSection) {
        nodes.push({
            id: 'bns',
            data: { label: <div className="flex items-center gap-2"><Scale className="w-4 h-4" /> {bnsSection}</div> },
            position: { x: 100, y: 150 },
            style: { background: '#dbeafe', color: '#1e3a8a', border: '1px solid #93c5fd', borderRadius: '8px' },
        });
        edges.push({ id: 'e-root-bns', source: 'root', target: 'bns', animated: true, style: { stroke: '#94a3b8' } });
    }

    if (ipcSection) {
        nodes.push({
            id: 'ipc',
            data: { label: <div className="flex items-center gap-2"><FileText className="w-4 h-4" /> {ipcSection} (Old)</div> },
            position: { x: 400, y: 150 },
            style: { background: '#ffedd5', color: '#9a3412', border: '1px solid #fdba74', borderRadius: '8px' },
        });
        edges.push({ id: 'e-root-ipc', source: 'root', target: 'ipc', animated: true, style: { stroke: '#94a3b8' } });

        // Link IPC to BNS (Transition)
        if (bnsSection) {
            edges.push({
                id: 'e-ipc-bns',
                source: 'ipc',
                target: 'bns',
                label: 'Replaced By',
                animated: false,
                markerEnd: { type: MarkerType.ArrowClosed },
                style: { strokeDasharray: '5,5' }
            });
        }
    }

    // 4. Punishment / Details (Mocked based on sections if found, else generic)
    if (bnsSection || ipcSection) {
        nodes.push({
            id: 'penalty',
            data: { label: <div className="flex flex-col items-center"><Gavel className="w-4 h-4 mb-1" /> Penalty Analysis</div> },
            position: { x: 250, y: 280 },
            style: { background: '#fef2f2', color: '#991b1b', border: '1px solid #fca5a5', borderRadius: '8px' },
        });
        if (bnsSection) edges.push({ id: 'e-bns-penalty', source: 'bns', target: 'penalty' });
        if (ipcSection) edges.push({ id: 'e-ipc-penalty', source: 'ipc', target: 'penalty' });
    }

    // 5. Interpretations / Key Insights
    nodes.push({
        id: 'interpret',
        data: { label: <div className="flex items-center gap-2"><Lightbulb className="w-4 h-4" /> Key Interpretation</div> },
        position: { x: 250, y: 380 },
        style: { background: '#f3e8ff', color: '#6b21a8', border: '1px solid #d8b4fe', borderRadius: '8px', minWidth: '150px' },
    });
    // Link from Penalty or Root
    edges.push({ id: 'e-penalty-interpret', source: bnsSection || ipcSection ? 'penalty' : 'root', target: 'interpret' });

    // 6. Citations
    try {
        const parsed = JSON.parse(content);
        if (parsed.citations && parsed.citations.length > 0) {
            parsed.citations.slice(0, 3).forEach((cit: any, i: number) => {
                const nodeId = `cit-${i}`;
                nodes.push({
                    id: nodeId,
                    data: { label: <div className="text-xs max-w-[120px] truncate" title={cit.title}>{cit.title}</div> },
                    position: { x: 50 + (i * 150), y: 480 },
                    style: { background: '#f0fdf4', color: '#166534', border: '1px solid #86efac', borderRadius: '6px' },
                });
                edges.push({ id: `e-interpret-${nodeId}`, source: 'interpret', target: nodeId });
            });
        }
    } catch (e) { }

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
            >
                <Background color="#e4e4e7" gap={16} />
                <Controls />
            </ReactFlow>
        </div>
    );
}

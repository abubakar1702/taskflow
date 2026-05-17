import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../utils/apiClient';
import { QUERY_KEYS } from '../../utils/queryKeys';
import { toast } from 'react-toastify';
import { PRIORITY_COLORS, STATUS_COLORS } from '../constants/uiColors';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 220;
const nodeHeight = 80;

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = direction === 'TB' ? 'top' : 'left';
    node.sourcePosition = direction === 'TB' ? 'bottom' : 'right';

    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };
    return node;
  });

  return { nodes, edges };
};

const CustomNode = ({ data, targetPosition, sourcePosition }) => {
  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 w-[220px] ${data.isDone ? 'border-green-400 opacity-70' : 'border-blue-500'}`}>
      <Handle type="target" position={Position.Top} className="w-16 !bg-blue-400" />
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[data.priority] || 'bg-gray-100 text-gray-800'}`}>
          {data.priority}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[data.status] || 'bg-gray-100 text-gray-800'}`}>
          {data.status}
        </span>
      </div>
      <div className="font-bold text-sm text-gray-800 truncate" title={data.title}>{data.title}</div>
      <div className="text-xs text-gray-500 mt-1">
        {data.assignees && data.assignees.length > 0 ? data.assignees.map(a => a.display_name).join(', ') : 'Unassigned'}
      </div>
      <Handle type="source" position={Position.Bottom} className="w-16 !bg-blue-400" />
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

const ProjectDependencyGraph = ({ tasks, projectId }) => {
  const queryClient = useQueryClient();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Mutation to update task dependencies in backend
  const { mutate: updateDependencies } = useMutation({
    mutationFn: async ({ taskId, dependencies }) => {
      return apiClient.patch(`/api/tasks/${taskId}/`, { dependencies_ids: dependencies });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.projectTasks(projectId) });
      toast.success('Dependencies updated');
    },
    onError: () => toast.error('Failed to update dependencies'),
  });

  useEffect(() => {
    if (!tasks) return;

    const initialNodes = tasks.map((task) => ({
      id: task.id,
      type: 'custom',
      data: {
        title: task.title,
        priority: task.priority,
        status: task.status,
        assignees: task.assignees,
        isDone: task.status === 'Done'
      },
      position: { x: 0, y: 0 },
    }));

    const initialEdges = [];
    tasks.forEach((task) => {
      if (task.dependencies && task.dependencies.length > 0) {
        task.dependencies.forEach((depId) => {
          // If task depends on depId, edge goes from depId -> task
          initialEdges.push({
            id: `e${depId}-${task.id}`,
            source: depId,
            target: task.id,
            markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
            animated: task.status !== 'Done',
            style: { stroke: '#3b82f6', strokeWidth: 2 }
          });
        });
      }
    });

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      initialNodes,
      initialEdges
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [tasks, setNodes, setEdges]);

  const onConnect = useCallback(
    (params) => {
      // Connect: source blocks target (target depends on source)
      const targetTask = tasks.find(t => t.id === params.target);
      if (!targetTask) return;

      const currentDeps = targetTask.dependencies || [];
      if (!currentDeps.includes(params.source)) {
        const newDeps = [...currentDeps, params.source];
        updateDependencies({ taskId: params.target, dependencies: newDeps });
      }

      setEdges((eds) => addEdge({
          ...params,
          markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
          animated: true,
          style: { stroke: '#3b82f6', strokeWidth: 2 }
      }, eds));
    },
    [setEdges, tasks, updateDependencies]
  );

  return (
    <div style={{ width: '100%', height: '600px' }} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
      >
        <Controls />
        <MiniMap zoomable pannable nodeClassName={(node) => (node.data.isDone ? 'bg-green-200' : 'bg-blue-200')} />
        <Background color="#aaa" gap={16} />
      </ReactFlow>
      <div className="absolute top-4 left-4 bg-white/90 p-3 rounded-lg shadow-sm border text-sm text-gray-700 z-10 pointer-events-none backdrop-blur-sm">
        <h4 className="font-bold mb-1">Task Dependency Map</h4>
        <p className="text-xs text-gray-500">Drag from a node's bottom handle to another's top handle to make it a blocker.</p>
      </div>
    </div>
  );
};

export default ProjectDependencyGraph;

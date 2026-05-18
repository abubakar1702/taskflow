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
import { FiLock } from 'react-icons/fi';

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

    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };
    return node;
  });

  return { nodes, edges };
};

const CustomNode = ({ data, isConnectable }) => {
  return (
    <div className={`px-3.5 py-2 shadow-none rounded-sm bg-white dark:bg-slate-900 border transition-all relative w-[220px] ${
      data.isDone 
        ? 'border-green-600/50 opacity-60' 
        : data.isBlocked 
          ? 'border-amber-600/50 bg-amber-50/10 dark:bg-amber-950/5' 
          : 'border-blue-600'
    }`}>
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-16 !bg-blue-400 dark:!bg-blue-600" />
      <div className="flex items-center justify-between mb-2">
        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${PRIORITY_COLORS[data.priority] || 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-200'}`}>
          {data.priority}
        </span>
        <div className="flex items-center gap-1.5">
          {data.isBlocked && (
            <span className="text-amber-600 dark:text-amber-400" title="Blocked by incomplete dependencies">
              <FiLock size={11} className="inline animate-pulse" />
            </span>
          )}
          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${STATUS_COLORS[data.status] || 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-200'}`}>
            {data.status}
          </span>
        </div>
      </div>
      <div className="font-bold text-xs text-gray-800 dark:text-slate-100 truncate" title={data.title}>{data.title}</div>
      <div className="text-[10px] text-gray-550 dark:text-slate-400 mt-1 truncate">
        {data.assignees && data.assignees.length > 0 ? data.assignees.map(a => a.display_name).join(', ') : 'Unassigned'}
      </div>
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="w-16 !bg-blue-400 dark:!bg-blue-600" />
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

    const initialNodes = tasks.map((task) => {
      const isBlocked = task.dependencies && task.dependencies.some(
        (dep) => dep && typeof dep === 'object' && dep.status !== 'Done'
      );

      return {
        id: task.id.toString(),
        type: 'custom',
        data: {
          title: task.title,
          priority: task.priority,
          status: task.status,
          assignees: task.assignees,
          isDone: task.status === 'Done',
          isBlocked: isBlocked && task.status !== 'Done'
        },
        position: { x: 0, y: 0 },
      };
    });

    const initialEdges = [];
    tasks.forEach((task) => {
      if (task.dependencies && task.dependencies.length > 0) {
        task.dependencies.forEach((dep) => {
          const depId = dep?.id ? dep.id.toString() : dep.toString();
          initialEdges.push({
            id: `e${depId}-${task.id}`,
            source: depId,
            target: task.id.toString(),
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
      setEdges((eds) => addEdge({
        ...params,
        markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
        animated: true,
        style: { stroke: '#3b82f6', strokeWidth: 2 }
      }, eds));

      const targetId = params.target;
      const sourceId = params.source;

      const targetTask = tasks.find(t => t.id.toString() === targetId);
      if (!targetTask) return;

      const currentDeps = (targetTask.dependencies || []).map(d =>
        d?.id ? d.id.toString() : d.toString()
      );

      if (!currentDeps.includes(sourceId)) {
        const newDeps = [...currentDeps, sourceId];
        updateDependencies({ taskId: targetId, dependencies: newDeps });
      }
    },
    [setEdges, tasks, updateDependencies]
  );

  const onEdgesDelete = useCallback(
    (edgesToDelete) => {
      edgesToDelete.forEach((edge) => {
        const targetId = edge.target;
        const sourceId = edge.source;

        const targetTask = tasks.find(t => t.id.toString() === targetId);
        if (!targetTask) return;

        const currentDeps = (targetTask.dependencies || []).map(d =>
          d?.id ? d.id.toString() : d.toString()
        );

        const newDeps = currentDeps.filter(id => id !== sourceId);
        updateDependencies({ taskId: targetId, dependencies: newDeps });
      });
    },
    [tasks, updateDependencies]
  );

  return (
    <div style={{ width: '100%', height: '600px' }} className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800/80 overflow-hidden shadow-none relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgesDelete={onEdgesDelete}
        nodeTypes={nodeTypes}
        connectionLineStyle={{ stroke: '#3b82f6', strokeWidth: 2 }}
        fitView
        attributionPosition="bottom-right"
      >
        <Controls />
        <MiniMap
          zoomable
          pannable
          nodeColor={(node) => {
            if (node.data.isDone) return '#22c55e';
            if (node.data.isBlocked) return '#f59e0b';
            return '#3b82f6';
          }}
          nodeClassName={(node) =>
            node.data.isDone
              ? '!fill-green-500/80'
              : node.data.isBlocked
                ? '!fill-amber-500/80'
                : 'dark:!fill-slate-700 !fill-blue-500/80'
          }
        />
        <Background color="#aaa" gap={16} />
      </ReactFlow>
      <div className="absolute top-4 left-4 bg-white/95 dark:bg-slate-900/95 p-3 rounded-lg shadow-none border border-gray-200 dark:border-slate-700 text-xs text-gray-700 dark:text-slate-300 z-10 pointer-events-none backdrop-blur-sm">
        <h4 className="font-bold mb-1 dark:text-slate-100 uppercase tracking-wider text-[10px]">Task Dependency Map</h4>
        <p className="text-[10px] text-gray-500 dark:text-slate-400">Drag from a node's bottom handle to another's top handle to make it a blocker.</p>
        <p className="text-[9px] text-gray-400 dark:text-slate-500 mt-1">Select an edge and press Backspace or Delete to remove a blocker.</p>
      </div>
    </div>
  );
};

export default ProjectDependencyGraph;

import dagre from 'dagre';

export class LayoutService {
  static calculateLayout(nodes, edges, options = {}) {
    const { 
      nodeWidth = 180, 
      nodeHeight = 80, 
      direction = 'TB',
      marginX = 50,
      marginY = 50 
    } = options;

    const graph = new dagre.graphlib.Graph();
    graph.setGraph({
      rankdir: direction,
      nodesep: 80,
      ranksep: 100,
      marginx: marginX,
      marginy: marginY
    });
    graph.setDefaultEdgeLabel(() => ({}));

    nodes.forEach(node => {
      graph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach(edge => {
      graph.setEdge(edge.source, edge.target);
    });

    dagre.layout(graph);

    const layoutedNodes = nodes.map(node => {
      const nodeWithPosition = graph.node(node.id);
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - nodeWidth / 2,
          y: nodeWithPosition.y - nodeHeight / 2
        }
      };
    });

    return layoutedNodes;
  }

  static getLevelColors() {
    return [
      '#00ffff',
      '#8b5cf6',
      '#f472b6',
      '#10b981',
      '#f59e0b',
      '#ef4444',
      '#3b82f6'
    ];
  }

  static getLevelColor(level) {
    const colors = this.getLevelColors();
    return colors[level % colors.length];
  }
}

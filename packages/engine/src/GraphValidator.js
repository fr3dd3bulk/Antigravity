export class GraphValidator {
  constructor(workflow) {
    this.workflow = workflow;
    this.nodes = workflow.nodes || [];
    this.edges = workflow.edges || [];
  }

  validate() {
    const errors = [];

    if (this.nodes.length === 0) {
      errors.push('Workflow must have at least one node');
    }

    const hasTrigger = this.nodes.some(node => 
      node.type && (
        node.type.includes('trigger') || 
        node.type === 'manual-trigger'
      )
    );

    if (!hasTrigger) {
      errors.push('Workflow must have at least one trigger node');
    }

    const nodeIds = new Set(this.nodes.map(n => n.id));
    this.edges.forEach(edge => {
      if (!nodeIds.has(edge.source)) {
        errors.push(`Edge references non-existent source node: ${edge.source}`);
      }
      if (!nodeIds.has(edge.target)) {
        errors.push(`Edge references non-existent target node: ${edge.target}`);
      }
    });

    if (this.hasCycle()) {
      errors.push('Workflow contains a cycle (circular dependency)');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  hasCycle() {
    const adjList = this.buildAdjacencyList();
    const visited = new Set();
    const recStack = new Set();

    const dfs = (nodeId) => {
      visited.add(nodeId);
      recStack.add(nodeId);

      const neighbors = adjList.get(nodeId) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor)) {
            return true;
          }
        } else if (recStack.has(neighbor)) {
          return true;
        }
      }

      recStack.delete(nodeId);
      return false;
    };

    for (const node of this.nodes) {
      if (!visited.has(node.id)) {
        if (dfs(node.id)) {
          return true;
        }
      }
    }

    return false;
  }

  buildAdjacencyList() {
    const adjList = new Map();

    this.nodes.forEach(node => {
      adjList.set(node.id, []);
    });

    this.edges.forEach(edge => {
      if (adjList.has(edge.source)) {
        adjList.get(edge.source).push(edge.target);
      }
    });

    return adjList;
  }
}

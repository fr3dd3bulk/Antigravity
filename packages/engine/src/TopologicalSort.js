export class TopologicalSort {
  constructor(workflow) {
    this.nodes = workflow.nodes || [];
    this.edges = workflow.edges || [];
  }

  sort() {
    const adjList = this.buildAdjacencyList();
    const inDegree = this.calculateInDegree(adjList);
    const queue = [];
    const result = [];

    for (const [nodeId, degree] of inDegree.entries()) {
      if (degree === 0) {
        queue.push(nodeId);
      }
    }

    while (queue.length > 0) {
      const nodeId = queue.shift();
      result.push(nodeId);

      const neighbors = adjList.get(nodeId) || [];
      for (const neighbor of neighbors) {
        inDegree.set(neighbor, inDegree.get(neighbor) - 1);
        if (inDegree.get(neighbor) === 0) {
          queue.push(neighbor);
        }
      }
    }

    if (result.length !== this.nodes.length) {
      throw new Error('Cannot create topological sort (cycle detected)');
    }

    return result;
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

  calculateInDegree(adjList) {
    const inDegree = new Map();

    this.nodes.forEach(node => {
      inDegree.set(node.id, 0);
    });

    this.edges.forEach(edge => {
      if (inDegree.has(edge.target)) {
        inDegree.set(edge.target, inDegree.get(edge.target) + 1);
      }
    });

    return inDegree;
  }

  getExecutionLevels() {
    const adjList = this.buildAdjacencyList();
    const inDegree = this.calculateInDegree(adjList);
    const levels = [];
    const queue = [];

    for (const [nodeId, degree] of inDegree.entries()) {
      if (degree === 0) {
        queue.push({ nodeId, level: 0 });
      }
    }

    while (queue.length > 0) {
      const { nodeId, level } = queue.shift();

      if (!levels[level]) {
        levels[level] = [];
      }
      levels[level].push(nodeId);

      const neighbors = adjList.get(nodeId) || [];
      for (const neighbor of neighbors) {
        inDegree.set(neighbor, inDegree.get(neighbor) - 1);
        if (inDegree.get(neighbor) === 0) {
          queue.push({ nodeId: neighbor, level: level + 1 });
        }
      }
    }

    return levels;
  }
}

import {ElkNode} from 'elkjs';
import {Graph} from './graph';

// We do our own layouts with ELK instead of using the cytoscape ELK plugin, so we can cache the layouts more easily
// https://github.com/cytoscape/cytoscape.js-elk/blob/master/src/layout.js

const ROOT_ID = 'ELK:root';

export function toELKGraph(graph: Graph): ElkNode {
  // ELK requires that children nodes be nested inside their parents, in the graph JSON.
  // Therefore, we keep track of every node we add, so that when we add a node, to we add it to its parent
  const idToNode: Map<string, ElkNode> = new Map();

  const edges = Object.entries(graph.edges).map(([id, {source, target}]) => ({id, source, target}));
  const rootNode: ElkNode = {
    id: ROOT_ID,
    children: [],
    edges: edges,
  };
  idToNode.set(ROOT_ID, rootNode);

  // Get a node, or create it, so we can add children to nodes we haven't found yet
  const getOrCreateNode = (id: string): ElkNode => {
    if (!idToNode.has(id)) {
      idToNode.set(id, {
        id,
        children: [],
      });
    }
    return idToNode.get(id);
  };
  // Iterate through the graph, adding nodes to the graph. If the node has a parent, add it to that parent's children instead of the root
  for (const [id, {parent, size}] of Object.entries(graph.nodes)) {
    const node = getOrCreateNode(id);
    Object.assign(node, size);
    getOrCreateNode(parent ?? ROOT_ID).children.push(node);
  }

  return rootNode;
}

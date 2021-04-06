// Solving Domino problems with graph theory
//
// We can model our set of dominoes as a graph.
// Specifically, the set of dominoes can be treated as an EdgeSet representation of a graph.
//
// To ask if a set of dominoes can be connected, can be rephrased as
// "Does this graph have a Euler cycle?"
//
// A euler cycle is essentially a connected graph where you can start from one node and
// pass through every other node back to the one you started with
// without repeats or backtracking.
//
// How do we determine if a graph has a Euler's cycle?
//
// Well, there is theorem (Euler's Theorem):
// "A Connected graph has an Euler cycle if and only if every vertex has even degree".
//
// So our solution now has two parts:
//
// check if every vertex (number) has an even degree (appears as a multiple of two)
// check if the dominoes can be converted to a connected graph

type Dnum = 0 | 1 | 2 | 3 | 4 | 5 | 6;

type Domino = [Dnum, Dnum];

type EdgeSet = Domino[]; // A representation of the set of edges in a graph

type AdjencyMatrix = boolean[][]; // Representation of a graph as a matrix of filled/unfilled cells

type AdjencyList = number[][]; // Representation as a list of connected nodes

type EulerCondition = (ds: EdgeSet) => boolean; // Functions that test our Euler's theory

// helper functions
const id = (x: any) => x; // yes, this returns itself.

// simplifies an edgeset down to its unique nodes by converting to and from a set
type GetNodes = (_: EdgeSet) => number[];
const getNodes: GetNodes = (dominoes) => [...new Set(dominoes.flatMap(id))];

// conversion functions
type ToAdjacencyMatrix = (_: EdgeSet) => AdjencyMatrix;
const toAdjacencyMatrix: ToAdjacencyMatrix = (dominoes) => {
  const nodes = getNodes(dominoes);
  const nodeToBool = (digit: number) =>
    nodes.findIndex((node) => node === digit);

  // empty graph
  const initMatrix: AdjencyMatrix = Array.from(Array(nodes.length), () =>
    [...new Array(nodes.length)].map((_) => false)
  );

  const fillMatrix = (graph: AdjencyMatrix, domino: Domino) => {
    const [x, y] = domino;
    graph[nodeToBool(x)]![nodeToBool(y)] = true;
    graph[nodeToBool(y)]![nodeToBool(x)] = true;

    return graph;
  };

  return dominoes.reduce(fillMatrix, initMatrix);
};

type ToAdjencyList = (_: AdjencyMatrix) => AdjencyList;
const toAdjencyList: ToAdjencyList = (graph) =>
  graph.map(
    (row) =>
      row
        .map((val, index): [number, boolean] => [index, val]) // add indexes
        .filter(([_, val]) => val) // filter unfilled cells
        .map(([index, _]) => index) // keep indexes
  );

// checks to see what nodes can be visited from other nodes.
// updates the visited array every time it gets to a new one
// if graph is connected, dfs should visit every node
type DFS = (_: AdjencyList, __: boolean[], ___: number) => void;
const depthFirstSearch: DFS = (graph, visited, node) => {
  visited[node] = true;

  graph[node]!.filter((adjacent) => !visited[adjacent]) // get unvisited nodes
    .forEach((unvisitedNode) =>
      depthFirstSearch(graph, visited, unvisitedNode)
    );
};

// determine if the domino array representing the edgeset of a graph is a connected graph
const isConnected: EulerCondition = (dominoes) => {
  const nodes = getNodes(dominoes);
  const visited: boolean[] = [...new Array(nodes.length)].map((_) => false);
  const graph = toAdjencyList(toAdjacencyMatrix(dominoes));

  // time to spelunk
  depthFirstSearch(graph, visited, 0);

  return visited.every((x) => x === true);
};

// check if every number in the dominoes has an even number of representations
const allEvenDegree: EulerCondition = (dominoes) => {
  const isEven = (n: number) => n % 2 === 0;

  // adds to map of numbers in the domino set and how many times they appear
  const addToMap = (m: Map<number, number>, key: number) =>
    m.has(key) ? m.set(key, m.get(key)! + 1) : m.set(key, 1);

  const nodeCounts: number[] = [
    ...dominoes
      .flatMap(id) // concat + flatten
      .reduce(addToMap, new Map()) // fold into a map
      .values()
  ]; // back to array

  return nodeCounts.every(isEven);
};

// PUTTING IT ALL TOGETHER
export const canChain: EulerCondition = (dominoes) =>
  dominoes.length === 0 || (allEvenDegree(dominoes) && isConnected(dominoes));

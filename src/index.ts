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
const id = (x: any) => x;

type FindVertices = (_: EdgeSet) => number[];
const findVertices: FindVertices = (dominoes) => [
  ...new Set(dominoes.flatMap(id))
];

// conversion functions
type ToAdjacencyMatrix = (_: EdgeSet) => AdjencyMatrix;
const toAdjacencyMatrix: ToAdjacencyMatrix = (dominoes) => {
  const vertices = findVertices(dominoes);
  const vertice = (x: number) => vertices.findIndex((n) => n === x);

  // empty graph
  const initGraph: AdjencyMatrix = Array.from(Array(vertices.length), () =>
    [...new Array(vertices.length)].map((_) => false)
  );

  const fillGraph = (graph: AdjencyMatrix, domino: Domino) => {
    const [x, y] = domino;
    graph[vertice(x)]![vertice(y)] = true;
    graph[vertice(y)]![vertice(x)] = true;

    return graph;
  };

  return dominoes.reduce(fillGraph, initGraph);
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
// if graph is connected, dfs should visit every node
type DFS = (_: AdjencyList, __: boolean[], ___: number) => void;
const depthFirstSearch: DFS = (graph, visited, index) => {
  visited[index] = true;

  graph[index]!.filter((index2) => !visited[index2]).forEach((n) =>
    depthFirstSearch(graph, visited, n)
  );
};

// determine if the graph of the list of dominoes is a connected graph
const isConnected: EulerCondition = (dominoes) => {
  const vertices = findVertices(dominoes);
  const visited: boolean[] = [...new Array(vertices.length)].map((_) => false);
  const graph = toAdjencyList(toAdjacencyMatrix(dominoes));

  depthFirstSearch(graph, visited, 0);

  return visited.every((x) => x === true);
};

// check if every number in the dominoes has an even number of representations
const allEvenDegree: EulerCondition = (dominoes) => {
  const isEven = (n: number) => n % 2 === 0;

  const addToMap = (m: Map<number, number>, key: number) =>
    m.has(key) ? m.set(key, m.get(key)! + 1) : m.set(key, 1);

  return [...dominoes.flatMap(id).reduce(addToMap, new Map()).values()].every(
    isEven
  );
};

const canChain: EulerCondition = (dominoes) =>
  dominoes.length === 0 || (allEvenDegree(dominoes) && isConnected(dominoes));

console.log("Test run");
console.log(canChain([]) === true);
console.log(canChain([[1, 1]]) === true);
console.log(canChain([[1, 2]]) === false);
console.log(
  canChain([
    [1, 2],
    [3, 1],
    [2, 3]
  ]) === true
);
console.log(
  canChain([
    [1, 2],
    [1, 3],
    [2, 3]
  ]) === true
);
console.log(
  canChain([
    [1, 2],
    [4, 1],
    [2, 3]
  ]) === false
);
console.log(
  canChain([
    [1, 1],
    [2, 2]
  ]) === false
);
console.log(
  canChain([
    [1, 2],
    [2, 1],
    [3, 4],
    [4, 3]
  ]) === false
);
console.log(
  canChain([
    [5, 5],
    [1, 2],
    [2, 3],
    [3, 1]
  ]) === false
);
console.log(
  canChain([
    [1, 2],
    [2, 3],
    [3, 1],
    [2, 4],
    [2, 4]
  ]) === true
);
console.log(
  canChain([
    [1, 2],
    [2, 3],
    [3, 1],
    [1, 1],
    [2, 2],
    [3, 3]
  ]) === true
);
console.log(
  canChain([
    [1, 2],
    [5, 3],
    [3, 1],
    [1, 2],
    [2, 4],
    [1, 6],
    [2, 3],
    [3, 4],
    [5, 6]
  ]) === true
);

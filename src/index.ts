// Solving Domino problems with graph theory
//
// If you imagine a chainable set of dominos as a loop, it could also be represented as a Euler cycle.
//
// A euler cycle is essentially a connected graph where you can go from one node and pass through every other node back to
// the one you started with without repeats or backtracking.
//
//There is theorem (Euler's Theorem): "A connected graph has an Euler cycle if and only if every vertex has even degree".
//
// So our solution now has two parts:
//
// check if every vertex (number) has an even degree (appears twice)
// check if the dominoes can be converted to a connected graph

type Dnum = 0 | 1 | 2 | 3 | 4 | 5 | 6;

type Domino = [Dnum, Dnum];

type Graph<T> = T[][];

// helper functions
const id = (x: any) => x;

type FindVertices = (_: Domino[]) => number[];
const findVertices: FindVertices = (dominoes) => [
  ...new Set(dominoes.flatMap(id))
];

// convert a list of dominoes to a Graph
type GraphMaker = (_: Domino[]) => Graph<number>;
const makeGraph: GraphMaker = (dominoes) => {
  const vertices = findVertices(dominoes);
  const vertice = (x: number) => vertices.findIndex((n) => n === x);

  // empty graph
  const graph: Graph<boolean> = Array.from(Array(vertices.length), () =>
    [...new Array(vertices.length)].map((_) => false)
  );

  const fillGraph = (domino: Domino) => {
    const [x, y] = domino;
    graph[vertice(x)]![vertice(y)] = true;
    graph[vertice(y)]![vertice(x)] = true;
  };

  dominoes.forEach(fillGraph);

  const toNums = (bools: boolean[]) =>
    bools
      .map((val, index): [number, boolean] => [index, val]) // add indexes
      .filter(([_, val]) => val) // filter by truth
      .map(([index, _]) => index); // keep the indexes

  return graph.map(toNums);
};

type DFS = (_: Graph<number>, __: boolean[], ___: number) => void;
const depthFirstSearch: DFS = (graph, visited, index) => {
  visited[index] = true;

  graph[index]!.filter((index2) => !visited[index2]).forEach((n) =>
    depthFirstSearch(graph, visited, n)
  );
};

type EulerCondition = (ds: Domino[]) => boolean;

// determine if the graph of the list of dominoes is a connected graph
const isConnected: EulerCondition = (dominoes) => {
  const vertices = findVertices(dominoes);
  const visited: boolean[] = [...new Array(vertices.length)].map((_) => false);
  const graph = makeGraph(dominoes);

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

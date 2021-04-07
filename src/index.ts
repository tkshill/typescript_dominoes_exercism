/* ---------------------------- INTRODUCTION --------------------------

Solving Domino problems with graph theory

Problem: Write a function `canChain` to determine whether a set of dominoes (an array of tuples) 
can be chained.

e.g. The dominoes (1, 2), (1, 3), (2, 3) can be chained together as (1, 2) (2, 3) (3, 1)
So canChain([[1, 2], [1, 3], [2, 3]]) should return true.

Conversely the dominoes (1, 2), (1, 3), (4, 4) cannot be chained because there is no domino
that can connect to (4, 4).
So canChain([[1, 2], [1, 3], [4, 4]])

Some extra rules:
- empty arrays should return true
- the ends of the domino set should also match (making a perfect loop)

Solution:

We can model our set of dominoes as a graph where each domino represents two nodes (one for 
each number on the domino) and the edge/line/arrow that connects them.

When two dominoes have the same number, that means at least one of their nodes overlap 
and they can be chained.

Thus we can rephrase the problem of "Can the dominoes chain?" to
"Do these nodes all connect?" and "Can we get from any node to every other node and back to 
the start."

It turns out, in graph theory, this type of configuration already has a name: A Euler Graph. 

A Euler graph has a Euler cycle, which is exactly what we just described; a Euler cycle is a 
path from one node on a graph that visits every other node and returns to the original graph 
WITHOUT having to backtrack.

So all we need to do to prove if our dominoes can chain is to prove that the graph those dominoes
represent has a Euler cycle.

And THAT it turns out, also has a formal definition.

"A Connected graph has an Euler cycle if and only if every vertex has even degree".

So our solution now has two parts:
- check if every vertex (number) in our set of dominoes has an even degree 
(appears as a multiple of two).

- check if the dominoes can be converted to a Connected graph

------------------------- DOMAIN -----------------------------------------
*/

type Dnum = 0 | 1 | 2 | 3 | 4 | 5 | 6;

type Domino = [Dnum, Dnum];

type EdgeSet = Domino[]; // A representation of the set of edges in a graph

type AdjencyMatrix = boolean[][]; // Representation of a graph as a matrix of filled/unfilled cells

type AdjencyList = number[][]; // Representation as a list of connected nodes

type EulerCondition = (ds: EdgeSet) => boolean; // Functions that test our Euler's theory

// -------------------------- HELPER FUNCTIONS --------------------------

const id = (x: any) => x; // yes, this returns itself.

// simplifies an edgeset down to its unique nodes by converting to and from a set
type GetNodes = (_: EdgeSet) => number[];
const getNodes: GetNodes = (dominoes) => [...new Set(dominoes.flatMap(id))];

// ------------------------- CONVERSION FUNCTIONS -------------------

type ToMatrix = (_: EdgeSet) => AdjencyMatrix;
const toMatrix: ToMatrix = (dominoes) => {
  const nodes = getNodes(dominoes);
  const nodeToBool = (digit: number) =>
    nodes.findIndex((node) => node === digit);

  // initial graph of all false values
  const initMatrix: AdjencyMatrix = Array.from(Array(nodes.length), () =>
    [...new Array(nodes.length)].map((_) => false)
  );

  const addToMatrix = (graph: AdjencyMatrix, domino: Domino) => {
    const [x, y] = domino;
    graph[nodeToBool(x)]![nodeToBool(y)] = true;
    graph[nodeToBool(y)]![nodeToBool(x)] = true;

    return graph;
  };

  return dominoes.reduce(addToMatrix, initMatrix);
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

/* --------------------- IMPLEMENTATION ---------------------------------

Our depthfirstsearch function hecks to see what nodes can be visited from other nodes.
It updates the visited array every time it gets to a new node.
If a graph is connected, dfs should visit every node.

*/
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
  const graph = toAdjencyList(toMatrix(dominoes));

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

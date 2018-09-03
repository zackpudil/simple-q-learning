const { Architect } = require('synaptic');
const visualize = require('./visualize');

const createState = (appState) => {
  const gs = appState.gridSize;
  const state = {
    agent: 0,
    prevAgent: -1,
    death: new Array(appState.gridSize*2).fill(0).map(_ => 1 + Math.floor(Math.random()*(gs*gs - 2))),
    goal: gs*gs - 1,
    path: [],
    actions: [],
    brain: new Architect.Perceptron(3, 16, 8, 1),
    lastReward: 0,
    normalize: gs*gs,
    grid: new Array(gs*gs).fill(0).map((_, i) => ({ id: i, reward: 0})), // drawing purposes only.
    lastTarget: 0 // info purposes only.
  };

  visualize(appState.visualCtx, state.brain);
  return state;
};

const getActions = (agent, gridSize) => {
  const moves = [];
  const gridx = agent % gridSize,
        gridy = Math.floor(agent/gridSize);


  if (gridx != 0) moves.push(-1);
  if (gridy != 0) moves.push(-gridSize);
  if (gridy != (gridSize - 1)) moves.push(gridSize);
  if (gridx != (gridSize - 1)) moves.push(1);

  return moves.sort(() => -0.5 + Math.random());
};

const getRewardTarget = (state, id) => {

  const rewalked = state.path.some(pid => pid == id)
    ? -0.1*state.path.filter(pid => pid == id).length : 0.2;

  return state.death.some(d => d == id) ? -1
    : state.goal == id ? 1 
    : rewalked;
};

const getReward = (state, agent, relearn = true) => {
  if(relearn) state.path.forEach(p => getReward(state, p, false));

  const visited = 0.1*state.path.filter(pid => pid == agent).length;

  const inputs = [agent/state.normalize, visited, (1 + state.lastReward)/2];
  const target = getRewardTarget(state, agent);

  state.brain.activate(inputs);
  state.brain.propagate(0.3, [(1 + target)/2]);
  const reward = state.brain.activate(inputs);
  return (-1 + 2*reward[0]);
};

const moveAgent = (state, appState) =>  {
  state.path.push(state.agent);
  state.grid.find(g => g.id == state.agent).reward = state.lastReward;

  const actions = getActions(state.agent, appState.gridSize)
    .map(a => ({ a, r: getReward(state, state.agent + a) }))
    .sort((a, b) => b.r - a.r);

  state.agent += actions[0].a;
  state.lastReward = actions[0].r;
  state.actions = actions;

    return state;
};

const isOver = (state) => {
  const r = getRewardTarget(state, state.agent);
  state.lastTarget = r;
  if(r == -1 || r == 1 || state.path.length > 1000) {
    state.agent = 0;
    state.path = [];
  }

  return state;
};

module.exports = {
  createState,
  getActions,
  getReward,
  moveAgent,
  isOver
};

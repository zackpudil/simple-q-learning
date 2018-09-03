const { Architect } = require('synaptic');
const visualize = require('./visualize');

const createState = (ctx, appState) => {
  const gs = appState.gridSize;
  const state = {
    agent: 0,
    prevAgent: -1,
    death: new Array(appState.gridSize*2).fill(0).map(_ => 1 + Math.floor(Math.random()*(gs*gs - 2))),
    goal: gs*gs - 1,
    path: [],
    ctx: ctx,
    actions: [],
    brain: new Architect.Perceptron(3, 16, 8, 1),
    lastReward: 0,
    normalize: gs*gs,
    grid: new Array(gs*gs).fill(0).map((_, i) => ({ id: i, reward: 0})), // drawing purposes only.
    lastTarget: 0 // info purposes only.
  };

  visualize(appState.$visual.getContext('2d'), state.brain);
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

  return moves.sort((a, b) => Math.random() - Math.random());
};

const getRewardTarget = (state, id) => {

  const rewalked = state.path.some(pid => pid == id)
    ? -0.1*state.path.filter(pid => pid == id).length : 0.2;

  return state.death.some(d => d == id) ? -1
    : state.goal == id ? 3
    : rewalked;
};

const getReward = (state, agent, relearn = true) => {
  if(relearn) state.path.forEach(p => getReward(state, p, false));

  const visited = state.path.filter(pid => pid == agent).length/100;

  const inputs = [agent/state.normalize, visited, state.lastReward];
  const target = getRewardTarget(state, agent);

  state.brain.activate(inputs);
  state.brain.propagate(0.3, [(1 + target)/2]);
  const reward = state.brain.activate(inputs);
  return (-1 + 2*reward[0]);
};

const moveAgent = (state, appState) =>  {
  state.path.push(state.agent);

  const actions = getActions(state.agent, appState.gridSize)
    .map(a => ({ a, r: getReward(state, state.agent + a) }))
    .sort((a, b) => b.r - a.r);

  actions.forEach(a => state.grid.find(g => g.id == state.agent + a.a).reward = a.r);

  state.lastReward = actions[0].r;
  state.agent += actions[0].a;
  state.actions = actions;

    return state;
};

const isOver = (state) => {
  const r = getRewardTarget(state, state.agent);
  state.lastTarget = r;
  if(r == -1 || r == 3 || state.path > 200) {
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

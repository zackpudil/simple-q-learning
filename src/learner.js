const { Architect } = require('synaptic');
const visualize = require('./visualize');

const createState = (appState) => {
  const gs = appState.gridSize;
  const goal = Math.floor(Math.random()*gs*gs);
  const state = {
    agent: 0,
    prevAgent: -1,
    death: new Array(appState.gridSize*2).fill(0)
      .map(_ => 1 + Math.floor(Math.random()*(gs*gs - 2)))
      .filter(d => d != goal),
    goal: goal,
    path: [],
    history: [],
    actions: [],
    brain: new Architect.Perceptron(1, 16, 8, 1),
    lastReward: 0,
    normalize: gs*gs,
    grid: new Array(gs*gs).fill(0).map((_, i) => ({ id: i, reward: 0})), 
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
  const rewalked = -0.1*state.path.filter(pid => pid == id).length;
  const pastReward = (state.history.find(h => h.id == id) || { reward: 0.2}).reward;

  return state.death.some(d => d == id) ? -1
    : state.goal == id ? 3 
    : pastReward + rewalked;
};

const getReward = (state, agent, relearn = true) => {
  if(relearn) state.history.forEach(p => getReward(state, p.id, false));

  const inputs = [agent/state.normalize];
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

  state.grid.forEach(g => g.reward = getReward(state, g.id, false));

  const h = state.history.find(h => h.id == state.agent);
  if(!h) state.history.push({ id: state.agent, reward: actions[0].r });
  else state.history.find(h => h.id == state.agent).reward = actions[0].r;

  state.agent += actions[0].a;
  state.actions = actions;

    return state;
};

const isOver = (state) => {
  const r = getRewardTarget(state, state.agent);
  state.lastTarget = r;
  if(r == -1 || r == 3 || state.path.length > 1000) {
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

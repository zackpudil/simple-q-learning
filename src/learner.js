const { Architect } = require('synaptic');
const visualize = require('./visualize');

const createState = (ctx, appState) => {
  const goal = Math.floor(Math.random()*99);
  const state = {
    agent: 0,
    prevAgent: -1,
    death: new Array(20).fill(0).map(_ => 1 + Math.floor(Math.random()*98)).filter(i => i != goal),
    goal: goal,
    path: [],
    history: [],
    grid: new Array(100).fill(0).map((_, i) => ({ id: i, reward: 0})),
    ctx: ctx,
    actions: [],
    brain: new Architect.Perceptron(2, 16, 8, 1),
    lastReward: 0
  }

  visualize(appState.$visual.getContext('2d'), state.brain);
  return state;
};

const getActions = (agent) => {
  const moves = [];
  const gridx = agent % 10,
        gridy = Math.floor(agent/10);


  if (gridx != 0) moves.push(-1);
  if (gridy != 0) moves.push(-10);
  if (gridy != 9) moves.push(10);
  if (gridx != 9) moves.push(1);

  return moves.sort((a, b) => Math.random() - Math.random());
};

const getRewardTarget = (state, id) => {
  const pastReward = state.history.some(h => h.id == id)
    ? state.history.find(h => h.id == id).reward : 0.2;

  const rewalked = state.path.some(p => p.state == id)
    ? -0.1*state.path.filter(p => p.state == id).length : 0;

  return state.death.some(d => d == id) ? -1
    : state.goal == id ? 3
    : pastReward + rewalked;
};

const getReward = (state, agent, relearn = true) => {
  if(relearn) state.history.forEach(h => getReward(state, h.id, false));

  const prev = state.history.find(h => h.id == agent);

  const inputs = [agent/100, prev ? prev.reward : 0];
  const target = getRewardTarget(state, agent);

  state.brain.activate(inputs);
  state.brain.propagate(0.3, [(1 + target)/2]);
  const reward = state.brain.activate(inputs);
  return (-1 + 2*reward[0]);
};

const moveAgent = (state) =>  {
  const actions = getActions(state.agent)
    .map(a => ({ a, r: getReward(state, state.agent + a) }))
    .sort((a, b) => b.r - a.r);

  actions.forEach(a => state.grid.find(g => g.id == state.agent + a.a).reward = a.r);

  state.agent += actions[0].a;
  state.actions = actions;
  state.path.push({ state: state.agent });

  if(!state.history.some(h => h.id == state.agent - actions[0].a))
    state.history.push({ id: state.agent - actions[0].a, reward: actions[0].r });
  else
    state.history.find(h => h.id == state.agent - actions[0].a).reward = actions[0].r;

  return state;
};

const isOver = (state) => {
  const r = getRewardTarget(state, state.agent);
  state.lastReward = r;
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

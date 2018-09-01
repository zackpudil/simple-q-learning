const createState = (ctx) => ({
  agent: 0,
  prevAgent: -1,
  death: new Array(20).fill(0).map(_ => 1 + Math.floor(Math.random()*98)),
  goal: 99,
  path: { state: -1 },
  grid: [],
  ctx: ctx,
  actions: [],
  lastReward: 0
});

const getActions = (agent) => {
  const moves = [];
  const gridx = agent % 10,
        gridy = Math.floor(agent/10);

  if (gridx != 0) moves.push(-1);
  if (gridx != 9) moves.push(1);
  if (gridy != 0) moves.push(-10);
  if (gridy != 9) moves.push(10);

  return moves;
};

const flattenPath = path => {
  if (path) return [path, ...flattenPath(path.prev)];
  return [];
}

const findPath = (path, state) => {
  if (path.state == state) return path;
  if (path.prev) return findPath(path.prev, state);

  return null;
};

const getReward = (state) => {
  if (state.death.some(d => state.agent == d)) return -1;
  else if(state.agent == state.goal) return 1;
  else if(state.grid.find(g => g.id == state.agent)) return -0.05;
  return 0.03;
};

const updateGrid = (grid, path, reward) => {
  if(path.state == -1) return;
  const g = grid.find(g => g.id === path.state);

  g.reward = (g.reward || 0) + reward;
  if(path.prev) updateGrid(grid, path.prev, reward*(reward > 0 ? 0.8 : 0.3));
};

const moveAgent = (state) =>  {
  correlateReward = (agent) =>
    getActions(agent)
      .map(a => {
        const grid = state.grid.find(g => g.id == (agent + a));
        return { a, r: grid ? grid.reward : Math.random()*0.5 }
      })
      .sort((a, b) => b.r - a.r);

  state.agent += correlateReward(state.agent)[0].a;
  state.actions = correlateReward(state.agent);
  state.path = { state: state.agent, prev: state.path };

  return state;
};

const learn = (state) => {
  const reward = getReward(state);
  state.lastReward = reward;

  let grid = state.grid.find(g => g.id == state.path.state);
  if(!grid) {
    grid = { id: state.path.state };
    state.grid.push(grid);
  }

  updateGrid(state.grid, state.path, reward);
  return state;
};

const isOver = (state) => {
  const r = getReward(state);
  if(r == -1 || r == 1) {
    state.agent = 0;
    state.path = { state: -1 };
  }

  return state;
};

module.exports = {
  createState,
  getActions,
  findPath,
  flattenPath,
  getReward,
  updateGrid,
  moveAgent,
  learn,
  isOver
};

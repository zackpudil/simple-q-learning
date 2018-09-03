require('bootstrap/dist/css/bootstrap.min.css');

const { drawCircle, drawLine, drawRect, drawTriangle } = require('./render');
const { createAppState, checkEvents, events, update }= require('./app');
const { createState, moveAgent, isOver } = require('./learner');

const world = 500;

const draw = (state, appState) => {

  const gs = appState.gridSize;
  const ss = world/gs;

  const coords = (grid) => {
    return [
      (grid % gs)*ss + ss/2,
      Math.floor(grid/gs)*ss + ss/2
    ];
  }

  for(let i = 1; i < appState.gridSize; i++) {
    drawLine(state.ctx, [0, i*ss], [world, i*ss]);
    drawLine(state.ctx, [i*ss, 0], [i*ss, world]);
  }

  state.grid.forEach(g => {
    drawRect(state.ctx, coords(g.id, ).map(i => i - ss/2), [ss, ss], 
      g.reward < 0 ? "red" : "blue", 
      Math.min(0.5, Math.abs(g.reward)));
  });

  const agentRadius = Math.max(5, 100/gs);
  const goalRadius = Math.max(7.5, 150/gs);
  const deathRadius = Math.max(10, 200/gs);
  const pathRadius = Math.max(2, 50/gs);

  drawCircle(state.ctx, coords(state.agent), agentRadius, "blue");
  drawCircle(state.ctx, coords(state.goal), goalRadius, "green");
  state.death.forEach(d => drawTriangle(state.ctx, coords(d), deathRadius, "red"));
  state.path.forEach(id => drawCircle(state.ctx, coords(id), pathRadius, "green"));
};

const loop = (state, appState) => {
  drawRect(state.ctx, [0, 0], [world, world], "white");

  if (!appState.pause && !appState.reload) {
    state = moveAgent(state, appState);
    appState = update(appState, state);
    state = isOver(state);
  }

  draw(state, appState);

  if (appState.reload) {
    state = createState(state.ctx, appState);
    appState.reload = false;
  }

  appState = checkEvents(appState);
  if(appState.time >= 25)
    setTimeout(() => requestAnimationFrame(() => loop(state, appState)), appState.time);
  else
    requestAnimationFrame(() => loop(state, appState));
};

const main = (doc) => {
  const ctx = doc.getElementById("canvas").getContext("2d");;
  const appState = events(createAppState(doc));
  const state = createState(ctx, appState);

  loop(state, appState);
};

main(document);

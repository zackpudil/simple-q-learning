require('bootstrap/dist/css/bootstrap.min.css');

const { drawCircle, drawLine, drawRect, drawTriangle } = require('./render');
const { createAppState, startVisualizer, events, clear, update }= require('./app');
const { createState, moveAgent, learn, isOver } = require('./learner');

const world = 500;

const coords = (grid) => {
  return [
    (grid % 10)*50 + 25,
    Math.floor(grid/10)*50 + 25
  ];
}

const draw = (state) => {
  for(let i = 1; i < 10; i++) {
    drawLine(state.ctx, [0, i*50], [world, i*50]);
    drawLine(state.ctx, [i*50, 0], [i*50, world]);
  }

  state.grid.forEach(g => {
    drawRect(state.ctx, coords(g.id).map(i => i - 25), [50, 50], 
      g.reward < 0 ? "red" : "blue", 
      Math.min(0.5, Math.abs(g.reward)));
  });

  drawCircle(state.ctx, coords(state.agent), 10, "blue");
  drawCircle(state.ctx, coords(state.goal), 15, "green");
  state.death.forEach(d => drawTriangle(state.ctx, coords(d), 20, "red"));
  state.path.forEach(p => drawCircle(state.ctx, coords(p.state), 3, "green"));
};

const loop = (state, appState) => {
  drawRect(state.ctx, [0, 0], [world, world], "white");

  if (!appState.pause) {
    state = moveAgent(state);
    appState = update(appState, state);
  }

  draw(state);
  state = isOver(state);

  if (appState.reload) {
    state = createState(state.ctx, appState);
    appState.reload = false;
  }

  if(appState.time >= 25)
    setTimeout(() => loop(state, appState), appState.time);
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

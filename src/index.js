require('bootstrap/dist/css/bootstrap.min.css');

const { drawCircle, drawLine, drawRect, drawTriangle } = require('./render');
const { createAppState , events, clear, update }= require('./app');
const { createState, moveAgent, learn, flattenPath, isOver } = require('./learner');

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

  drawCircle(state.ctx, coords(state.agent), 10, "blue");
  drawRect(state.ctx, coords(state.goal).map(i => i - 10), [20, 20], "green");
  state.death.forEach(d => drawTriangle(state.ctx, coords(d), 20, "red"));
  flattenPath(state.path).forEach(p => drawCircle(state.ctx, coords(p.state), 3, "green"));

  state.grid.forEach(g => {
    drawRect(state.ctx, coords(g.id).map(i => i - 25), [50, 50], 
      g.reward < 0 ? "red" : "blue", 
      Math.min(0.5, Math.abs(g.reward)));
  });
};

const loop = (state, appState) => {
  drawRect(state.ctx, [0, 0], [world, world], "white");

  if (!appState.pause) {
    state = moveAgent(state);
    state = learn(state);

    appState = update(appState, state);
  }

  draw(state);
  state = isOver(state);

  if (appState.reload) {
    state = createState(state.ctx);
    appState.reload = false;
  }

  if(appState.time >= 25)
    setTimeout(() => loop(state, appState), appState.time);
  else
    requestAnimationFrame(() => loop(state, appState));
};

const main = (doc) => {
  const ctx = doc.getElementById("canvas").getContext("2d");;
  loop(createState(ctx), events(createAppState(doc)));
};

main(document);

const createAppState = (doc) => ({
  reload: true,
  pause: false,
  iters: 0,
  deaths: 0,
  wins: 0,
  longestPath: 0,
  time: 50,
  gridSize: 10,
  events: {},
  mainCtx: doc.getElementById('canvas').getContext('2d'),
  visualCtx: doc.getElementById('visual').getContext('2d'),
  $reload: doc.getElementById('reload'),
  $pause: doc.getElementById('pause'),
  $wins: doc.getElementById('wins'),
  $deaths: doc.getElementById('death'),
  $iters: doc.getElementById('iters'),
  $time: doc.getElementById('time'),
  $longestPath: doc.getElementById('longestPath'),
  $actions: doc.getElementById('actions'),
  $gridHigh: doc.getElementById('gridHigh'),
  $gridLow: doc.getElementById('gridLow'),
  $gridSize: doc.getElementById('gridSize')
});

const events = (appState) => {
  appState.$reload.onclick = () => {
    appState.events.reload = true;
    appState.events.pause = appState.pause;
  };

  appState.$pause.onclick = ()  => {
    appState.events.pause = !appState.pause;
    appState.$pause.innerHTML = !appState.pause ? 'Play' : 'Pause';
  }

  appState.$time.oninput = () => {
    appState.events.time = new Number(appState.$time.value);
  }

  appState.$gridSize.oninput = () => {
    appState.events.reload = true;
    appState.events.gridSize = new Number(appState.$gridSize.value)*5;
  };

  return appState;
};

const checkEvents = (appState) => {
  if(appState.events.reload) appState = clear(appState);
  Object.keys(appState.events)
    .filter(k => k != "reload")
    .forEach(k => {
      appState[k] = appState.events[k];
    });

  appState.events = {};
  return appState;
};

const clear = (appState) => {
  appState.reload = true;
  appState.pause = false;
  appState.iters = 0;
  appState.wins = 0;
  appState.deaths = 0;
  appState.longestPath = 0;

  appState.$iters.innerHTML = 0;
  appState.$wins.innerHTML = 0;
  appState.$deaths.innerHTML = 0;
  appState.$longestPath.innerHTML = 0;
  appState.$actions.innerHTML = '';
  appState.$gridHigh.innerHTML = 0;
  appState.$gridLow.innerHTML = 0;

  return appState;
};

const update = (appState, state) => {
  appState = showGrid(appState, state.grid);
  appState = showActions(appState, state.actions);
  appState = updateIter(appState);
  appState = updatePath(appState, state.path);

  if (state.lastTarget == 3) appState = updateWin(appState);
  if (state.lastTarget == -1 || state.path.length > 1000) appState = updateDeath(appState);
  return appState;
};

const updateIter = (appState) => {
  appState.iters++;
  appState.$iters.innerHTML = appState.iters;
  return appState;
};

const updateDeath = (appState) => {
  appState.deaths++;
  appState.$deaths.innerHTML = appState.deaths;
  if(appState.deaths >= 50 && appState.wins == 0) {
    return clear(appState)
  }

  appState.$iters

  return appState;
};

const updateWin = (appState) => {
  appState.wins++;
  appState.$wins.innerHTML = appState.wins;

  if (appState.wins > appState.deaths + 20) {
    return clear(appState);
  }

  return appState;
}

const updatePath = (appState, path) => {
  let pathLength = path.length;

  if (pathLength > appState.longestPath) appState.longestPath = pathLength;

  appState.$longestPath.innerHTML = appState.longestPath;
  return appState;
};

const showGrid = (appState, grid) => {
  const grids = grid.sort((a, b) => b.reward - a.reward);
  const gl = grids.length - 1;
  appState.$gridHigh.innerHTML = grids[0] ? grids[0].id : "";
  appState.$gridLow.innerHTML = grids[gl] ? grids[gl].id : "";

  return appState;
};

const showActions = (appState, actions) => {
  const display = {
      up:    (actions.find(a => a.a == -appState.gridSize) || {r: 100}).r,
      down:  (actions.find(a => a.a ==  appState.gridSize) || {r: 100}).r,
      left:  (actions.find(a => a.a ==  -1) || {r: 100}).r,
      right: (actions.find(a => a.a ==   1) || {r: 100}).r
    };

    let str = '';
    for (i in display) {
      const d = display[i] == 100 ? 'N/A' : display[i].toFixed(4);
      str += i + ": " + d + "<br />";
    }

  appState.$actions.innerHTML = str;
  return appState;
};

module.exports = {
  createAppState,
  events,
  checkEvents,
  clear,
  update,
  updateIter,
  updateDeath,
  updateWin,
  updatePath,
  showGrid,
  showActions
};

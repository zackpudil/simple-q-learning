const createAppState = (doc) => ({
  reload: true,
  pause: false,
  iters: 0,
  deaths: 0,
  wins: 0,
  longestPath: 0,
  time: 50,
  $reload: doc.getElementById('reload'),
  $pause: doc.getElementById('pause'),
  $wins: doc.getElementById('wins'),
  $deaths: doc.getElementById('death'),
  $iters: doc.getElementById('iters'),
  $time: doc.getElementById('time'),
  $longestPath: doc.getElementById('longestPath'),
  $actions: doc.getElementById('actions'),
  $gridHigh: doc.getElementById('gridHigh'),
  $gridLow: doc.getElementById('gridLow')
});

const events = (appState) => {
  appState.$reload.onclick = () => appState = clear(appState);
  appState.$pause.onclick = ()  => {
    appState.pause = !appState.pause;
    appState.$pause.innerHTML = appState.pause ? 'Play' : 'Pause';
  }
  appState.$time.onchange = () => appState.time = appState.$time.value;

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

  if (state.lastReward == 1) appState = updateWin(appState);
  if (state.lastReward == -1) appState = updateDeath(appState);
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

  if (appState.wins > appState.deaths) {
    return clear(appState);
  }

  return appState;
}

const updatePath = (appState, path) => {
  let pathLength = 0;
  const countPath = (path) => {
    pathLength++;
    if(path.prev) return countPath(path.prev);
  };
  countPath(path);

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
      up:    (actions.find(a => a.a == -10) || {r: 100}).r,
      down:  (actions.find(a => a.a ==  10) || {r: 100}).r,
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
  clear,
  update,
  updateIter,
  updateDeath,
  updateWin,
  updatePath,
  showGrid,
  showActions
};

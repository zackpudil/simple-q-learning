# Deep Q Learning

## Installing and running
Uses webpack dev server.
```
npm install
npm start
```
navigate to http://localhost:8080

## (Not Really) Q Learning
This is an experiment on a variation of the [Deep Reinforcement Learning Algorithm](https://skymind.ai/wiki/deep-reinforcement-learning).  In this example, we instead use a [ANN](https://en.wikipedia.org/wiki/Artificial_neural_network) to approximate the reward based on the given state and path traveled by agent. The purpose of this would be to possibly extend this to a system where the possible actions given a state are continuous instead of discrete. This would allow the algorithm to generate a random subset of the infinite set of actions and evaluate the result using the agents history and immediate reward of performing the action.  This allows the agent to randomly find, and remember, high reward states without having to evaluate every single action in the state. Note, this example only has at most 4 actions per state to demonstrate it works for the common DeepQ example.

## Explanation of App
The app is split up into two parts, The first part is the actual algorithm in `learning.js`, and the second part is to handle the UI in `app.js`.  The UI handling just uses VanillaJS for now. The canvas drawing and linking of the two parts is handled in `index.js`.  Here's it in action:

![screencap](https://raw.githubusercontent.com/zackpudil/simple-q-learning/master/screencap.gif)


The grid on the top is showing the result of the learning algorithm, while the tree graph on the left is a visualization of the network (for debugging purposes) which is done in `visualizer.js`.  

### Explanation of Algorithm
The basics of the algorithm is shown below:

![FlowChart](https://raw.githubusercontent.com/zackpudil/simple-q-learning/master/flowchart.png)

To simplify in steps:
1. Get all Actions for current "state".  In this case "state" is grid # and actions are `[up, down, left, right]`
2. rewardAction = map Actions
   1. calculate transient new state (currentState + action)
   2. calculate target reward (1 if goal, -1 if death, -0.1 if traveled before, 0.2 otherwise)
   3. train ANN with target
      1. recalculate target and retrain on entire path
   4. Reward = Evaluation ANN (state, last reward, # times state has been visited)
   5. return (Action, Reward)
3. Choose (Action, Reward) wth highest Reward.
4. Update LastReward = Reward
5. Update State += Action
6. Go to Step 1


The ANN itself uses 3 node input layer, 1 node output layer and 2 hidden layers.  The logic for back propagation and activation algorithms was provided by the [synaptic](https://github.com/cazala/synaptic) package.  See below:

![ANN](https://raw.githubusercontent.com/zackpudil/simple-q-learning/master/ANN.png)

Note: The inputs and outputs are normalized as such:
```
  Reward = (-1 + 2 * ANN Output)
  Target (Reward) = (1 + Reward)/2
  Input (State) = Grid # / Number of Grids
  Input (Last Reward) = Last Reward
  Input (# times State has been visited) = (# times State has been visited)/10
```


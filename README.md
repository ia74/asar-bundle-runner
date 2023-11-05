# asar-bundle-runner

This is a simple test to extend [Freedeck](https://github.com/Freedeck/Freedeck)'s plugin functionality.
This concept works entirely on the fact that you can include node_modules in an asar bundle without adding that to a Node project itself.  

## Testing with asar-test

You'll need to go to that directory and `npm i` to install robotjs.  
If you want, make any changes you want.  

### `node .` doesnt work

The entrypoint in package.json is set to be the config file `config.freedeck` by default. Don't change this as this [the config] is how Freedeck/AsarBundleRunner will identify entrypoints in the code. If you want to run your bundle you'll need to run `node index.js` (or replace index.js with your entrypoint's name.)  

## Hooks

Since this is going to be part of Freedeck soon, there are built in hooks that will allow you to do things with Freedeck such as on button press, or on load. Of course, this is just a PoC right now, so none of that will work *now*.

## Using AsarBundleRunner

If you want to use this same setup, your files will need to look the same way. Your entrypoint should be a `module.exports` with a JSON object that at minimum has `entrypoint`. See example.

```js
// config.freedeck
module.exports = {
 entrypoint: "index.js"
}
```

```js
// index.js
module.exports = {
 name: 'RobotJS asar Test',
 exec: () => {
  const robotjs = require('robotjs');
  console.log('Moving mouse to 0, 0')
  setInterval(() => {
   robotjs.moveMouse(0, 0);
  },250)
 },
 onButtonPressed: (button) => {
  console.log(button)
 }
}
```

Of course, this may be expanded on later.

## Uhh why is it packaging asar

This system is intended to package the `asar-test` file, then load it into memory, then run it.
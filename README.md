# Asar Bundle Runner 

AsarBundleRunner (abbrev. ABR) is a simple way to extend your program's functionality through plugins with ASAR bundles!  

## Disclaimer

I am not responsible for any shenanigans or tomfoolery related to your computer being infected with a virus. Don't trust random sources as this code will run and once damage is done, there may be no going back.  

## Setting up ABR

Your .asar bundle file tree can look any way, as long as it has these core components.

```
asarbundle:
  - entrypoint.js
  - config.js
  - package.json
```

These asar bundles are node projects, thus they will have a `package.json`. This needs to be setup accordingly.  

Your `package.json`'s `main` should be your `config.js` file.  

Inside of `config.js` you'll want this:

```js
module.exports = {
  entrypoint: 'entrypoint.js' // This can be replaced as long as this file actually exists.
}
```

There's a little bit of setup with `entrypoint.js` however. It needs to be a module as well. See example below.  

```js
module.exports = {
  exec: () => {
    console.log('Change this and add your own code!')
  }
}
```

## Using ABR

Using ABR is extremely simple. Here's examples of how to use it.  

Simple Example:

```js
const abr = require('asar-bundle-runner');

abr.extract('MyCoolBundle.asar'); // This loads the bundle into memory and extracts it.

abr.run('MyCoolBundle.asar'); // This actually *runs* the bundle.
```

Advanced Example

```js
const abr = require('asar-bundle-runner');

abr.extract('MyCoolBundle.asar'); // This loads the bundle into memory and extracts it.

abr.modules['MyCoolBundle.asar'].exec(); // This accesses the direct `entrypoint.js` contents.

// You could even do something like
abr.modules['MyCoolBundle.asar'].
```
# Exopublish
A Publishing tool for Exosite Widget JavsScripts and Lua Scripts.

## What it does
Using a config file containing mappings of widget JavaScript or Lua script files to the corresponding Exosite identifiers (e.g. Resource-Id), it can upload the script files to the appropriate location in Exosite.

## Why Exopublish?
Initially it was a part of [Exoedit](https://github.com/teggno/exoedit) but it turned out that the publishing features might also be usable to be used from code, for example for automated deployment.

## Installation
`npm install exopublish`

## Usage
```javascript
var exopublish = require("exopublish");

// Get the relative paths of all configured domain widget script files:
exopublish.getDomainWidgets().then(function(paths) {
    // do something with paths (which is an array of paths to the files)
});

// Get the relative paths of all configured portal widget script files:
exopublish.getPortalWidgets().then(function(paths) {
    // do something with paths (which is an array of paths to the files)
});

// Get the relative paths of all configured Device Lua script files:
exopublish.getDeviceLuaScripts().then(function(paths) {
    // do something with paths (which is an array of paths to the files)
});

// Publish a script to exosite:
exopublish.publishOne(
    "<path as written in the config file>", 
    "<code to publish>", 
    "exositeUser@example.com", 
    "myPassword")
    .then(function(){
        console.log("Published the script");
    });
```

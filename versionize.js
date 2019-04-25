const fs = require('fs');
const logError = require('./utils.js').logError;
const logSuccess = require('./utils.js').logSuccess;

const ARG_RE = /^--([-\w]+)(?:=(.*))?$/;

const PATH = './package.json';
const PROJECT = process.argv[process.argv.length - 1];
const MODULE = 'corporate-services';
const ARGS = {};

for (let index = 2 ; index < process.argv.length ; ++index) {
  const regMatch = ARG_RE.exec(process.argv[index]);
  if (regMatch) {
    ARGS[regMatch[1]] = regMatch[2] === undefined ? true : regMatch[2];
  }
}

function getContents(callback) {
  fs.readFile(PATH, function (error, data) {
    if(!logError(error, 'Could not read \'package.json\'')) {
      callback(JSON.parse(data.toString()));
    }
  });
}



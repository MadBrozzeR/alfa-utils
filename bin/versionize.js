#! /usr/bin/env node
const versionize = require('../versionize.js');

const ARG_RE = /^--([-\w]+)(?:=(.*))?$/;

const TARGET = process.argv[process.argv.length - 1];
const ARGS = {};
const FREE = [];

for (let index = 2 ; index < process.argv.length ; ++index) {
  const regMatch = ARG_RE.exec(process.argv[index]);
  if (regMatch) {
    ARGS[regMatch[1]] = regMatch[2] === undefined ? true : regMatch[2];
  } else {
    FREE.push(process.argv[index]);
  }
}
if (!ARGS.root && FREE.length) {
  ARGS.root = FREE[FREE.length - 1];
}

const MODULE = ARGS.main || 'corporate-services';

versionize({
    main: MODULE,
    project: ARGS.root,
    extra: ARGS.extra && ARGS.extra.split(',')
});

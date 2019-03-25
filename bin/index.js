#! /usr/bin/env node
const { copy, restore } = require('../index.js');

const ARG_RE = /^--([\w-]+)(?:=(.+))?$/;

const config = {};

for (let index = 0; index < process.argv.length; ++index) {
    const regMatch = ARG_RE.exec(process.argv[index]);
    if (regMatch) {
        config[regMatch[1]] = regMatch[2] === undefined ? true : regMatch[2];
    }
}

if (config.reset) {
    restore(config);
} else {
    copy(config);
}

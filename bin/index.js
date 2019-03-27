#! /usr/bin/env node
const { copy, restore } = require('../index.js');

const ARG_RE = /^--([\w-]+)(?:=(.+))?$/;

const config = {};

const knownArgs = {
    'root-required': 'boolean',
    root: 'string',
    module: 'string',
    dev: 'string'
};

for (let index = 0; index < process.argv.length; ++index) {
    const regMatch = ARG_RE.exec(process.argv[index]);
    if (regMatch) {
        if (regMatch[1] in knownArgs) {
            config[regMatch[1]] = regMatch[2] === undefined ? true : regMatch[2];
        } else {
            process.stderr.write(`Unknown argument: \x1b[0;31m--${regMatch[1]}\x1b[0m\n`);
            process.exit(1);
        }
    }
}

if (config.reset) {
    restore(config);
} else {
    copy(config);
}

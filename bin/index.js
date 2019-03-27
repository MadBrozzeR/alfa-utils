#! /usr/bin/env node
const { copy, restore } = require('../index.js');
const { COLOR } = require('../styles.js');

const ARG_RE = /^--([\w-]+)(?:=(.+))?$/;

const config = {};

const knownArgs = {
    'root-required': 'boolean',
    root: 'string',
    module: 'string',
    dev: 'string',
    restore: 'boolean'
};

for (let index = 0; index < process.argv.length; ++index) {
    const regMatch = ARG_RE.exec(process.argv[index]);
    if (regMatch) {
        const argumentName = regMatch[1];
        const argumentValue = regMatch[2] === undefined ? true : regMatch[2];

        if (argumentName in knownArgs) {
            if (typeof argumentValue === knownArgs[argumentName]) {
                config[argumentName] = argumentValue;
            } else {
                process.stderr.write(
                    `Argument ${COLOR.RED}--${argumentName}${COLOR.CLEAR} ` +
                    `must be of ${COLOR.RED}${knownArgs[argumentName]}${COLOR.CLEAR} type\n`
                );
                process.exit(1);
            }
        } else {
            process.stderr.write(`Unknown argument: ${COLOR.RED}--${regMatch[1]}${COLOR.CLEAR}\n`);
            process.exit(1);
        }
    }
}

if (config.restore) {
    restore(config);
} else {
    copy(config);
}

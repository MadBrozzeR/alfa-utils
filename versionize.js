const fs = require('fs');
const logError = require('./utils.js').logError;
const logSuccess = require('./utils.js').logSuccess;
const COLOR = require('./styles.js').COLOR;

const PATH = './package.json';

function getLocalPackageContents (callback) {
  fs.readFile(PATH, function (error, data) {
    if(!logError(error, 'Could not read \'package.json\'')) {
      callback(JSON.parse(data.toString()));
    }
  });
}

function changeModuleVersion (project, modules, callback) {
  const target = project + '/package.json';
  fs.readFile(target, function (error, data) {
    if (!logError(error, 'Could not read remote \'package.json\'')) {
      const originalData = data.toString();
      let result = originalData;

      Object.keys(modules).forEach(function (name) {
        const regExp = new RegExp(`(\\s+)"${name}": "([.\\d^~x*]+)"`);

        result = result.replace(regExp, function (found, indent, oldVersion) {
          if (oldVersion === modules[name]) {
            process.stdout.write(
              `${COLOR.YELLOW}${name}${COLOR.CLEAR} module is already ` +
              `at version ${COLOR.GREEN}${modules[name]}${COLOR.CLEAR}\n`
            );
            return found;
          } else {
            process.stdout.write(
              `${COLOR.YELLOW}${name}${COLOR.CLEAR} version changed ` +
              `from ${COLOR.RED}${oldVersion}${COLOR.CLEAR} ` +
              `to ${COLOR.GREEN}${modules[name]}${COLOR.CLEAR}\n`
            );
            return `${indent}"${name}": "${modules[name]}"`;
          }
        });
      });
      if (result === originalData) {
        process.stdout.write('File "' + target + '" left without changes\n');
        callback();
      } else {
        fs.writeFile(target, result, function (error) {
            if (!logError(error, 'Failed to write to target file')) {
                callback();
            }
        });
      }
    }
  });
}

function getNode (packageData, path) {
    const splittedPath = path.split('/');
    const result = {
        data: packageData,
        key: null
    };

    for (let index = 0 ; index < splittedPath.length ; ++index) {
        result.key = splittedPath[index];
        result.data = result.data[result.key];

        if (!result.data) {
            return null;
        }
    }

    return result;
}

function versionize (options) {
    const main = options.main;
    const extra = options.extra;
    const project = options.project;

    if (!project) {
        process.stderr.write(COLOR.RED + 'Root project is required\n' + COLOR.CLEAR);
        process.exit(1);
    }

    getLocalPackageContents(function (packageData) {
        const mainVersion = getNode(packageData, 'version').data;
        const modules = {};

        modules[main] = mainVersion;
        extra.forEach(function (item) {
            const node = getNode(packageData, item);

            if (node && typeof node.data === 'string') {
                modules[node.key] = node.data;
            }
        });

        changeModuleVersion(project, modules, function () {
            process.stdout.write(COLOR.GREEN + 'Versions update process complete\n' + COLOR.CLEAR);
        });
    });
}

module.exports = versionize;

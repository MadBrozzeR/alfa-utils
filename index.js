const fs = require('fs');
const { logError, logSuccess, copyDir, removeDir } = require('./utils.js');

const PROJECT = '.';
const MODULE = 'corporate-services';
const BACKUP_SUFFIX = '-bu';

const DEV = '../corporate-services/.publish';

function projectCheck(props) {
    if (props['root-required'] && !props.root) {
        logError(
            new Error('Project required'),
            'Project is required by `--root-required` argument but it wasn\'t provided'
        );
        process.exit(1);
    }
}

function getPath(props) {
    const moduleName = props.module || MODULE;
    const module = (props.root || PROJECT) + '/node_modules/' + moduleName;

    return {
        backup: module + BACKUP_SUFFIX,
        dev: props.dev || DEV,
        module,
        moduleName
    };
}

function proceed(path) {
    copyDir(path.dev, path.module, function (error) {
        if (!logError(error, 'Module cannot be copied from DEV')) {
            logSuccess('Module copied from DEV');
            copyDir(`${path.backup}/node_modules`, `${path.module}/node_modules`, function (error) {
                if (!logError(error, 'Failed to copy \'node_modules\' from backup directory')) {
                    logSuccess(`Module '${path.moduleName}' copied successfully`);
                }
            });
        }
    });
}

function copy(props = {}) {
    projectCheck(props);
    const path = getPath(props);

    fs.access(path.backup, function (error) {
        if (error) {
            fs.rename(path.module, path.backup, function (error) {
                if (!logError(error, 'Modlule cannot be moved')) {
                    logSuccess('Module moved to backup');
                    proceed(path);
                }
            });
        } else {
            removeDir(path.module, function (error) {
                if (!logError(error, 'Module cannot be removed')) {
                    logSuccess('Module removed');
                    proceed(path);
                }
            });
        }
    });
}

function restore(props = {}) {
    projectCheck(props);
    const path = getPath(props);

    fs.access(path.backup, function (error) {
        if (!logError(error, 'Nothing to reset. No backup directory was found')) {
            removeDir(path.module, function (error) {
                if (!logError(error, 'Services directory cannot be removed')) {
                    logSuccess('Module directory removed');
                    fs.rename(path.backup, path.module, function (error) {
                        if (!logError(error, 'Backup directory cannot be moved')) {
                            logSuccess('Backup successfully restored');
                        }
                    });
                }
            });
        }
    });
}

module.exports.copy = copy;
module.exports.restore = restore;

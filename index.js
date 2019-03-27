const fs = require('fs');
const { logError, logSuccess, copyDir, removeDir } = require('./utils.js');

const PROJECT = '.';
const MODULE = 'corporate-services';
const BACKUP_SUFFIX = '-bu';

const DEV = '../corporate-services/.publish';
// const DEV_THRIFT_SERVICES = '../thrift-services/.publish';

function projectCheck(props) {
    if (props['project-required'] && !props.project) {
        logError(
            new Error('Project required'),
            'Project is required by `--project-required` argument but it wasn\'t provided'
        );
        process.exit(1);
    }
}

function getPath(props) {
    const module = (props.root || PROJECT) + '/node_modules/' + (props.module || MODULE);

    return {
        module,
        backup: module + BACKUP_SUFFIX,
        dev: props.dev || DEV
    };
}

function proceed(path) {
    copyDir(path.dev, path.module, function (error) {
        if (!logError(error, 'Services cannot be copied from DEV')) {
            logSuccess('Services copied from DEV');
            copyDir(`${path.backup}/node_modules`, `${path.module}/node_modules`, function (error) {
                if (!logError(error, 'Failed to copy \'node_modules\' from backup directory')) {
                    logSuccess('Services copied successfully');
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
                if (!logError(error, 'Services cannot be moved')) {
                    logSuccess('Services moved to backup');
                    proceed(path);
                }
            });
        } else {
            removeDir(path.module, function (error) {
                if (!logError(error, 'Services cannot be removed')) {
                    logSuccess('Services removed');
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
                    logSuccess('Services directory removed');
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

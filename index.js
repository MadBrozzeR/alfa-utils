const fs = require('fs');
const { logError, logSuccess, copyDir, removeDir } = require('./utils.js');

const PROJECT = '.';
const SERVICES = '/node_modules/corporate-services';
const BACKUP = `${SERVICES}-bu`;

const DEV_SERVICES = '../corporate-services/.publish';
// const DEV_THRIFT_SERVICES = '../thrift-services/.publish';

function proceed(props) {
    const services = props.services || DEV_SERVICES;
    const project = props.project || PROJECT;
    const projectServices = project + SERVICES;
    const projectBackup = project + BACKUP;

    copyDir(services, projectServices, function (error) {
        if (!logError(error, 'Services cannot be copied from DEV')) {
            logSuccess('Services copied from DEV');
            copyDir(`${projectBackup}/node_modules`, `${projectServices}/node_modules`, function (error) {
                if (!logError(error, 'Failed to copy \'node_modules\' from backup directory')) {
                    logSuccess('Services copied successfully');
                }
            });
        }
    });
}

function copy(props = {}) {
    const project = props.project || PROJECT;
    const projectServices = project + SERVICES;
    const projectBackup = project + BACKUP;

    fs.access(projectBackup, function (error) {
        if (error) {
            fs.rename(projectServices, projectBackup, function (error) {
                if (!logError(error, 'Services cannot be moved')) {
                    logSuccess('Services moved to backup');
                    proceed(props);
                }
            });
        } else {
            removeDir(projectServices, function (error) {
                if (!logError(error, 'Services cannot be removed')) {
                    logSuccess('Services removed');
                    proceed(props);
                }
            });
        }
    });
}

function restore(props = {}) {
    const project = props.project || PROJECT;
    const projectServices = project + SERVICES;
    const projectBackup = project + BACKUP;

    fs.access(projectBackup, function (error) {
        if (!logError(error, 'Nothing to reset. No backup directory was found')) {
            removeDir(projectServices, function (error) {
                if (!logError(error, 'Services directory cannot be removed')) {
                    logSuccess('Services directory removed');
                    fs.rename(projectBackup, projectServices, function (error) {
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

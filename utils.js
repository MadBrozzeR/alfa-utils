const fs = require('fs');

const COLOR = {
    CLEAR: '\x1b[0m',
    RED: '\x1b[0;31m',
    GREEN: '\x1b[0;32m'
};

function logError(error, message) {
    if (error) {
        process.stderr.write(`${COLOR.RED}${message}${COLOR.CLEAR}\nError:`);
        console.error(error); // eslint-disable-line no-console
    }

    return !!error;
}

function logSuccess(message) {
    process.stdout.write(`${COLOR.GREEN}${message}${COLOR.CLEAR}\n`);
}

function copyDir(source, dest, callback) {
    fs.mkdir(dest, function (error) {
        if (error) {
            callback(error);
        } else {
            fs.readdir(source, function (error, files) {
                let allFiles = files && files.length;

                function proceed(error) {
                    allFiles -= 1;
                    if (error) {
                        callback(error);
                    } else if (allFiles <= 0) {
                        callback();
                    }
                }

                if (error) {
                    callback(error);
                } else {
                    for (let index = 0; index < files.length; ++index) {
                        const sourceFile = `${source}/${files[index]}`;
                        const destFile = `${dest}/${files[index]}`;
                        fs.stat(sourceFile, function (error, stats) {
                            if (error) {
                                callback(error);
                            } else if (stats.isDirectory()) {
                                copyDir(sourceFile, destFile, proceed);
                            } else {
                                fs.copyFile(sourceFile, destFile, proceed);
                            }
                        });
                    }
                }
            });
        }
    });
}

function removeDir(path, callback) {
    fs.access(path, function (error) {
        if (error) {
            callback(error);
        } else {
            fs.readdir(path, function (error, files) {
                let allFiles = files && files.length;

                function remove() {
                    allFiles -= 1;

                    if (allFiles <= 0) {
                        fs.rmdir(path, function (error) {
                            if (error) {
                                callback(error);
                            } else {
                                callback();
                            }
                        });
                    }
                }

                if (error) {
                    callback(error);
                } else if (files.length === 0) {
                    remove();
                } else {
                    for (let index = 0; index < files.length; ++index) {
                        const file = `${path}/${files[index]}`;

                        fs.stat(file, function (error, stat) {
                            if (error) {
                                callback(error);
                            } else if (stat.isDirectory()) {
                                removeDir(file, function (error) {
                                    if (error) {
                                        callback(error);
                                    } else {
                                        remove();
                                    }
                                });
                            } else {
                                fs.unlink(file, function (error) {
                                    if (error) {
                                        callback(error);
                                    } else {
                                        remove();
                                    }
                                });
                            }
                        });
                    }
                }
            });
        }
    });
}

module.exports.logError = logError;
module.exports.logSuccess = logSuccess;
module.exports.copyDir = copyDir;
module.exports.removeDir = removeDir;

"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const cp = __importStar(require("child_process"));
exports.isWindows = process.platform === "win32";
/** Executes a command. Shows an error message if the command isn't found */
function execCmd(cmd, options = {}, elmRootPath, connection) {
    const { onStart, onStdout, onStderr, onExit } = options;
    let childProcess;
    let firstResponse = true;
    let wasKilledbyUs = false;
    const IexecutingCmd = new Promise((resolve, reject) => {
        const cmdArguments = options ? options.cmdArguments : [];
        const fullCommand = cmd + " " + (cmdArguments || []).join(" ");
        childProcess = cp.exec(fullCommand, { cwd: elmRootPath.fsPath }, handleExit);
        if (!childProcess.stdout) {
            return;
        }
        childProcess.stdout.on("data", (data) => {
            if (firstResponse && onStart) {
                onStart();
            }
            firstResponse = false;
            if (onStdout) {
                onStdout(data.toString());
            }
        });
        if (!childProcess.stderr) {
            return;
        }
        childProcess.stderr.on("data", (data) => {
            if (firstResponse && onStart) {
                onStart();
            }
            firstResponse = false;
            if (onStderr) {
                onStderr(data.toString());
            }
        });
        function handleExit(error, stdout, stderr) {
            IexecutingCmd.isRunning = false;
            if (onExit) {
                onExit();
            }
            if (!wasKilledbyUs) {
                if (error) {
                    if (options.showMessageOnError) {
                        const cmdName = cmd.split(" ", 1)[0];
                        const cmdWasNotFound = 
                        // Windows method apparently still works on non-English systems
                        (exports.isWindows &&
                            error.message.includes(`'${cmdName}' is not recognized`)) ||
                            (!exports.isWindows && error.code === 127);
                        if (cmdWasNotFound) {
                            const notFoundText = options ? options.notFoundText : "";
                            connection.window.showErrorMessage(`${cmdName} is not available in your path. ` + notFoundText);
                        }
                        else {
                            connection.window.showErrorMessage(error.message);
                        }
                    }
                    else {
                        reject(error);
                    }
                }
                else {
                    resolve({ stdout, stderr });
                }
            }
        }
    });
    // @ts-ignore
    IexecutingCmd.stdin = childProcess.stdin;
    IexecutingCmd.kill = killProcess;
    IexecutingCmd.isRunning = true;
    return IexecutingCmd;
    function killProcess() {
        wasKilledbyUs = true;
        if (exports.isWindows) {
            cp.spawn("taskkill", ["/pid", childProcess.pid.toString(), "/f", "/t"]);
        }
        else {
            childProcess.kill("SIGINT");
        }
    }
}
exports.execCmd = execCmd;
//# sourceMappingURL=elmUtils.js.map
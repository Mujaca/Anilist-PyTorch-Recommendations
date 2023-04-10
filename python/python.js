const { spawn } = require('child_process');

function runPythonScript(file, arguments = []) {
    return new Promise((resolve, reject) => {
        const python = spawn('python3', [`python/${file}`, ...arguments]);
        const output = [];

        python.stderr.on('data', (data) => {
            console.log(data.toString());
            //reject(data.toString());
        });

        python.stdout.on('data', (data) => {
            output.push(data.toString());
        });

        python.on('exit', () => {
            resolve(output);
        })
    })
}

exports.runPythonScript = runPythonScript;
const { spawn } = require('child_process');

function runPythonScript(file, arguments = []) {
    return new Promise((resolve, reject => {
        const python = spawn('python3', [`python/${file}`, ...arguments]);
    
        python.on('exit', () => {
            resolve(true);
        })
    }))
}

runPythonScript('python.py');
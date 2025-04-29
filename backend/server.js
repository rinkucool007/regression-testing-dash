const express = require('express');
const { execFile } = require('child_process');
const path = require('path');
const cors = require('cors');
const util = require('util');

const execFileAsync = util.promisify(execFile);

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const testDir = path.join(__dirname, 'tests');

app.post('/execute', async (req, res) => {
    const { testCase } = req.body;

    const batchFileMap = {
        'TC001': 'test1.bat',
        'TC002': 'test2.bat',
        'TC003': 'test3.bat',
        'TC004': 'test4.bat',
        'TC005': 'test5.bat',
        'TC006': 'test6.bat',
        'TC007': 'test7.bat',
        'TC008': 'test8.bat',
        'TC009': 'test9.bat',
        'TC010': 'test10.bat',
        'TC011': 'test11.bat',
        'TC012': 'test12.bat',
        'TC013': 'test13.bat',
        'TC014': 'test14.bat',
        'TC015': 'test15.bat',
        'TC016': 'test16.bat',
        'TC017': 'test17.bat',
        'TC018': 'test18.bat',
        'TC019': 'test19.bat',
        'TC020': 'test20.bat'
    };

    let batchFiles = [];
    if (testCase === 'ALL') {
        batchFiles = Object.values(batchFileMap);
    } else {
        const batchFile = batchFileMap[testCase];
        if (!batchFile) {
            return res.status(400).json({
                success: false,
                output: `Invalid test case: ${testCase}`,
                status: 'Fail'
            });
        }
        batchFiles = [batchFile];
    }

    const results = [];

    for (const batchFile of batchFiles) {
        const batchFilePath = path.join(testDir, batchFile);
        try {
            const { stdout, stderr } = await execFileAsync(batchFilePath, [], { shell: true });
            const output = stdout + stderr;
            const isOutputValid = output.trim().toLowerCase() === 'hello world';
            const status = isOutputValid && !stderr ? 'Pass' : 'Fail';

            results.push({
                testCase: Object.keys(batchFileMap).find(key => batchFileMap[key] === batchFile) || batchFile,
                success: true,
                output: output,
                status: status
            });
        } catch (error) {
            results.push({
                testCase: Object.keys(batchFileMap).find(key => batchFileMap[key] === batchFile) || batchFile,
                success: false,
                output: `Error executing ${batchFile}: ${error.message}`,
                status: 'Fail'
            });
        }
    }

    res.json({
        success: true,
        results: results
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

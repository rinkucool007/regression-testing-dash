const express = require('express');
const { execFile } = require('child_process');
const path = require('path');
const cors = require('cors');
const util = require('util');

// Promisify execFile for async/await
const execFileAsync = util.promisify(execFile);

const app = express();
const port = 3001;

// Enable CORS to allow frontend to communicate with backend
app.use(cors());
app.use(express.json());

// API endpoint to execute a batch file
app.post('/execute', async (req, res) => {
  const { testCase } = req.body;

  // Map test cases to batch files
  const batchFileMap = {
    'TC001': 'test1.bat',
    'TC002': 'test2.bat',
    'TC003': 'test3.bat',
    'TC004': 'test4.bat',
    'TC005': 'test5.bat'
  };

  const batchFile = batchFileMap[testCase];
  if (!batchFile) {
    return res.status(400).json({
      success: false,
      output: `Invalid test case: ${testCase}`,
      status: 'Fail'
    });
  }

  const batchFilePath = path.join(__dirname, 'tests', batchFile);

  try {
    // Execute the batch file
    const { stdout, stderr } = await execFileAsync(batchFilePath, [], { shell: true });

    // Combine stdout and stderr for analysis
    const output = stdout + stderr;

    // Determine pass/fail based on output
    const isOutputValid = output.trim().toLowerCase() === 'hello world';
    const status = isOutputValid && !stderr ? 'Pass' : 'Fail';

    res.json({
      success: true,
      output: output,
      status: status // Corrected syntax
    });
  } catch (error) {
    res.json({
      success: false,
      output: `Error executing ${batchFile}: ${error.message}`,
      status: 'Fail'
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
// backend/routes/execute.ts
import express, { Request, Response } from 'express';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const router = express.Router();

router.post('/execute/:scriptName', async (req: Request, res: Response) => {
  const { scriptName } = req.params;
  const scriptPath = path.join(__dirname, '../services', `${scriptName}.py`);

  // Check if script exists
  if (!fs.existsSync(scriptPath)) {
    return res.status(404).json({ error: `Script ${scriptName}.py not found` });
  }

  try {
    const process = spawn('python3', [scriptPath]);

    let output = '';
    let errorOutput = '';

    process.stdout.on('data', (data) => {
      output += data.toString();
    });

    process.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    process.on('close', (code) => {
      if (code === 0) {
        res.json({ result: output.trim() });
      } else {
        res.status(500).json({ error: errorOutput.trim() || 'Unknown error' });
      }
    });
  } catch (err) {
    res.status(500).json({ error: `Failed to execute script: ${err}` });
  }
});

export default router;

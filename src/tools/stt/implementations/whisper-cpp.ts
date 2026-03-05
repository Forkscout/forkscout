// src/tools/stt/implementations/whisper-cpp.ts — Whisper.cpp native implementation for Apple Silicon

import { spawn } from 'node:child_process';
import fs from 'node:fs';

/**
 * Whisper CLI transcription (no Python) - uses OpenAI's official whisper binary
 * Available on Mac via: brew install whisper
 */
export async function transcribeWithWhisperCpp(
  audioPath: string,
  language: string | null = null
): Promise<string> {
  const whisperPath = '/usr/local/bin/whisper';

  if (!fs.existsSync(whisperPath)) {
    throw new Error('Whisper CLI not found. Install with: brew install whisper');
  }

  return new Promise((resolve, reject) => {
    const args = ['--model', 'base', '--file', audioPath];

    if (language) {
      args.push('--language', language);
    }

    const child = spawn(whisperPath, args);
    let output = '';

    child.stdout.on('data', (data) => {
      const text = data.toString();
      // Whisper CLI outputs to stderr, not stdout
      output += text;
    });

    child.stderr.on('data', (data) => {
      const text = data.toString();
      // Check for errors or transcription output
      if (text.includes('Transcription complete') || text.includes('[00:00.000 -->')) {
        output += text;
      } else {
        console.error('Whisper stderr:', text);
      }
    });

    child.on('error', (err) => {
      reject(err);
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve(output.trim());
      } else {
        reject(new Error(`Whisper exited with code ${code}`));
      }
    });
  });
}

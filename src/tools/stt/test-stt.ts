// src/tools/stt/test-stt.ts — Quick test for STT tool
import { transcribeWithWhisperCpp } from "./implementations/whisper-cpp.ts";

const testAudio = "/Users/suru.martian/Documents/marsnext/forkscout-agent/.agents/downloads/voice-test.ogg";

try {
  const text = await transcribeWithWhisperCpp(testAudio);
  console.log("✅ Transcription:", text);
} catch (e) {
  console.error("❌ Error:", e);
}

import {
  getAudioChunksBySession,
  getStrokeBatchesBySession,
} from '@/utils/db';

export interface BatchDetection {
  totalChunks: number;
  chunksPerUploadBatch: number;
  uploadBatches: Map<number, {
    uploadBatchIndex: number;
    chunkIndices: number[];
    startMs: number;
    endMs: number;
    totalDurationMs: number;
    uploadedChunks: number;
    pendingChunks: number;
    allChunksUploadedTogether: boolean;
  }>;
  isBatchingValid: boolean;
  diagnostics: string[];
}

/**
 * Inspect IndexedDB audio chunks and detect if 10-second chunks are properly
 * batched into 60-second upload groups.
 * 
 * For a valid batching:
 * - 6 x 10s chunks (indices 0-5) → uploadBatchIndex 0
 * - 6 x 10s chunks (indices 6-11) → uploadBatchIndex 1
 * - Each batch should have 6 chunks (or fewer on the last batch)
 */
export async function detectAudioBatching(sessionId: string): Promise<BatchDetection> {
  const chunks = await getAudioChunksBySession(sessionId);
  const diagnostics: string[] = [];

  if (chunks.length === 0) {
    return {
      totalChunks: 0,
      chunksPerUploadBatch: 6,
      uploadBatches: new Map(),
      isBatchingValid: false,
      diagnostics: ['No audio chunks found in session'],
    };
  }

  // Group chunks by uploadBatchIndex
  const batchMap = new Map<number, typeof chunks>();
  for (const chunk of chunks) {
    const key = chunk.uploadBatchIndex;
    if (!batchMap.has(key)) batchMap.set(key, []);
    batchMap.get(key)!.push(chunk);
  }

  // Analyze each batch
  const uploadBatches = new Map<number, {
    uploadBatchIndex: number;
    chunkIndices: number[];
    startMs: number;
    endMs: number;
    totalDurationMs: number;
    uploadedChunks: number;
    pendingChunks: number;
    allChunksUploadedTogether: boolean;
  }>();

  let isBatchingValid = true;
  for (const [batchIdx, batchChunks] of batchMap.entries()) {
    const chunkIndices = batchChunks
      .sort((a, b) => a.chunkIndex - b.chunkIndex)
      .map(c => c.chunkIndex);
    const uploadedChunks = batchChunks.filter(c => c.syncStatus === 'sent').length;
    const pendingChunks = batchChunks.filter(c => c.syncStatus === 'pending' || c.syncStatus === 'failed').length;

    const startMs = Math.min(...batchChunks.map(c => c.startMs));
    const endMs = Math.max(...batchChunks.map(c => c.endMs));
    const totalDurationMs = endMs - startMs;

    uploadBatches.set(batchIdx, {
      uploadBatchIndex: batchIdx,
      chunkIndices,
      startMs,
      endMs,
      totalDurationMs,
      uploadedChunks,
      pendingChunks,
      allChunksUploadedTogether: uploadedChunks === batchChunks.length,
    });

    // Validate batching structure
    const expectedChunkStart = batchIdx * 6;
    const expectedChunkEnd = expectedChunkStart + 6;
    const isExpectedRange = chunkIndices.every(idx => idx >= expectedChunkStart && idx < expectedChunkEnd);
    
    if (!isExpectedRange && batchChunks.length === 6) {
      diagnostics.push(
        `⚠️  Batch ${batchIdx}: chunks are ${chunkIndices.join(',')} ` +
        `but expected ~${expectedChunkStart}-${expectedChunkEnd - 1}. ` +
        `This is OK if it's the last partial batch.`
      );
    }

    if (batchChunks.length > 6 && batchIdx < Math.max(...batchMap.keys())) {
      diagnostics.push(`✗ Batch ${batchIdx} has ${batchChunks.length} chunks but should have 6`);
      isBatchingValid = false;
    }

    diagnostics.push(
      `Batch ${batchIdx}: chunks [${chunkIndices.join(',')}], ` +
      `${totalDurationMs / 1000}s total, ` +
      `${uploadedChunks} uploaded / ${pendingChunks} pending`
    );
  }

  if (chunks.length % 6 !== 0 && chunks.length > 6) {
    diagnostics.push(
      `ℹ️  Total ${chunks.length} chunks: ` +
      `${Math.floor(chunks.length / 6)} full batches + ${chunks.length % 6} in partial batch`
    );
  }

  return {
    totalChunks: chunks.length,
    chunksPerUploadBatch: 6,
    uploadBatches,
    isBatchingValid,
    diagnostics,
  };
}

/**
 * Compare audio chunks and stroke batch timing alignment.
 * Shows whether board recording and audio recording started/ended together.
 */
export async function detectTimingAlignment(sessionId: string): Promise<{
  audioStartMs: number;
  audioEndMs: number;
  strokeStartMs: number;
  strokeEndMs: number;
  isAligned: boolean;
  offsetMs: number;
  diagnostics: string[];
}> {
  const audioChunks = await getAudioChunksBySession(sessionId);
  const strokeBatches = await getStrokeBatchesBySession(sessionId);

  if (audioChunks.length === 0 || strokeBatches.length === 0) {
    return {
      audioStartMs: 0,
      audioEndMs: 0,
      strokeStartMs: 0,
      strokeEndMs: 0,
      isAligned: false,
      offsetMs: 0,
      diagnostics: ['Missing audio or stroke data'],
    };
  }

  const audioStartMs = Math.min(...audioChunks.map(c => c.startMs));
  const audioEndMs = Math.max(...audioChunks.map(c => c.endMs));
  const strokeStartMs = Math.min(...strokeBatches.map(b => b.startMs));
  const strokeEndMs = Math.max(...strokeBatches.map(b => b.endMs));

  const offsetMs = audioStartMs - strokeStartMs;
  const isAligned = Math.abs(offsetMs) < 500; // < 0.5s is "aligned"

  const diagnostics: string[] = [
    `Audio:  ${(audioStartMs / 1000).toFixed(1)}s - ${(audioEndMs / 1000).toFixed(1)}s`,
    `Strokes: ${(strokeStartMs / 1000).toFixed(1)}s - ${(strokeEndMs / 1000).toFixed(1)}s`,
    `Offset: ${Math.abs(offsetMs)}ms (audio ${offsetMs > 0 ? 'starts after' : 'starts before'} strokes)`,
  ];

  if (!isAligned) {
    diagnostics.push(`⚠️  Recording timing is offset by ${Math.abs(offsetMs)}ms`);
  } else {
    diagnostics.push(`✓ Recording timing is aligned`);
  }

  return {
    audioStartMs,
    audioEndMs,
    strokeStartMs,
    strokeEndMs,
    isAligned,
    offsetMs,
    diagnostics,
  };
}

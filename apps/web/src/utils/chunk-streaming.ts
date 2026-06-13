import { getAudioChunksBySession } from '@/utils/db';

export interface ChunkStreamInfo {
  chunkIndex: number;
  uploadBatchIndex: number;
  startMs: number;
  endMs: number;
  durationMs: number;
  sizeBytes: number;
  cloudinaryUrl: string | null;
  isUploaded: boolean;
  syncStatus: string;
}

/**
 * For a given session, prepare individual 10-second chunks for progressive playback.
 * This allows playing chunks as they're available without waiting for full 60s batches.
 * 
 * Currently returns chunks that were uploaded (for student replay), but can be
 * extended to support streaming uploads or direct blob access for on-device replay.
 */
export async function getChunkStreamInfo(sessionId: string): Promise<{
  chunks: ChunkStreamInfo[];
  totalDurationMs: number;
  isSuitable: boolean;
  recommendations: string[];
}> {
  const audioChunks = await getAudioChunksBySession(sessionId);
  
  const chunks: ChunkStreamInfo[] = audioChunks
    .sort((a, b) => a.chunkIndex - b.chunkIndex)
    .map(chunk => ({
      chunkIndex: chunk.chunkIndex,
      uploadBatchIndex: chunk.uploadBatchIndex,
      startMs: chunk.startMs,
      endMs: chunk.endMs,
      durationMs: chunk.durationMs,
      sizeBytes: chunk.sizeBytes,
      cloudinaryUrl: chunk.cloudinaryUrl,
      isUploaded: chunk.syncStatus === 'sent',
      syncStatus: chunk.syncStatus,
    }));

  const totalDurationMs = chunks.length > 0
    ? Math.max(...chunks.map(c => c.endMs)) - Math.min(...chunks.map(c => c.startMs))
    : 0;

  const uploadedChunks = chunks.filter(c => c.isUploaded).length;
  const isSuitable = uploadedChunks === chunks.length;

  const recommendations: string[] = [];
  if (!isSuitable) {
    recommendations.push(
      `${uploadedChunks}/${chunks.length} chunks uploaded. ` +
      `${chunks.length - uploadedChunks} still pending.`
    );
  }

  // Check if batches are properly aligned
  const uniqueBatchIndices = new Set(chunks.map(c => c.uploadBatchIndex));
  const expectedBatches = Math.ceil(chunks.length / 6);
  if (uniqueBatchIndices.size !== expectedBatches) {
    recommendations.push(
      `Upload batches seem irregular: found ${uniqueBatchIndices.size} batches ` +
      `but expected ~${expectedBatches} from ${chunks.length} chunks`
    );
  }

  // Suggest progressive loading strategy
  if (uploadedChunks > 0) {
    recommendations.push(
      `✓ Can load 10-second chunks progressively as they're available`
    );
  }

  if (isSuitable && chunks.length >= 6) {
    recommendations.push(
      `Option 1: Use merged 60s batch URLs (current)`,
      `Option 2: Stream individual 10s chunks for lower initial latency`,
      `Option 3: Hybrid - load first 60s batch while pre-fetching next chunks`
    );
  }

  return {
    chunks,
    totalDurationMs,
    isSuitable,
    recommendations,
  };
}

/**
 * Build a progressive manifest that includes both:
 * - Merged 60-second batch URLs (fast for long playback)
 * - Individual 10-second chunk URLs (fast start with lower latency)
 * 
 * This allows replay to play the first 10s immediately instead of waiting
 * for the full 60s batch to download.
 */
export async function buildProgressiveManifest(sessionId: string): Promise<{
  batches60s: Array<{
    batchIndex: number;
    url: string | null;
    startMs: number;
    endMs: number;
    durationMs: number;
  }>;
  chunks10s: Array<{
    chunkIndex: number;
    batchIndex: number;
    url: string | null;
    startMs: number;
    endMs: number;
    durationMs: number;
  }>;
  preferredStrategy: 'batch60' | 'chunk10' | 'hybrid';
  explanation: string;
}> {
  const audioChunks = await getAudioChunksBySession(sessionId);
  
  // Group chunks by uploadBatchIndex
  const batchMap = new Map<number, typeof audioChunks>();
  for (const chunk of audioChunks) {
    const key = chunk.uploadBatchIndex;
    if (!batchMap.has(key)) batchMap.set(key, []);
    batchMap.get(key)!.push(chunk);
  }

  // Build 60-second batch manifest
  const batches60s = Array.from(batchMap.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([batchIdx, chunks]) => {
      const startMs = Math.min(...chunks.map(c => c.startMs));
      const endMs = Math.max(...chunks.map(c => c.endMs));
      // For merged batches, we'd need to track the merged blob URL separately
      // For now, use the first chunk's upload URL as a reference
      const uploadedChunk = chunks.find(c => c.cloudinaryUrl);
      return {
        batchIndex: batchIdx,
        url: uploadedChunk?.cloudinaryUrl ?? null,
        startMs,
        endMs,
        durationMs: endMs - startMs,
      };
    });

  // Build 10-second chunk manifest
  const chunks10s = audioChunks
    .sort((a, b) => a.chunkIndex - b.chunkIndex)
    .map(chunk => ({
      chunkIndex: chunk.chunkIndex,
      batchIndex: chunk.uploadBatchIndex,
      url: chunk.cloudinaryUrl,
      startMs: chunk.startMs,
      endMs: chunk.endMs,
      durationMs: chunk.durationMs,
    }));

  // Decide strategy based on what's available
  const has60sBatches = batches60s.some(b => b.url);
  const has10sChunks = chunks10s.some(c => c.url);
  
  let preferredStrategy: 'batch60' | 'chunk10' | 'hybrid';
  let explanation = '';

  if (has10sChunks && !has60sBatches) {
    preferredStrategy = 'chunk10';
    explanation = 'Only 10-second chunk URLs available. Play chunks sequentially.';
  } else if (has60sBatches && !has10sChunks) {
    preferredStrategy = 'batch60';
    explanation = 'Only 60-second merged batch URLs available (default). ' +
                  'Load each batch before playing.';
  } else if (has10sChunks && has60sBatches) {
    preferredStrategy = 'hybrid';
    explanation = 'Both 10s and 60s URLs available. Start playing first 10s chunk ' +
                  'immediately while also preloading the 60s batch.';
  } else {
    preferredStrategy = 'batch60';
    explanation = 'No URLs found. Chunks may still be uploading.';
  }

  return {
    batches60s,
    chunks10s,
    preferredStrategy,
    explanation,
  };
}

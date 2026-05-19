/// <reference lib="webworker" />

type StrokePayload = {
  id: string;
  data: string;
  color: string;
  width: number;
  startTime: string;
  endTime: string;
  currentBoard: number;
  strokeType: string;
  timestamp: string;
  type: string;
  duration?: number;
  metadata?: Record<string, unknown>;
};

type StrokeBatchMessage = {
  localId: string;
  sessionId: string;
  lessonId: string;
  batchIndex: number;
  startMs: number;
  endMs: number;
  strokeCount: number;
  boardIndex: number;
  strokes: StrokePayload[];
};

type ToWorkerMessage = {
  type: "START";
  apiBaseUrl: string;
  authToken: string;
  tenantId: string;
  batches: StrokeBatchMessage[];
};

type FromWorkerMessage =
  | { type: "BATCH_SENT"; localId: string; batchIndex: number; id: string; indexKey: string }
  | { type: "BATCH_FAILED"; localId: string; batchIndex: number; error: string }
  | { type: "COMPLETE" }
  | { type: "ERROR"; error: string };

const MAX_RETRIES = 3;

async function submitBatch(
  apiBaseUrl: string,
  authToken: string,
  tenantId: string,
  batch: StrokeBatchMessage
): Promise<void> {
  const base = apiBaseUrl.replace(/\/$/, "");
  const url = `${base}/api/board/session/${batch.sessionId}/batch`;

  const requestBody = {
    sessionId: batch.sessionId,
    lessonId: batch.lessonId,
    batchIndex: batch.batchIndex,
    startMs: batch.startMs,
    endMs: batch.endMs,
    strokes: batch.strokes,
    strokeCount: batch.strokeCount,
    boardIndex: batch.boardIndex,
  };

  console.log('[WORKER] 📤 Submitting stroke batch:', {
    url,
    batchIndex: batch.batchIndex,
    sessionId: batch.sessionId,
    lessonId: batch.lessonId,
    strokeCount: batch.strokeCount,
    hasAuth: !!authToken,
    authTokenPrefix: authToken ? authToken.slice(0, 20) + '...' : 'MISSING',
    tenantId: tenantId || 'MISSING',
    bodyStrokesSample: batch.strokes.slice(0, 2).map(s => ({ id: s.id, type: s.type, board: s.currentBoard })),
  });

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${authToken}`,
      "X-Tenant-ID": tenantId,
    },
    body: JSON.stringify(requestBody),
  });

  console.log('[WORKER] 📥 Response received:', {
    status: response.status,
    statusText: response.statusText,
    batchIndex: batch.batchIndex,
    ok: response.ok,
  });

  if (response.status !== 204 && response.status !== 200) {
    const text = await response.text();
    console.error('[WORKER] ❌ Upload failed — server response body:', text);
    throw new Error(`Stroke batch upload failed: ${response.status} ${text}`);
  }

  console.log('[WORKER] ✅ Batch', batch.batchIndex, 'uploaded successfully');
}

self.onmessage = async (event: MessageEvent<ToWorkerMessage>) => {
  const msg = event.data;

  if (msg.type !== "START") {
    console.log('[WORKER] Received non-START message:', msg.type);
    return;
  }

  console.log('[WORKER] START message received:', {
    apiBaseUrl: msg.apiBaseUrl,
    hasAuthToken: !!msg.authToken,
    tenantId: msg.tenantId,
    batchCount: msg.batches?.length ?? 0,
    batches: msg.batches?.map(b => ({
      localId: b.localId,
      batchIndex: b.batchIndex,
      sessionId: b.sessionId,
      strokeCount: b.strokeCount,
    })),
  });

  // ── Critical pre-flight checks ─────────────────────────────────────────────
  if (!msg.apiBaseUrl) {
    console.error('[WORKER] ❌ ABORT: apiBaseUrl is missing — cannot upload any batches');
    self.postMessage({ type: 'ERROR', error: 'apiBaseUrl is missing' } as FromWorkerMessage);
    return;
  }
  if (!msg.authToken) {
    console.error('[WORKER] ❌ WARNING: authToken is missing — all API requests will return 401 Unauthorized');
  }
  if (!msg.tenantId) {
    console.error('[WORKER] ❌ WARNING: tenantId is missing — X-Tenant-ID header will be empty, requests may be rejected');
  }
  if (!msg.batches || msg.batches.length === 0) {
    console.warn(
      '[WORKER] ⚠️ batches array is EMPTY — nothing to upload.',
      'Root cause: session.worker may not have flushed STROKE_BATCHES to IDB,',
      'OR class.tsx never called sendStroke() so session.worker never received RAW_STROKE messages.'
    );
    self.postMessage({ type: 'COMPLETE' } as FromWorkerMessage);
    return;
  }
  console.log('[WORKER] ✅ Pre-flight OK — starting upload of', msg.batches.length, 'batch(es)');

  try {
    for (const batch of msg.batches) {
      let uploaded = false;
      let lastError = "Unknown error";

      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          console.log(`[WORKER] Attempting batch ${batch.batchIndex}, attempt ${attempt + 1}/${MAX_RETRIES}`);
          await submitBatch(msg.apiBaseUrl, msg.authToken, msg.tenantId, batch);
          const indexKey = `${batch.sessionId}_${batch.batchIndex}`;
          const done: FromWorkerMessage = {
            type: "BATCH_SENT",
            localId: batch.localId,
            batchIndex: batch.batchIndex,
            id: indexKey,
            indexKey,
          };
          console.log('[WORKER] Posting BATCH_SENT message:', done);
          self.postMessage(done);
          uploaded = true;
          break;
        } catch (err) {
          lastError = err instanceof Error ? err.message : "Unknown error";
          console.log(`[WORKER] Batch ${batch.batchIndex} attempt ${attempt + 1} failed:`, lastError);
          if (attempt < MAX_RETRIES - 1) {
            await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
          }
        }
      }

      if (!uploaded) {
        const failed: FromWorkerMessage = {
          type: "BATCH_FAILED",
          localId: batch.localId,
          batchIndex: batch.batchIndex,
          error: lastError,
        };
        console.log('[WORKER] Posting BATCH_FAILED message:', failed);
        self.postMessage(failed);
      }
    }

    const complete: FromWorkerMessage = { type: "COMPLETE" };
    console.log('[WORKER] All batches processed, posting COMPLETE');
    self.postMessage(complete);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Worker failed";
    console.error('[WORKER] Caught error in main handler:', errorMsg);
    const failed: FromWorkerMessage = {
      type: "ERROR",
      error: errorMsg,
    };
    self.postMessage(failed);
  }
};

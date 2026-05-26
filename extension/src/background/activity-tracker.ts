import { ActivityReportEvent, QueuedEvent } from "../shared/types";
import { getEventQueue, setEventQueue, setLastFlush } from "../shared/storage";
import { reportEvents, sendHeartbeat } from "../shared/api-client";
import { MAX_QUEUE_SIZE } from "../shared/constants";
import { getActiveTabVisits } from "./tab-monitor";

let memoryQueue: QueuedEvent[] = [];
let initialized = false;

async function loadQueue(): Promise<void> {
  if (!initialized) {
    memoryQueue = await getEventQueue();
    initialized = true;
  }
}

export async function addEvent(event: ActivityReportEvent): Promise<void> {
  await loadQueue();

  const queued: QueuedEvent = {
    ...event,
    _queued_at: Date.now(),
  };

  memoryQueue.push(queued);

  // Enforce max queue size — drop oldest
  if (memoryQueue.length > MAX_QUEUE_SIZE) {
    memoryQueue = memoryQueue.slice(-MAX_QUEUE_SIZE);
  }

  await setEventQueue(memoryQueue);
}

export async function flush(): Promise<void> {
  await loadQueue();

  if (memoryQueue.length === 0) {
    // Still send heartbeat even if no events to flush
    try {
      const activeTabs = getActiveTabVisits();
      await sendHeartbeat(activeTabs);
    } catch {
      // Heartbeat is non-critical
    }
    return;
  }

  // Take a snapshot of current queue
  const toSend = [...memoryQueue];

  // Strip internal fields before sending
  const events: ActivityReportEvent[] = toSend.map(
    ({ _queued_at, ...event }) => event
  );

  try {
    await reportEvents(events);
    // Clear only the events we sent (new ones may have arrived during flush)
    memoryQueue = memoryQueue.filter(
      (e) => e._queued_at > toSend[toSend.length - 1]._queued_at
    );
    await setEventQueue(memoryQueue);
    await setLastFlush(Date.now());
    console.log(`[NeuroVault] Flushed ${events.length} events`);
  } catch (err) {
    console.error("[NeuroVault] Flush failed, will retry:", err);
    // Events remain in queue for next flush cycle
  }

  // Send heartbeat with currently active AI tool tabs
  try {
    const activeTabs = getActiveTabVisits();
    await sendHeartbeat(activeTabs);
  } catch {
    // Heartbeat is non-critical
  }
}

export async function getQueueSize(): Promise<number> {
  await loadQueue();
  return memoryQueue.length;
}

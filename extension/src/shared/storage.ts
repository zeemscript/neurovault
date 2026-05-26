import {
  CachedPolicies,
  QueuedEvent,
  TokenInfo,
} from "./types";
import { STORAGE_KEYS } from "./constants";

export async function getToken(): Promise<string | null> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.TOKEN);
  return result[STORAGE_KEYS.TOKEN] ?? null;
}

export async function getTokenInfo(): Promise<TokenInfo | null> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.TOKEN_INFO);
  return result[STORAGE_KEYS.TOKEN_INFO] ?? null;
}

export async function setTokenInfo(info: TokenInfo): Promise<void> {
  await chrome.storage.local.set({
    [STORAGE_KEYS.TOKEN]: info.token,
    [STORAGE_KEYS.TOKEN_INFO]: info,
  });
}

export async function clearToken(): Promise<void> {
  await chrome.storage.local.remove([
    STORAGE_KEYS.TOKEN,
    STORAGE_KEYS.TOKEN_INFO,
  ]);
}

export async function getApiBase(): Promise<string> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.API_BASE);
  return result[STORAGE_KEYS.API_BASE] ?? "http://localhost:3000";
}

export async function setApiBase(url: string): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.API_BASE]: url });
}

export async function getCachedPolicies(): Promise<CachedPolicies | null> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.CACHED_POLICIES);
  return result[STORAGE_KEYS.CACHED_POLICIES] ?? null;
}

export async function setCachedPolicies(data: CachedPolicies): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.CACHED_POLICIES]: data });
}

export async function getEventQueue(): Promise<QueuedEvent[]> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.EVENT_QUEUE);
  return result[STORAGE_KEYS.EVENT_QUEUE] ?? [];
}

export async function setEventQueue(events: QueuedEvent[]): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.EVENT_QUEUE]: events });
}

export async function isMonitoringEnabled(): Promise<boolean> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.MONITORING_ENABLED);
  return result[STORAGE_KEYS.MONITORING_ENABLED] ?? true;
}

export async function setMonitoringEnabled(enabled: boolean): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.MONITORING_ENABLED]: enabled });
}

export async function getLastFlush(): Promise<number | null> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.LAST_FLUSH);
  return result[STORAGE_KEYS.LAST_FLUSH] ?? null;
}

export async function setLastFlush(timestamp: number): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.LAST_FLUSH]: timestamp });
}

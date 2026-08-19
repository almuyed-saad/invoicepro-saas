import { getStore } from "@netlify/blobs";

const store = () => getStore("invoicepro-assets");

function normalizeKey(relKey: string) {
  return relKey.replace(/^\/+/, "");
}

function appendHashSuffix(relKey: string) {
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  return lastDot === -1 ? `${relKey}_${hash}` : `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}

export async function storagePut(relKey: string, data: Buffer | Uint8Array | string, contentType = "application/octet-stream") {
  const key = appendHashSuffix(normalizeKey(relKey));
  const binary: string | ArrayBuffer = typeof data === "string" ? data : new Uint8Array(data).slice().buffer;
  const body = new Blob([binary], { type: contentType });
  await store().set(key, body, { metadata: { contentType } });
  return { key, url: `/api/assets/${encodeURIComponent(key)}` };
}

export async function storageGet(relKey: string) {
  const key = normalizeKey(relKey);
  return { key, url: `/api/assets/${encodeURIComponent(key)}` };
}

export async function getStoredAsset(key: string) {
  return store().get(key, { type: "blob" });
}

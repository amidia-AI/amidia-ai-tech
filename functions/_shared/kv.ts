import { randomHex } from './helpers';

function key(collection: string, id: string): string {
  return `${collection}:${id}`;
}

function indexKey(collection: string): string {
  return `_index:${collection}`;
}

function requireKv(kv: KVNamespace | undefined): KVNamespace {
  if (!kv) {
    throw new Error('KV namespace is not bound. Add an "APP_KV" KV binding to this Pages project.');
  }
  return kv;
}

async function readIndex(ns: KVNamespace, collection: string): Promise<string[]> {
  const raw = await ns.get(indexKey(collection));
  return raw ? JSON.parse(raw) : [];
}

async function addToIndex(ns: KVNamespace, collection: string, id: string): Promise<void> {
  const ids = await readIndex(ns, collection);
  if (!ids.includes(id)) {
    ids.push(id);
    await ns.put(indexKey(collection), JSON.stringify(ids));
  }
}

async function removeFromIndex(ns: KVNamespace, collection: string, id: string): Promise<void> {
  const ids = await readIndex(ns, collection);
  const next = ids.filter((existing) => existing !== id);
  if (next.length !== ids.length) {
    await ns.put(indexKey(collection), JSON.stringify(next));
  }
}

export async function kvAdd(kv: KVNamespace, collection: string, data: any, id?: string): Promise<string> {
  const ns = requireKv(kv);
  const docId = id || randomHex(8);
  await ns.put(key(collection, docId), JSON.stringify({ id: docId, ...data }));
  await addToIndex(ns, collection, docId);
  return docId;
}

export async function kvSet(kv: KVNamespace, collection: string, id: string, data: any): Promise<void> {
  const ns = requireKv(kv);
  const existing = await ns.get(key(collection, id));
  const base = existing ? JSON.parse(existing) : {};
  await ns.put(key(collection, id), JSON.stringify({ ...base, ...data, id }));
  await addToIndex(ns, collection, id);
}

export async function kvGet(kv: KVNamespace, collection: string, id: string): Promise<any | null> {
  const ns = requireKv(kv);
  const raw = await ns.get(key(collection, id));
  return raw ? JSON.parse(raw) : null;
}

export async function kvList(kv: KVNamespace, collection: string): Promise<any[]> {
  const ns = requireKv(kv);
  const ids = await readIndex(ns, collection);
  const all: any[] = [];
  for (const id of ids) {
    const raw = await ns.get(key(collection, id));
    if (raw) all.push(JSON.parse(raw));
  }
  return all;
}

export async function kvDelete(kv: KVNamespace, collection: string, id: string): Promise<void> {
  const ns = requireKv(kv);
  await ns.delete(key(collection, id));
  await removeFromIndex(ns, collection, id);
}

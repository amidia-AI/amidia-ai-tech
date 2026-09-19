import { randomHex } from './helpers';

function key(collection: string, id: string): string {
  return `${collection}:${id}`;
}

function requireKv(kv: KVNamespace | undefined): KVNamespace {
  if (!kv) {
    throw new Error('KV namespace is not bound. Add an "APP_KV" KV binding to this Pages project.');
  }
  return kv;
}

export async function kvAdd(kv: KVNamespace, collection: string, data: any, id?: string): Promise<string> {
  const ns = requireKv(kv);
  const docId = id || randomHex(8);
  await ns.put(key(collection, docId), JSON.stringify({ id: docId, ...data }));
  return docId;
}

export async function kvSet(kv: KVNamespace, collection: string, id: string, data: any): Promise<void> {
  const ns = requireKv(kv);
  const existing = await ns.get(key(collection, id));
  const base = existing ? JSON.parse(existing) : {};
  await ns.put(key(collection, id), JSON.stringify({ ...base, ...data, id }));
}

export async function kvGet(kv: KVNamespace, collection: string, id: string): Promise<any | null> {
  const ns = requireKv(kv);
  const raw = await ns.get(key(collection, id));
  return raw ? JSON.parse(raw) : null;
}

export async function kvList(kv: KVNamespace, collection: string): Promise<any[]> {
  const ns = requireKv(kv);
  const all: any[] = [];
  let cursor: string | undefined;
  for (;;) {
    const res: any = await ns.list({ prefix: `${collection}:`, cursor });
    for (const entry of res.keys) {
      const raw = await ns.get(entry.name);
      if (raw) all.push(JSON.parse(raw));
    }
    if (res.list_complete) break;
    cursor = res.cursor;
    if (!cursor) break;
  }
  return all;
}

export async function kvDelete(kv: KVNamespace, collection: string, id: string): Promise<void> {
  const ns = requireKv(kv);
  await ns.delete(key(collection, id));
}

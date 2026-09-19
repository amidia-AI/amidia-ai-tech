const PROJECT_ID = 'gen-lang-client-0164020885';
const DB_ID = 'ai-studio-remixultrafluidw-70bbea79-5f67-4526-8d70-d0e6504f5e30';
const API_KEY = 'AIzaSyAGIQqE3ORmmiAqNPWQW6XiMXx_cZGC0Cw';
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DB_ID}/documents`;

function toFirestoreFields(obj: any): any {
  const fields: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) continue;
    if (typeof value === 'string') {
      fields[key] = { stringValue: value };
    } else if (typeof value === 'number') {
      fields[key] = Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
    } else if (typeof value === 'boolean') {
      fields[key] = { booleanValue: value };
    } else if (value instanceof Date) {
      fields[key] = { timestampValue: value.toISOString() };
    } else if (Array.isArray(value)) {
      fields[key] = {
        arrayValue: {
          values: value.map((v) => {
            if (typeof v === 'object' && v !== null) {
              return { mapValue: { fields: toFirestoreFields(v) } };
            }
            return { stringValue: String(v) };
          }),
        },
      };
    } else if (typeof value === 'object') {
      fields[key] = { mapValue: { fields: toFirestoreFields(value) } };
    }
  }
  return fields;
}

function fromFirestoreDoc(doc: any): any {
  if (!doc) return null;
  const id = doc.name ? doc.name.split('/').pop() : '';
  const result: any = { id };
  if (!doc.fields) return result;
  for (const [key, valObj] of Object.entries(doc.fields as Record<string, any>)) {
    if ('stringValue' in valObj) result[key] = valObj.stringValue;
    else if ('integerValue' in valObj) result[key] = parseInt(valObj.integerValue, 10);
    else if ('doubleValue' in valObj) result[key] = valObj.doubleValue;
    else if ('booleanValue' in valObj) result[key] = valObj.booleanValue;
    else if ('timestampValue' in valObj) result[key] = valObj.timestampValue;
    else if ('mapValue' in valObj) result[key] = fromFirestoreDoc(valObj.mapValue);
    else if ('arrayValue' in valObj) result[key] = (valObj.arrayValue.values || []).map((v: any) => {
      if ('mapValue' in v) return fromFirestoreDoc(v.mapValue);
      return v.stringValue || Object.values(v)[0];
    });
  }
  return result;
}

export async function firestoreAdd(collection: string, data: any): Promise<string> {
  const fields = toFirestoreFields(data);
  const res = await fetch(`${BASE}/${collection}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Firestore REST error (${res.status}): ${txt}`);
  }
  const json: any = await res.json();
  return json.name ? json.name.split('/').pop() : '';
}

export async function firestoreSet(collection: string, docId: string, data: any): Promise<void> {
  const fields = toFirestoreFields(data);
  await fetch(`${BASE}/${collection}/${docId}?key=${API_KEY}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields }),
  });
}

export async function firestoreGet(collection: string, docId: string): Promise<any | null> {
  const res = await fetch(`${BASE}/${collection}/${docId}?key=${API_KEY}`);
  if (res.status === 404 || !res.ok) return null;
  const json: any = await res.json();
  return fromFirestoreDoc(json);
}

export async function firestoreList(collection: string): Promise<any[]> {
  const all: any[] = [];
  let pageToken = '';
  for (;;) {
    const url = `${BASE}/${collection}?key=${API_KEY}&pageSize=300${pageToken ? '&pageToken=' + pageToken : ''}`;
    const res = await fetch(url);
    if (!res.ok) break;
    const json: any = await res.json();
    if (json.documents) all.push(...json.documents.map(fromFirestoreDoc));
    if (!json.nextPageToken) break;
    pageToken = json.nextPageToken;
  }
  return all;
}

export async function firestoreDelete(collection: string, docId: string): Promise<void> {
  await fetch(`${BASE}/${collection}/${docId}?key=${API_KEY}`, { method: 'DELETE' });
}

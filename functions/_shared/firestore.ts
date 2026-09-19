export interface FirestoreEnv {
  FIREBASE_PROJECT_ID?: string;
  FIREBASE_DB_ID?: string;
  FIREBASE_API_KEY?: string;
}

function getBase(env: FirestoreEnv): string {
  const projectId = env.FIREBASE_PROJECT_ID || '';
  const dbId = env.FIREBASE_DB_ID || '(default)';
  return `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbId}/documents`;
}

function getApiKey(env: FirestoreEnv): string {
  return env.FIREBASE_API_KEY || '';
}

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

export async function firestoreAdd(env: FirestoreEnv, collection: string, data: any): Promise<string> {
  const base = getBase(env);
  const key = getApiKey(env);
  const fields = toFirestoreFields(data);
  const res = await fetch(`${base}/${collection}?key=${key}`, {
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

export async function firestoreSet(env: FirestoreEnv, collection: string, docId: string, data: any): Promise<void> {
  const base = getBase(env);
  const key = getApiKey(env);
  const fields = toFirestoreFields(data);
  await fetch(`${base}/${collection}/${docId}?key=${key}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields }),
  });
}

export async function firestoreGet(env: FirestoreEnv, collection: string, docId: string): Promise<any | null> {
  const base = getBase(env);
  const key = getApiKey(env);
  const res = await fetch(`${base}/${collection}/${docId}?key=${key}`);
  if (res.status === 404 || !res.ok) return null;
  const json: any = await res.json();
  return fromFirestoreDoc(json);
}

export async function firestoreList(env: FirestoreEnv, collection: string): Promise<any[]> {
  const base = getBase(env);
  const key = getApiKey(env);
  const all: any[] = [];
  let pageToken = '';
  for (;;) {
    const url = `${base}/${collection}?key=${key}&pageSize=300${pageToken ? '&pageToken=' + pageToken : ''}`;
    const res = await fetch(url);
    if (!res.ok) break;
    const json: any = await res.json();
    if (json.documents) all.push(...json.documents.map(fromFirestoreDoc));
    if (!json.nextPageToken) break;
    pageToken = json.nextPageToken;
  }
  return all;
}

export async function firestoreDelete(env: FirestoreEnv, collection: string, docId: string): Promise<void> {
  const base = getBase(env);
  const key = getApiKey(env);
  await fetch(`${base}/${collection}/${docId}?key=${key}`, { method: 'DELETE' });
}

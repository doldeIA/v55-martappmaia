
import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'MartAppDB';
const DB_VERSION = 1;
const KEY_VALUE_STORE = 'keyValueStore';
const FILES_STORE = 'filesStore';

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb(): Promise<IDBPDatabase> {
    if (!dbPromise) {
        if (!('indexedDB' in window)) {
            alert('Este navegador não suporta IndexedDB. Algumas funcionalidades de salvamento podem não funcionar corretamente.');
            return Promise.reject('IndexedDB not supported');
        }
        dbPromise = openDB(DB_NAME, DB_VERSION, {
            upgrade(db) {
                if (!db.objectStoreNames.contains(KEY_VALUE_STORE)) {
                    db.createObjectStore(KEY_VALUE_STORE);
                }
                if (!db.objectStoreNames.contains(FILES_STORE)) {
                    db.createObjectStore(FILES_STORE);
                }
            },
        });
    }
    return dbPromise;
}

async function withStore<T>(storeName: string, mode: IDBTransactionMode, callback: (store: any) => T | Promise<T>): Promise<T> {
    try {
        const db = await getDb();
        const tx = db.transaction(storeName, mode);
        const store = tx.objectStore(storeName);
        const result = await callback(store);
        await tx.done;
        return result;
    } catch (error) {
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
            alert('Erro: O espaço de armazenamento local está cheio. Por favor, libere espaço para continuar salvando dados.');
        } else {
            console.error(`Erro na transação da store ${storeName}:`, error);
        }
        throw error;
    }
}

export const db = {
    get: <T>(storeName: string, key: IDBValidKey) => withStore<T>(storeName, 'readonly', store => store.get(key)),
    set: (storeName: string, key: IDBValidKey, value: any) => withStore(storeName, 'readwrite', store => store.put(value, key)),
    del: (storeName: string, key: IDBValidKey) => withStore(storeName, 'readwrite', store => store.delete(key)),
    clear: (storeName: string) => withStore(storeName, 'readwrite', store => store.clear()),
};

export const keyValueDB = {
    get: <T>(key: IDBValidKey) => db.get<T>(KEY_VALUE_STORE, key),
    set: (key: IDBValidKey, value: any) => db.set(KEY_VALUE_STORE, key, value),
    del: (key: IDBValidKey) => db.del(KEY_VALUE_STORE, key),
};

export const filesDB = {
    get: <T extends File | Blob>(key: IDBValidKey) => db.get<T>(FILES_STORE, key),
    set: (key: IDBValidKey, value: File | Blob) => db.set(FILES_STORE, key, value),
    del: (key: IDBValidKey) => db.del(FILES_STORE, key),
};
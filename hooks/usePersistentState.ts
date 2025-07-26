
import { useState, useEffect } from 'react';
import { keyValueDB } from '../services/dbService';

function usePersistentState<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [state, setState] = useState<T>(defaultValue);
    const [isInitialized, setIsInitialized] = useState(false);

    // Load initial state from DB
    useEffect(() => {
        let isMounted = true;
        (async () => {
            try {
                const value = await keyValueDB.get<T>(key);
                if (isMounted) {
                    if (value !== undefined && value !== null) {
                        setState(value);
                    } else {
                        // If not in DB, set the default value
                        setState(defaultValue);
                        // Do not write back default value immediately, wait for state change.
                    }
                }
            } catch (err) {
                console.error(`Falha ao carregar do IndexedDB para a chave "${key}", usando o valor padrão.`, err);
                // On failure, just use default.
                if (isMounted) setState(defaultValue);
            } finally {
                if (isMounted) setIsInitialized(true);
            }
        })();

        return () => { isMounted = false; };
    }, [key]); // No defaultValue in deps to avoid re-running on every render

    // Save state to DB on change
    useEffect(() => {
        if (!isInitialized) {
            return;
        }

        (async () => {
            try {
                // Do not save the default value on initial load if it hasn't been changed.
                if (state !== defaultValue || (await keyValueDB.get(key)) !== undefined) {
                  await keyValueDB.set(key, state);
                }
            } catch (err) {
                console.error(`Falha ao salvar no IndexedDB para a chave "${key}".`, err);
                 // The error (like QuotaExceeded) is now handled inside dbService.
            }
        })();
    }, [key, state, isInitialized, defaultValue]);

    return [state, setState];
}

export default usePersistentState;
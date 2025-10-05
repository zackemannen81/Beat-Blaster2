const PATTERN_STORAGE_PREFIX = 'bb-pattern-';

export function listSavedPatterns(): string[] {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(PATTERN_STORAGE_PREFIX)) {
      keys.push(key.replace(PATTERN_STORAGE_PREFIX, ''));
    }
  }
  return keys;
}

export function loadPatternData(name: string): any | null {
    try {
        const json = localStorage.getItem(`${PATTERN_STORAGE_PREFIX}${name}`);
        if (json) {
            return JSON.parse(json);
        }
    } catch (e) {
        console.error(`Error loading pattern data for '${name}':`, e);
    }
    return null;
}

/**
 * Storage key holding the persisted theme preference.
 *
 * The inline script in `index.html` reads the same key before the bundle loads
 * so a dark session does not flash the light canvas. That script cannot import
 * from here, so the literal is duplicated there on purpose — keep both in sync.
 */
export const themeStorageKey = 'theme'

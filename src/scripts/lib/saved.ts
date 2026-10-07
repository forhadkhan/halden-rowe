/**
 * The visitor's saved homes: a JSON array of listing slugs in localStorage under "hr:saved" (format unchanged
 * since F1). Written by the heart buttons (PropertyCard.astro), read by the Saved view on /properties.
 * A change in this tab fires SAVED_EVENT on document; other tabs get the browser's `storage` event.
 */
export const SAVED_KEY = 'hr:saved';
export const SAVED_EVENT = 'hr:saved-change';

export function readSaved(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(SAVED_KEY) ?? '[]');
    return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

export function writeSaved(list: string[]): void {
  try {
    localStorage.setItem(SAVED_KEY, JSON.stringify(list));
  } catch {
    /* storage blocked: the pressed state still works for this page view */
  }
  document.dispatchEvent(new CustomEvent(SAVED_EVENT));
}

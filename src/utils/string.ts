/**
 * Cleans a string by trimming whitespace, removing invisible/control characters,
 * and normalizing Unicode (NFC).
 * 
 * @param input - The string to clean
 * @returns The cleaned string
 */
export function cleanString(input: string): string {
  if (typeof input !== 'string') return input;

  // Trim leading and trailing whitespaces
  let cleaned = input.trim();

  // Remove invisible/control characters (except standard whitespace)
  cleaned = cleaned.replace(/[\u0000-\u001F\u007F\u200B-\u200F\u2028-\u202F\uFEFF]/g, '');

  // Normalize Unicode to NFC
  cleaned = cleaned.normalize('NFC');

  return cleaned;
}

/**
 * Recursively clean all string fields in a flat (non-nested) object.
 * 
 * * @param data - A flat object
 */
export const cleanInputFields = <T extends Record<string, any>>(data: T): T => {
  const trimmed: Record<string, any> = {};

  for (const key in data) {
    const value = data[key];
    trimmed[key] = typeof value === 'string' ? cleanString(value) : value; // Only clean if value is a string
  }

  return trimmed as T;
};
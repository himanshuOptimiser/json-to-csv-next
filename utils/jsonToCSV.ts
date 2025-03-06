import { Parser } from 'json2csv';

/**
 * Recursively flattens an object.
 * For arrays:
 *  - If elements are objects, each is flattened and stringified, then joined by ' | '
 *  - Otherwise, the array is joined by ', '
 */
function flattenObject(obj: any, prefix = '', res: Record<string, any> = {}): Record<string, any> {
  for (const key in obj) {
    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (Array.isArray(value)) {
      if (value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
        // Flatten each object element and join their stringified versions
        res[newKey] = value
          .map(item => {
            const flatItem = flattenObject(item);
            return JSON.stringify(flatItem);
          })
          .join(' | ');
      } else {
        // Join primitive values
        res[newKey] = value.join(', ');
      }
    } else if (typeof value === 'object' && value !== null) {
      flattenObject(value, newKey, res);
    } else {
      res[newKey] = value;
    }
  }
  return res;
}

/**
 * Converts JSON data to CSV.
 * Supports an array of objects or a single object with nested objects/arrays.
 */
export function convertToCSV(data: any): string {
  let rows: string[] = [];
  if (Array.isArray(data)) {
    if (data.length === 0) return '';
    // Get headers from the first item
    const headers = Object.keys(flattenObject(data[0]));
    rows.push(headers.join(','));
    for (const item of data) {
      const flatItem = flattenObject(item);
      const row = headers.map(header => `"${(flatItem[header] !== undefined ? String(flatItem[header]).replace(/"/g, '""') : '')}"`);
      rows.push(row.join(','));
    }
    return rows.join('\n');
  } else if (typeof data === 'object' && data !== null) {
    const flatData = flattenObject(data);
    const headers = Object.keys(flatData);
    rows.push(headers.join(','));
    const row = headers.map(header => `"${(flatData[header] !== undefined ? String(flatData[header]).replace(/"/g, '""') : '')}"`);
    rows.push(row.join(','));
    return rows.join('\n');
  }
  return String(data);
}

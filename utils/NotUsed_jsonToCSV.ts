interface FlattenedData {
  [key: string]: string | number | boolean | null;
}

function flattenObject(obj: any, prefix = ''): FlattenedData {
  return Object.keys(obj).reduce((acc: FlattenedData, k: string) => {
    const pre = prefix.length ? `${prefix}.` : '';
    if (
      typeof obj[k] === 'object' && 
      obj[k] !== null && 
      !Array.isArray(obj[k])
    ) {
      Object.assign(acc, flattenObject(obj[k], pre + k));
    } else if (Array.isArray(obj[k])) {
      // Handle arrays by joining elements with a separator
      acc[pre + k] = obj[k].map((item: any) => 
        typeof item === 'object' ? JSON.stringify(item) : item
      ).join(' | ');
    } else {
      acc[pre + k] = obj[k];
    }
    return acc;
  }, {});
}

export async function convertToCSV(data: any): Promise<string> {
  // Handle array of objects
  const arrayData = Array.isArray(data) ? data : [data];
  
  // Flatten each object and collect all possible headers
  const flattenedData = arrayData.map(item => flattenObject(item));
  const headers = Array.from(new Set(
    flattenedData.reduce((acc: string[], curr) => 
      acc.concat(Object.keys(curr)), [])
  )).sort();

  // Create CSV rows
  const rows = flattenedData.map(item => 
    headers.map(header => {
      const value = item[header] ?? '';
      // Escape values containing commas or quotes
      return typeof value === 'string' && (value.includes(',') || value.includes('"'))
        ? `"${value.replace(/"/g, '""')}"`
        : value;
    })
  );

  // Combine headers and rows
  return [headers.join(',')]
    .concat(rows.map(row => row.join(',')))
    .join('\n');
}

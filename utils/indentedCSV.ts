const INDENT_CHAR = '    '; // 4 spaces for indentation

function processValue(value: any): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
  return String(value);
}

function convertObjectToIndentedRows(
  obj: any,
  level: number = 0,
  parentKey: string = '',
  rows: string[] = []
): string[] {
  const indent = INDENT_CHAR.repeat(level);

  if (Array.isArray(obj)) {
    if (obj.length === 0) {
      rows.push(`${indent}${parentKey},[Empty Array]`);
    } else if (typeof obj[0] === 'object') {
      rows.push(`${indent}${parentKey},`);
      obj.forEach((item, index) => {
        rows.push(`${indent}[${index + 1}],`);
        convertObjectToIndentedRows(item, level + 1, '', rows);
      });
    } else {
      rows.push(`${indent}${parentKey},${obj.map(processValue).join(', ')}`);
    }
    return rows;
  }

  if (obj && typeof obj === 'object') {
    if (parentKey) {
      rows.push(`${indent}${parentKey},`);
    }
    
    for (const [key, value] of Object.entries(obj)) {
      if (value && typeof value === 'object') {
        convertObjectToIndentedRows(value, level + 1, key, rows);
      } else {
        rows.push(`${indent}${INDENT_CHAR}${key},${processValue(value)}`);
      }
    }
    return rows;
  }

  rows.push(`${indent}${parentKey},${processValue(obj)}`);
  return rows;
}

export function convertToIndentedCSV(data: any): string {
  const rows: string[] = [];
  
  if (Array.isArray(data)) {
    rows.push('Root Array:,');
    data.forEach((item, index) => {
      rows.push(`[${index + 1}],`);
      convertObjectToIndentedRows(item, 1, '', rows);
    });
  } else {
    convertObjectToIndentedRows(data, 0, 'Root', rows);
  }
  
  return rows.join('\n');
}

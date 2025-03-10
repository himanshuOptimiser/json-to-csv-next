export function convertToCSV(jsonData: any): string {
  const tables = findMainArrays(jsonData);
  if (tables.length === 0) return '';

  const allFlattenedRows = tables.reduce((acc: any[], { tableName, data }) => {
    // Process each record with proper LEFT JOIN logic
    const flattenedData = data.reduce((acc2: any[], parentRecord) => {
      // Add table name to the record if exists
      const baseRecord = { ...(tableName ? { table: tableName } : {}), 
        // ...existing code for flattening parent properties...
        ...Object.entries(parentRecord).reduce((obj, [key, value]) => {
          if (!Array.isArray(value)) {
            if (typeof value === 'object' && value !== null) {
              return { ...obj, ...flattenObject(key, value) };
            }
            return { ...obj, [key]: value };
          }
          return obj;
        }, {})
      };

      // Identify array properties to perform LEFT JOIN
      const arrayProperties = Object.entries(parentRecord)
        .filter(([_, value]) => Array.isArray(value))
        .map(([key, value]) => ({ key, array: value as any[] }));

      if (arrayProperties.length === 0) {
        return [...acc2, baseRecord];
      }
      
      let result = [baseRecord];
      arrayProperties.forEach(({ key, array }) => {
        if (array.length === 0) {
          result = result.map(row => ({
            ...row,
            // Suffix indicating empty array join
            [`${key}_empty`]: true
          }));
          return;
        }
        result = result.flatMap(row =>
          array.map(item => ({
            ...row,
            ...flattenObject(key, item)
          }))
        );
      });
      return [...acc2, ...result];
    }, []);
    return [...acc, ...flattenedData];
  }, []);

  return createCSV(allFlattenedRows);
}

// New helper function to find all main arrays and assign table names if available
function findMainArrays(data: any): { tableName?: string, data: any[] }[] {
  if (Array.isArray(data)) {
    return [{ data }];
  }
  const tables: { tableName?: string, data: any[] }[] = [];
  for (const key in data) {
    if (Array.isArray(data[key])) {
      tables.push({ tableName: key, data: data[key] });
    }
  }
  return tables;
}

function findMainArray(data: any): any[] | null {
  if (Array.isArray(data)) return data;
  
  // Look for the first array property in the object
  for (const key in data) {
    if (Array.isArray(data[key])) {
      return data[key];
    }
  }
  
  return null;
}

function createCSV(flattenedData: any[]): string {
  if (flattenedData.length === 0) return '';
  
  // Get all unique headers
  const headers = Array.from(
    new Set(
      flattenedData.reduce((allKeys: string[], row) => 
        [...allKeys, ...Object.keys(row)], []
      )
    )
  ).sort((a, b) => {
    // Get the hierarchy levels
    const aLevels = a.split('_');
    const bLevels = b.split('_');
    
    // Compare each level
    for (let i = 0; i < Math.min(aLevels.length, bLevels.length); i++) {
      if (aLevels[i] !== bLevels[i]) {
        return aLevels[i].localeCompare(bLevels[i]);
      }
    }
    
    // If one is a parent of another, parent comes first
    return aLevels.length - bLevels.length;
  });

  // Create CSV rows
  const rows = flattenedData.map(row =>
    headers.map(header => formatCell(row[header]))
  );

  // Generate CSV content
  return [
    headers.map(formatHeader).join(','),
    ...rows.map(row => row.map(cell => `"${cell || ''}"`).join(','))
  ].join('\n');
}

// Helper function to flatten nested objects with proper prefixing
function flattenObject(prefix: string, obj: any): Record<string, any> {
  const result: Record<string, any> = {};
  
  function recurse(current: any, prop: string) {
    if (!current || typeof current !== 'object') {
      result[prop] = current;
      return;
    }

    if (Array.isArray(current)) {
      if (current.length === 0) {
        result[prop] = '';
      } else if (typeof current[0] !== 'object') {
        result[prop] = current.join('; ');
      }
      return;
    }

    Object.entries(current).forEach(([key, value]) => {
      const newKey = prop ? `${prop}_${key}` : key;
      recurse(value, newKey);
    });
  }
  
  recurse(obj, prefix);
  return result;
}

function formatHeader(header: string): string {
  return header
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatCell(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (Array.isArray(value)) {
    return value.join('; ');
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value).replace(/"/g, '""');
}

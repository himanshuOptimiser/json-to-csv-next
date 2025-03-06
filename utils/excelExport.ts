import * as XLSX from 'xlsx';
import FileSaver from 'file-saver';

interface SheetData {
  name: string;
  data: any[];
  parentSheet?: string;
  parentKey?: string;
}

function findNestedTables(
  data: any,
  path: string = '',
  result: Map<string, SheetData> = new Map()
): any {
  if (Array.isArray(data)) {
    if (data.length > 0 && typeof data[0] === 'object') {
      // Store this array as a separate sheet
      const sheetName = path || 'Main';
      result.set(sheetName, {
        name: sheetName,
        data: data.map(item => flattenObject(item, result, sheetName))
      });
      return `[See Sheet: ${sheetName}]`;
    }
    return data.join(', ');
  }
  
  if (data && typeof data === 'object') {
    return flattenObject(data, result, path);
  }
  
  return data;
}

function flattenObject(
  obj: any,
  sheetsMap: Map<string, SheetData>,
  parentSheet: string
): any {
  const flattened: any = {};

  for (const [key, value] of Object.entries(obj)) {
    if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
      // Create a new sheet for this nested array
      const sheetName = parentSheet ? `${parentSheet}_${key}` : key;
      sheetsMap.set(sheetName, {
        name: sheetName,
        data: value.map(item => flattenObject(item, sheetsMap, sheetName)),
        parentSheet,
        parentKey: key
      });
      flattened[key] = `[See Sheet: ${sheetName}]`;
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      const nested = flattenObject(value, sheetsMap, parentSheet);
      Object.entries(nested).forEach(([nestedKey, nestedValue]) => {
        flattened[`${key}.${nestedKey}`] = nestedValue;
      });
    } else {
      flattened[key] = value;
    }
  }

  return flattened;
}

export function exportToExcel(data: any, fileName: string = 'export.xlsx'): void {
  const sheets = new Map<string, SheetData>();
  
  // Process main data
  if (Array.isArray(data)) {
    findNestedTables(data, 'Main', sheets);
  } else {
    findNestedTables([data], 'Main', sheets);
  }

  // Create workbook
  const wb = XLSX.utils.book_new();

  // Add each sheet to the workbook
  for (const [sheetName, sheetData] of sheets) {
    const ws = XLSX.utils.json_to_sheet(sheetData.data);
    
    // Add sheet relationship metadata
    if (sheetData.parentSheet) {
      const relationshipCell = XLSX.utils.encode_cell({ r: 0, c: 0 });
      ws[relationshipCell] = {
        v: `Parent Sheet: ${sheetData.parentSheet}, Parent Key: ${sheetData.parentKey}`,
        t: 's'
      };
    }

    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  }

  // Save the workbook
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  FileSaver.saveAs(blob, fileName);
}

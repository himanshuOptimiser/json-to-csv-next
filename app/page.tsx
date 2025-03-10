'use client';
import { useState } from 'react';
import { convertToCSV } from '../utils/jsonToCsv';
import { exportToExcel } from '@/utils/excelExport';
import { convertToIndentedCSV } from '@/utils/indentedCSV';
//import sampleData from './sample-1.json';

export default function Home() {
  const [jsonData, setJsonData] = useState('');
  const [csvData, setCsvData] = useState(''); // stores CSV text
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [indentedView, setIndentedView] = useState(false);

  const handleConvert = async () => {
    try {
      setIsLoading(true);
      setError('');
      setIndentedView(false); // Reset indented view when converting to flat CSV
      
      const parsedData = JSON.parse(jsonData);
      console.log('Parsed JSON:', parsedData);
      
      const csv = convertToCSV(parsedData);
      console.log('CSV Result:', csv);
      
      if (!csv.trim()) {
        throw new Error('CSV conversion returned empty result. Check the convertToCSV implementation and JSON input.');
      }
      
      // update CSV data state for visualiser
      setCsvData(csv);
    } catch (err) {
      console.error(err);
      setError(err instanceof SyntaxError ? 'Invalid JSON format' : err.message || 'Error converting to CSV');
    } finally {
      setIsLoading(false);
    }
  };

  // New function: exports the already converted CSV data
  const handleExport = () => {
    try {
      const parsedData = JSON.parse(jsonData);
      exportToExcel(parsedData, 'exported-data.xlsx');
    } catch (err) {
      setError(err instanceof SyntaxError ? 'Invalid JSON format' : err.message || 'Error exporting to Excel');
    }
  };

  // Add new handler for indented view
  const handleIndentedView = () => {
    try {
      setIsLoading(true);
      setError('');
      
      const parsedData = JSON.parse(jsonData);
      const indentedCsv = convertToIndentedCSV(parsedData);
      
      if (!indentedCsv.trim()) {
        throw new Error('Indented CSV conversion returned empty result.');
      }
      
      setCsvData(indentedCsv);
      setIndentedView(true);
    } catch (err) {
      console.error(err);
      setError(err instanceof SyntaxError ? 'Invalid JSON format' : err.message || 'Error converting to indented format');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCSVExport = () => {
    try {
      // Use the current jsonData instead of undefined sampleData
      const parsedData = JSON.parse(jsonData);
      const csvContent = convertToCSV(parsedData);
      
      if (!csvContent) {
        throw new Error('No CSV content generated');
      }
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'exported_data.csv';
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      setError(err.message || 'Error exporting to CSV');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
      <main className="container mx-auto px-4 py-16 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-4xl bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-300 mb-4">
              JSON to CSV Converter
            </h1>
            <p className="text-gray-300 text-xl">
              Transform your JSON data into CSV format with ease
            </p>
          </div>

          {/* Input Section */}
          <div className="space-y-8">
            <div>
              <label 
                htmlFor="jsonInput" 
                className="block mb-4 text-lg font-medium text-gray-200 text-center"
              >
                Enter JSON Data
              </label>
              <div className="relative">
                <textarea
                  id="jsonInput"
                  value={jsonData}
                  onChange={(e) => setJsonData(e.target.value)}
                  rows={12}
                  className="block p-6 w-full text-lg text-white bg-slate-800/30 rounded-2xl border border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400 transition-all duration-300 ease-in-out resize-none"
                  placeholder="Paste your JSON data here..."
                />
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-4 text-base text-red-300 bg-red-900/40 rounded-xl border border-red-600 flex items-center shadow-lg" role="alert">
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                </svg>
                {error}
              </div>
            )}

            {/* Action Buttons: Convert and (if available) Export */}
            <div className="flex justify-center space-x-4 pt-6 flex-wrap gap-y-4">
              <button
                type="button"
                onClick={handleConvert}
                disabled={!jsonData || isLoading}
                className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-800 font-bold rounded-xl text-lg px-8 py-3 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Converting...
                  </span>
                ) : (
                  "Flat CSV"
                )}
              </button>
              
              <button
                type="button"
                onClick={handleIndentedView}
                disabled={!jsonData || isLoading}
                className="text-white bg-purple-600 hover:bg-purple-700 focus:ring-4 focus:ring-purple-800 font-bold rounded-xl text-lg px-8 py-3 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Indented View
              </button>

              {csvData && (
                <>
                  <button
                    type="button"
                    onClick={handleExport}
                    className="text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-800 font-bold rounded-xl text-lg px-8 py-3 transform hover:scale-105 transition-all duration-200"
                  >
                    Export to Excel
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleCSVExport}
                    className="text-white bg-yellow-600 hover:bg-yellow-700 focus:ring-4 focus:ring-yellow-800 font-bold rounded-xl text-lg px-8 py-3 transform hover:scale-105 transition-all duration-200"
                  >
                    Export CSV
                  </button>
                </>
              )}
            </div>

            {/* CSV Visualiser with Grid */}
            {csvData && (
              <div className="mt-8">
                <h2 className="text-2xl font-semibold text-center text-gray-200 mb-4">
                  {indentedView ? 'Indented CSV View' : 'Flat CSV View'}
                </h2>
                <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                  <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <caption className="p-5 text-lg font-semibold text-left text-gray-900 bg-white dark:text-white dark:bg-gray-800">
                      CSV Data Preview
                      <p className="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">
                        {indentedView ? 'Showing hierarchical structure' : 'Showing flattened structure'}
                      </p>
                    </caption>
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                      <tr>
                        {csvData.split('\n')[0]?.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((header, idx) => (
                          <th key={idx} scope="col" className="px-6 py-3 whitespace-pre-wrap break-words max-w-xs">
                            {header.replace(/^"|"$/g, '').split('.').join(' → ')}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {csvData
                        .split('\n')
                        .slice(1)
                        .map((row, rowIndex) => (
                          <tr key={rowIndex} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-700">
                            {row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((cell, cellIndex) => (
                              <td key={cellIndex} className="px-6 py-4 whitespace-pre-wrap break-words max-w-xs">
                                {cell.replace(/^"|"$/g, '')}
                              </td>
                            ))}
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

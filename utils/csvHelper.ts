
/**
 * Converts an array of objects to CSV format and triggers a browser download.
 * @param data Array of objects to export
 * @param filename Base name for the file (timestamp will be appended)
 */
export const downloadCSV = (data: any[], filename: string) => {
  if (!data || !data.length) {
    alert("No data available to export.");
    return;
  }

  // Get headers from the first object keys
  const headers = Object.keys(data[0]);

  // Construct CSV content
  const csvRows = [
    headers.join(','), // Header row
    ...data.map(row => {
      return headers.map(fieldName => {
        const val = row[fieldName];
        // Handle strings that might contain commas or quotes
        if (typeof val === 'string') {
          return `"${val.replace(/"/g, '""')}"`; 
        }
        // Handle dates
        if (val instanceof Date) {
            return `"${val.toLocaleDateString()}"`;
        }
        return val;
      }).join(',');
    })
  ];

  const csvContent = csvRows.join('\n');

  // Create Blob and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  const dateStr = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${dateStr}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

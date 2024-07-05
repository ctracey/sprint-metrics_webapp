document.getElementById('filePicker').addEventListener('change', function(event) {
    filePickerAction(event);
});

function filePickerAction(event) {
    const file = event.target.files[0];
    if (file) {
        displayFilename(file.name);
        loadCSVFile(file, handleLoadedCSV);
    } else {
        document.getElementById('fileName').textContent = 'No file selected';
        document.getElementById('csvContent').innerHTML = '';
    }
}

function loadCSVFile(file, csvDataHandler) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const contents = e.target.result;
        csvDataHandler(contents);
    };
    reader.readAsText(file);
}

function handleLoadedCSV(csvData) {
  console.log('handle loaded CSV data');
  displayCSV(csvData);
}

function displayFilename(filename) {
    console.log('display filename: ', filename);
    document.getElementById('fileName').textContent = filename;
}

function displayCSV(csvData) {
    console.log('display csv in table format');
    
    const rows = csvData.split('\n');
    let tableHTML = '<table border="1">';
    
    rows.forEach(row => {
        tableHTML += '<tr>';
        const cells = row.split(',');
        cells.forEach(cell => {
            tableHTML += `<td>${cell}</td>`;
        });
        tableHTML += '</tr>';
    });
    
    tableHTML += '</table>';
    document.getElementById('csvContent').innerHTML = tableHTML;
}
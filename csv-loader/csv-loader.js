document.getElementById('filePicker').addEventListener('change', function(event) {
    filePickerAction(event);
});

const dataViewerElementId = 'dataViewer';

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

  //display csv data as table
  // displayCSVDataAsTable(csvData, dataViewerElementId);

  //display loaded data as rawJson
  var jsonData = csvToJson(csvData);
  console.log(jsonData);
  displayDataAsRawJson(jsonData, dataViewerElementId);
}

function csvToJson(csvData) {
    // Split the CSV data by newlines to get an array of rows
    const rows = csvData.split('\n');
    
    // Get the headers from the first row
    const headers = rows[0].split(',');
    console.log('csv headers: ', headers);

    // Initialize an array to hold the JSON objects
    const jsonArray = [];

    // Loop through the remaining rows and create an object for each row
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i].split(',');

        // Skip empty rows
        if (row.length !== headers.length) continue;

        const jsonObject = {};

        // Assign values to the object based on the headers
        for (let j = 0; j < headers.length; j++) {
            jsonObject[headers[j]] = row[j];
        }

        // Push the object to the JSON array
        jsonArray.push(jsonObject);
    }

    return jsonArray;
}

function displayDataAsRawJson(jsonObject, elementId) {
    const jsonString = JSON.stringify(jsonObject, null, 2);

    const element = document.getElementById(elementId);
    element.innerText = jsonString;
}

function displayCSVDataAsTable(csvData, elementId) {
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
    document.getElementById(elementId).innerHTML = tableHTML;
}

function displayFilename(filename) {
    console.log('display filename: ', filename);
    document.getElementById('fileName').textContent = filename;
}
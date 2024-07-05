document.getElementById('filePicker').addEventListener('change', function(event) {
    filePickerAction(event);
});

function handleLoadedCSV(csvData) {
    console.log('handle loaded CSV data');

    //display csv data as table
    // const dataPresentationHTML = renderCSVDataAsTable(csvData);

    //process loaded data to structured data model
    const jsonData = csvToJson(csvData);
    const dataPresentationHTML = renderDataAsRawJson(jsonData);

    showDataViewer(dataPresentationHTML);
}








/*----------------------------------------
  DATA PROCESSING
  --------------------------------------*/

function csvToJson(csvData) {
    console.log('PARSING csv data to json');
    
    const rows = csvRows(csvData);
    const headers = csvHeaders(rows);

    return csvRowsToJson(rows, headers);
}

function csvRowsToJson(csvRows, headers) {
    console.log('PROCESSING csv data to json data model');

    const jsonObjectsPerRow = [];
    let attributeMap = mapHeadersToAttributes(headers);
    console.log('attribute map: ', attributeMap);

    const firstRowAfterHeaders = 1;
    for (let i = firstRowAfterHeaders; i < csvRows.length; i++) {
        const row = csvRows[i].split(',');

        if (!rowIsValid(row, headers)) {
            const jsonObject = csvRowToJson(row, attributeMap)
            jsonObjectsPerRow.push(jsonObject);
        }
    }

    return jsonObjectsPerRow;
}

function csvRowToJson(csvRow, attributeMap) {
    const jsonObject = {};

    attributeMap.collectionAttributes.forEach(function(attribute, index) {
        jsonObject[attribute] = [];
    });

    // Add attributes to the object aligned to attribute map
    let headers = attributeMap.headers;
    for (let cellIndex = 0; cellIndex < headers.length; cellIndex++) {
        const cellValue = csvRow[cellIndex];

        if (!(cellValue === "")) {
            const attribute = headers[cellIndex];
            if (attributeIsCollection(attribute, attributeMap)) {
                jsonObject[attribute].push(cellValue);
            } else {
                jsonObject[attribute] = cellValue;
            }
        }
    }

    return jsonObject;
}

function attributeIsCollection(attribute, attributeMap) {
    return attributeMap.collectionAttributes.includes(attribute)
}

function mapHeadersToAttributes(csvHeaders) {
    //handles csv files that use /_[0-9]/ suffix to handle multiple values for an attribute

    let scannedHeaders = [];
    const collectionAttributes = [];

    for (let i = 0; i < csvHeaders.length; i++) {
        const header = csvHeaders[i];

        if (scannedHeaders.includes(header)) {
            collectionAttributes.push(header);
        } else {
            scannedHeaders.push(header);
        }
    }

    const attributeMap = {
        headers: csvHeaders,
        attributes: scannedHeaders,
        collectionAttributes: collectionAttributes
    }

    return attributeMap;
}

function trimDuplicateHeaderSuffix(text) {
    const duplicateSuffixRegex = /_[0-9]$/;
    return text.replace(new RegExp(duplicateSuffixRegex.source), '');
}






/*----------------------------------------
  CSV HANDLING
  --------------------------------------*/

function csvHeaders(csvRows) {
    // Get the headers from the first row
    return csvRows[0].split(',');
}

function csvRows(csvData) {
    return csvData.split('\n');
}

function rowIsValid(row, headers) {
  return row.length !== headers.length;
}





/*----------------------------------------
  FILE HANDLING
  --------------------------------------*/

function filePickerAction(event) {
    const file = event.target.files[0];
    if (file) {
        showFilename(file.name);
        loadCSVFile(file, handleLoadedCSV);
    } else {
        showFilename('No file selected');
        showDataViewer('');
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





/*----------------------------------------
  PRESENTATION LOGIC
  --------------------------------------*/

function renderDataAsRawJson(jsonObject) {
    console.log('jsonData (unprocessed): ', jsonObject);
    return JSON.stringify(jsonObject, null, 2);
}

function renderCSVDataAsTable(csvData) {
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

    return tableHTML;
}

function showDataViewer(htmlContent) {
    const elementId = 'dataViewer';
    document.getElementById(elementId).innerHTML = htmlContent;
}

function showFilename(filename) {
    console.log('display filename: ', filename);
    document.getElementById('fileName').textContent = filename;
}
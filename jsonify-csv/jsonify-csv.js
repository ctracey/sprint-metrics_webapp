let loadedCsvFilename = '';
let convertedJsonData;

const loadCSVButtonId = 'loadCSVButton';
const downloadButtonId = 'downloadButton';

document.getElementById(loadCSVButtonId).addEventListener('click', handleLoadCSVButtonClick);
document.getElementById('filePicker').addEventListener('change', handleFilePickerChange);
document.getElementById(downloadButtonId).addEventListener('click', handleDownloadJsonButtonClick);





/*----------------------------------------
  ACTION HANDLERS
  --------------------------------------*/

function handleLoadCSVButtonClick(event) {
    document.getElementById('filePicker').click();
}

function handleFilePickerChange(event) {
    //TODO: handle errors

    const file = event.target.files[0];
    if (file) {
        hideLoadCSVButton();

        loadedCsvFilename = file.name;
        showFilename(loadedCsvFilename);

        loadCSVFile(file, handleCsvLoaded);
    } else {
        showFilename('No file selected');
        showDataViewer('');
    }
}

function handleCsvLoaded(csvData) {
    console.log('handle loaded CSV data');

    //display csv data as table
    // const dataPresentationHTML = renderCSVDataAsTable(csvData);

    //process loaded data to structured data model
    convertedJsonData = csvToJson(csvData);
    const dataPresentationHTML = renderDataAsRawJson(convertedJsonData);

    showDataViewer(dataPresentationHTML);
    showDownloadButton();
}

function handleDownloadJsonButtonClick(event) {
    const jsonString = JSON.stringify(convertedJsonData);
    const downloadFilename = convertCSVFilenameToJsonFilename(loadedCsvFilename);

    const link = setupDownloadLink(jsonString, downloadFilename);
    link.click();
}

function convertCSVFilenameToJsonFilename(csvFilename) {
    return csvFilename.split('.')[0] + '.json';
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

        if (!(cellValue === '')) {
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
  FILE LOADING
  --------------------------------------*/

function loadCSVFile(file, csvDataHandler) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const contents = e.target.result;
        csvDataHandler(contents);
    };
    reader.readAsText(file);
}





/*----------------------------------------
  JSON DOWNLOADING
  --------------------------------------*/

function setupDownloadLink(jsonString, downloadFilename) {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = downloadFilename;

    return link;
}






/*----------------------------------------
  PRESENTATION LOGIC
  --------------------------------------*/

function renderDataAsRawJson(jsonObject) {
    console.log('jsonData (unprocessed): ', jsonObject);
    const jsonString = JSON.stringify(jsonObject, null, 2);

    const htmlContent = `
        <div class='json-preview'>
            <hr>
            <span class='sub-title'>JSON Preview</span>

            <pre class='json-data'>${jsonString}</pre>
        </div>
    `;
    
    return htmlContent;
}

function renderCSVDataAsTable(csvData) {
    const rows = csvData.split('\n');
    let tableHTML = "<table border='1'>";
    
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

function hideLoadCSVButton() {
    document.getElementById(loadCSVButtonId).style.display = 'none';
}

function showDownloadButton() {
    document.getElementById(downloadButtonId).style.display = 'block';
}

function showDataViewer(htmlContent) {
    const elementId = 'dataViewer';
    document.getElementById(elementId).innerHTML = htmlContent;
}

function showFilename(filename) {
    console.log('display filename: ', filename);
    const contentHTML = 'CSV file: ' + filename;
    document.getElementById('fileName').textContent = contentHTML;
}
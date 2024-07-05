document.getElementById('filePicker').addEventListener('change', function(event) {
    filePickerAction(event);
});

function handleLoadedCSV(csvData) {
    console.log('handle loaded CSV data');

    //display csv data as table
    // const dataPresentationHTML = renderCSVDataAsTable(csvData);

    //display loaded data as rawJson without processing data
    const convertCSVStraightToJSON = true;
    // const jsonData = csvToJson(csvData, convertCSVStraightToJSON);

    //process loaded data to structured data model
    const jsonData = csvToJson(csvData);

    const dataPresentationHTML = renderDataAsRawJson(jsonData);

    showDataViewer(dataPresentationHTML);
}








/*----------------------------------------
  DATA PROCESSING
  --------------------------------------*/

function csvToJson(csvData, convertStraight = false) {
    console.log('PARSING csv data to json');
    
    const rows = csvRows(csvData);
    const headers = csvHeaders(rows);

    return csvRowsToJson(rows, headers, convertStraight);
}

function csvRowsToJson(csvRows, headers, convertStraight) {
    const jsonObjectsPerRow = [];

    const firstRowAfterHeaders = 1;
    for (let i = firstRowAfterHeaders; i < csvRows.length; i++) {
        const row = csvRows[i].split(',');

        if (!rowIsValid(row, headers)) {
            const jsonObject = csvRowToJson(row, headers, convertStraight)
            jsonObjectsPerRow.push(jsonObject);
        }
    }

    return jsonObjectsPerRow;
}

function csvRowToJson(csvRow, csvHeaders, convertStraight) {
    const jsonObject = {};
    var attributeMap;

    if (!convertStraight) {
        attributeMap = mapHeadersToAttributes(csvHeaders);
        console.log('attribute map: ', attributeMap);
    }

    // Add attributes to the object based on the headers
    for (let cellIndex = 0; cellIndex < csvHeaders.length; cellIndex++) {
        
        
        if (!convertStraight) {
            console.log('PROCESSING csv data to json data model');

            const attribute = headerToMappedAttribute(csvHeaders[cellIndex], attributeMap);
            if (attributeIsCollection(attribute, attributeMap)) {
                if (!Array.isArray(jsonObject[attribute])) {
                    jsonObject[attribute] = [];
                }
                jsonObject[attribute].push(csvRow[cellIndex]);
            } else {
                jsonObject[attribute] = csvRow[cellIndex];
            }

        } else {
            console.log('CONVERTING csv data straign to json');
            const attribute = csvHeaders[cellIndex];
            jsonObject[attribute] = csvRow[cellIndex]; 
        }
    }

    return jsonObject;
}

function headerToMappedAttribute(header, attributeMap) {
    return attributeMap.headerMapping[header];
}

function attributeIsCollection(attribute, attributeMap) {
    return attributeMap.duplicateAttributes.includes(attribute)
}

function mapHeadersToAttributes(csvHeaders) {
    //handles csv files that use /_[0-9]/ suffix to handle multiple values for an attribute

    const headerMapping = {};
    const duplicateAttributes = [];

    for (let i = 0; i < csvHeaders.length; i++) {
        const header = csvHeaders[i];
        const attribute = trimDuplicateHeaderSuffix(header);

        if (header != attribute) {
            if (!duplicateAttributes.includes(attribute)) {
                duplicateAttributes.push(attribute);
            }            
        }

       headerMapping[header] = attribute;  
    }

    const attributeMap = {
        headers: csvHeaders,
        headerMapping: headerMapping,
        duplicateAttributes: duplicateAttributes
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
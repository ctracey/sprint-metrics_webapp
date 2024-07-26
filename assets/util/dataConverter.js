/*----------------------------------------
  RESTRUCTURE JSON
  --------------------------------------*/

function flattenJSON(obj, prefix = '') {
  return Object.keys(obj).reduce((acc, key) => {
    const pre = prefix.length ? prefix + '_' : '';
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      Object.assign(acc, flattenJSON(obj[key], pre + key));
    } else {
      acc[pre + key] = obj[key];
    }
    return acc;
  }, {});
}




/*----------------------------------------
  JSON TO CSV
  --------------------------------------*/

function convertJsonToCSV(jsonObject) {
    console.log('jsonObject', jsonObject);
    let csvString = '';

    let attributes = Object.keys(jsonObject);
    let values = Object.values(jsonObject);

    csvString = `${attributes.toString()}\n${values.toString()}`;
    console.log('csvString  ', csvString);

    return csvString;
}




/*----------------------------------------
  CSV TO JSON
  --------------------------------------*/

function csvToJson(csvRows) {
    console.log('PARSING csv data to json');
    
    const headers = csvHeaders(csvRows);

    return csvRowsToJson(csvRows, headers);
}

function csvHeaders(csvRows) {
    // Get the headers from the first row
    return csvRows[0];
}

function csvRowsToJson(csvRows, headers) {
    console.log('PROCESSING csv data to json data model');

    const jsonObjectsPerRow = [];
    let attributeMap = mapHeadersToAttributes(headers);
    console.log('attribute map: ', attributeMap);

    const firstRowAfterHeaders = 1;
    for (let i = firstRowAfterHeaders; i < csvRows.length; i++) {
        const row = csvRows[i];

        const jsonObject = csvRowToJson(row, attributeMap)
        jsonObjectsPerRow.push(jsonObject);
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

        if (cellValue) {
            //TODO: check undefined
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

        if (scannedHeaders.includes(header) && !collectionAttributes.includes(header)) {
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

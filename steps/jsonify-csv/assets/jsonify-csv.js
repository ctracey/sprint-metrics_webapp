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
        hideButton(loadCSVButtonId);

        loadedCsvFilename = file.name;
        showFilename(loadedCsvFilename);

        parseCSVFile(file, handleCsvLoaded);
    } else {
        showFilename('No file selected');
        showDataViewer('');
    }
}

function handleCsvLoaded(csvRows) {
    console.log('handle loaded CSV data');

    //process loaded data to structured data model
    convertedJsonData = csvToJson(csvRows);
    console.log('convertedJsonData', convertedJsonData);
    const dataPresentationHTML = renderDataAsRawJson(convertedJsonData, 'JSON Preview');

    showDataViewer(dataPresentationHTML);
    enableJsonPreviewToggle();

    showButton(downloadButtonId);
}

function handleDownloadJsonButtonClick(event) {
    const jsonString = JSON.stringify(convertedJsonData);
    const downloadFilename = convertCSVFilenameToJsonFilename(loadedCsvFilename);

    const link = setupJsonDownloadLink(jsonString, downloadFilename);
    link.click();

    showNextStepButton();
}

function convertCSVFilenameToJsonFilename(csvFilename) {
    return csvFilename.split('.')[0] + '.json';
}




/*----------------------------------------
  PRESENTATION LOGIC
  --------------------------------------*/

function showDataViewer(htmlContent) {
    const elementId = 'dataViewer';
    document.getElementById(elementId).innerHTML = htmlContent;
}

function showFilename(filename) {
    console.log('display filename: ', filename);
    const contentHTML = 'CSV file: ' + filename;
    document.getElementById('fileName').textContent = contentHTML;
}
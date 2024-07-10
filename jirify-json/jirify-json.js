let loadedJsonFilename = '';

const loadJsonButtonId = 'loadJsonButton';

document.getElementById(loadJsonButtonId).addEventListener('click', handleLoadJsonButtonClick);
document.getElementById('filePicker').addEventListener('change', handleFilePickerChange);





/*----------------------------------------
  ACTION HANDLERS
  --------------------------------------*/

function handleLoadJsonButtonClick(event) {
    document.getElementById('filePicker').click();
}

function handleFilePickerChange(event) {
    //TODO: handle errors

    const file = event.target.files[0];
    if (file) {
        hideLoadCSVButton();

        loadedJsonFilename = file.name;
        showFilename(loadedJsonFilename);

        loadJSONFile(file, handleJsonLoaded);
    } else {
        showFilename('No file selected');
        showDataViewer('');
    }
}

function handleJsonLoaded(loadedJsonText) {
    console.log('handle loaded Json data');

    const loadedJson = JSON.parse(loadedJsonText);
    console.log(loadedJson);

    //display csv data as table
    // const dataPresentationHTML = renderCSVDataAsTable(csvData);

    //process loaded data to structured data model
    // convertedJsonData = csvToJson(csvData);
    const dataPresentationHTML = renderDataAsRawJson(loadedJson);

    showDataViewer(dataPresentationHTML);
    // showDownloadButton();
}



/*----------------------------------------
  FILE LOADING
  --------------------------------------*/

function loadJSONFile(file, dataHandler) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const contents = e.target.result;
        dataHandler(contents);
    };
    reader.readAsText(file);
}




/*----------------------------------------
  PRESENTATION LOGIC
  --------------------------------------*/

function renderDataAsRawJson(jsonObject) {
    console.log('jsonData (unprocessed): ', jsonObject);
    const jsonString = JSON.stringify(jsonObject, null, 2);
    const dataContent = "<pre>" + jsonString + "</pre>";
    const title = "<hr><h3>JSON Preview</h3><br>";

    const htmlContent = '' + title + dataContent;
    return htmlContent;
}

function hideLoadCSVButton() {
    document.getElementById(loadJsonButtonId).style.display = 'none';
}

function showDataViewer(htmlContent) {
    const elementId = 'dataViewer';
    document.getElementById(elementId).innerHTML = htmlContent;
}

function showFilename(filename) {
    console.log('display filename: ', filename);
    const contentHTML = 'JSON file: ' + filename;
    document.getElementById('fileName').textContent = contentHTML;
}
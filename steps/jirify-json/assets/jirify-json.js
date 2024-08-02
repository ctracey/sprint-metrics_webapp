//needs config/workitem-model-definition-config.js to be sourced in html

let loadedJsonFilename = '';
let loadedJson;
let jirifiedJson;

const loadJsonButtonId = 'loadJsonButton';
const convertButtonId = 'convertButton';
const downloadButtonId = 'downloadButton';

document.getElementById(loadJsonButtonId).addEventListener('click', handleLoadJsonButtonClick);
document.getElementById('filePicker').addEventListener('change', handleFilePickerChange);
document.getElementById(convertButtonId).addEventListener('click', handleconvertButtonClick);
document.getElementById(downloadButtonId).addEventListener('click', handleDownloadJsonButtonClick);




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
        viewUtil.hideButton(loadJsonButtonId);

        loadedJsonFilename = file.name;
        showFilename(loadedJsonFilename);

        fileUtil.loadJSONFile(file, handleJsonLoaded);
    } else {
        showFilename('No file selected');
        showDataViewer('');
    }
}

function handleJsonLoaded(loadedJsonText) {
    console.log('handle loaded Json data');

    loadedJson = JSON.parse(loadedJsonText);
    console.log(loadedJson);

    let attributeChanges = analyseAttributeChanges(loadedJson);
    
    showWorkItemChangesPreview(attributeChanges);
    viewUtil.showButton(convertButtonId);
}

function handleconvertButtonClick(event) {
    viewUtil.hideButton(convertButtonId);

    jirifiedJson = jsonToJiraWorkitems();
    const dataPresentationHTML = renderDataAsRawJson(jirifiedJson, 'JSON Preview');

    showDataViewer(dataPresentationHTML);
    enableJsonPreviewToggle();
    viewUtil.showButton(downloadButtonId);
}

function handleDownloadJsonButtonClick(event) {
    const jsonString = JSON.stringify(jirifiedJson);

    const link = fileUtil.setupJsonDownloadLink(jsonString, downloadFileName());
    link.click();

    showNextStepButton();
}

function downloadFileName() {
    return loadedJsonFilename.split('.')[0] + '_jirified.json';
}




/*----------------------------------------
  PRESENTATION LOGIC
  --------------------------------------*/

function showWorkItemChangesPreview(attributeChanges) {
    let previewHTML = renderWorkItemChangesPreview(attributeChanges);
    showDataViewer(previewHTML);
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
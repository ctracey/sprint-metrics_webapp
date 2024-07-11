//needs defaultWorkitemModelDefinition.js to be sourced in html

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

    loadedJson = JSON.parse(loadedJsonText);
    console.log(loadedJson);

    const workItemModelDefinition = workitemModelDefinition();
    const loadedWorkitemAttributes = scanWorkitemAttributes(loadedJson);

    //TODO: enable config changes checkboxes   
    showWorkItemChangesPreview(workItemModelDefinition, loadedWorkitemAttributes);
    showConvertButton();
}

function handleconvertButtonClick(event) {
    hideConvertButton();

    jirifiedJson = jsonToJiraWorkitems();
    const dataPresentationHTML = renderDataAsRawJson(jirifiedJson);

    showDataViewer(dataPresentationHTML);
    showDownloadButton();
}

function handleDownloadJsonButtonClick(event) {
    const jsonString = JSON.stringify(jirifiedJson);

    const link = setupDownloadLink(jsonString, downloadFileName());
    link.click();
}

function downloadFileName() {
    return loadedJsonFilename.split('.')[0] + '_jirified.json';
}




/*----------------------------------------
  DATA PROCESSING
  --------------------------------------*/

function workitemModelDefinition() {
    return getDefaultWorkitemModelDefinition();
}

function getDefaultWorkitemModelDefinition() {
    //value set by including defaultWorkitemModelDefinition.js in html where this js script is used
    return defaultWorkitemModelDefinition;
}

function scanWorkitemAttributes(workitemsJson) {
    let scannedAttributes = [];

    workitemsJson.forEach(function(workitem) {
        workitemAttributes = Object.keys(workitem);
        workitemAttributes.forEach(function(attribute) {
            if (!scannedAttributes.includes(attribute)) {
                scannedAttributes.push(attribute);
            }
        });
    });

    return scannedAttributes;
}

function jsonToJiraWorkitems() {
    let jiraWorkitems = [];

    loadedJson.forEach(function(jsonObject) {
        let jiraWorkitem = jsonToJiraWorkitem(jsonObject);
        jiraWorkitems.push(jiraWorkitem);
    });

    return jiraWorkitems;
}

function jsonToJiraWorkitem(jsonObject) {
    let jiraWorkitem = {};

    let modelDefinition = workitemModelDefinition();
    let attributes = modelDefinition.attributes;
    
    //only keep attributes in model definition
    attributes.forEach(function(attribute) {
        jiraWorkitem[attribute] = jsonObject[attribute];
    });

    return jiraWorkitem;
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

function showWorkItemChangesPreview(workitemModelDefinition, availableAttributes) {
    let attributeChanges = [];
    availableAttributes.forEach(function (attribute) {
        let keepingAttribute = workitemModelDefinition.attributes.includes(attribute);
        attributeChange = renderAttributeChangeItem(attribute, keepingAttribute);
        attributeChanges.push(attributeChange);
    });

    let previewHTML = `
        <div>
            <hr>
            <span class='sub-title'>Workitem Changes Preview</span>
            <span class='heading'>attributes to keep:</span>

            <div class='attribute-preview'>
                <ul class='attributeChangesPreviewList'>
                    <li>${attributeChanges.join('</li><li>')}</li>
                </ul>
            </div>
        </div>
    `;

    showDataViewer(previewHTML);
}

function renderAttributeChangeItem(attribute, keepingAttribute) {
    let checked = keepingAttribute ? 'x' : '';
    return `[${checked}] ${attribute}`;
}

function renderDataAsRawJson(jsonObject) {
    console.log('jsonData (unprocessed): ', jsonObject);

    const jsonString = JSON.stringify(jsonObject, null, 2);

    const htmlContent = `
        <div class='json-preview'>
            <hr>
            <span class='sub-title'>Jirified</span>
            
            <pre class='json-data'>${jsonString}</pre>
        </div>
    `;

    return htmlContent;
}

function hideLoadCSVButton() {
    document.getElementById(loadJsonButtonId).style.display = 'none';
}

function showConvertButton() {
    document.getElementById(convertButtonId).style.display = 'block';
}

function hideConvertButton() {
    document.getElementById(convertButtonId).style.display = 'none';
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
    const contentHTML = 'JSON file: ' + filename;
    document.getElementById('fileName').textContent = contentHTML;
}
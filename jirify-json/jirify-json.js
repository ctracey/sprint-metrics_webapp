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

    const workItemModelDefinition = defaultWorkitemModelDefinition();
    const loadedWorkitemAttributes = scanWorkitemAttributes(loadedJson);

    showWorkItemChangesPreview(workItemModelDefinition, loadedWorkitemAttributes);


    //TODO: enable config changes
    // - checkboxes per workitem attribute    
}

function showWorkItemChangesPreview(workitemModelDefinition, availableAttributes) {
    let attributeChanges = [];
    availableAttributes.forEach(function (attribute) {
        if (workitemModelDefinition.attributes.includes(attribute)) {
            console.log(`[x] ${attribute}`);

            let attributePreview = `[x] ${attribute}`;
            attributeChanges.push(attributePreview);
        } else {
            console.log(`[ ] ${attribute}`);

            let attributePreview = `[ ] ${attribute}`;
            attributeChanges.push(attributePreview);
        }
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

function handleConvertAction() {
    // //process loaded json to data model representing jira workitems
    // //TODO: trigger this on user config confirmation
    // jirifiedJson = jsonToJiraWorkitems(loadedJson);


    // //Preview Jirified Json
    // const dataPresentationHTML = renderDataAsRawJson(jirifiedJson);

    // showDataViewer(dataPresentationHTML);
    // // showDownloadButton();
}

/*----------------------------------------
  DATA PROCESSING
  --------------------------------------*/

function defaultWorkitemModelDefinition() {
    //TODO: load from relative json file
    return {
        attributes: [
            'id',
            'labels'
        ]
    };
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

function jsonToJiraWorkitems(loadedJson) {
	//TODO: convert to workitem structure
    // - keep only chosen attributes
    // - ensure collection items are collections, even if only single value exists in current dataset

    return loadedJson;
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

function showDataViewer(htmlContent) {
    const elementId = 'dataViewer';
    document.getElementById(elementId).innerHTML = htmlContent;
}

function showFilename(filename) {
    console.log('display filename: ', filename);
    const contentHTML = 'JSON file: ' + filename;
    document.getElementById('fileName').textContent = contentHTML;
}
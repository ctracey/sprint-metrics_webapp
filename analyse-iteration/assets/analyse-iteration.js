let loadedJsonFilename = '';
let iterationWorkitems;

const loadJsonButtonId = 'loadJsonButton';
const filePickerId = 'filePicker';

document.getElementById(loadJsonButtonId).addEventListener('click', handleLoadJsonButtonClick);
document.getElementById('filePicker').addEventListener('change', handleFilePickerChange);




/*----------------------------------------
  ACTION HANDLERS
  --------------------------------------*/

function handleLoadJsonButtonClick(event) {
    document.getElementById(filePickerId).click();
}

function handleFilePickerChange(event) {
    //TODO: handle errors

    const file = event.target.files[0];
    if (file) {
    	console.log('loaded json');
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

    iterationWorkitems = JSON.parse(loadedJsonText);
    console.log(iterationWorkitems);

    analyseIteration(iterationWorkitems);
}




/*----------------------------------------
  DATA PROCESSING
  --------------------------------------*/

const workitemType_story = 'Story';
const workitemType_task = 'Task';

const attribute_issueType = 'Issue Type';

function analyseIteration(workitems) {
    issueTypes = scanWorkitemTypes(workitems);
    console.log('workitem types found: ', issueTypes);

    let nonStructuralWorkitems = filterNonStructuralWorkitems(workitems);
    //filter parent work items (epic, feature, initiative, etc)
}

function filterNonStructuralWorkitems(workitems) {
    console.log('Filtering nonstructural workitems: ', nonStructuralWorkitemTypes());

    let filter = {};
    filter[attribute_issueType] = nonStructuralWorkitemTypes();

    return filterWorkItems(workitems, filter);
}

function nonStructuralWorkitemTypes() {
    //TODO: configure this list
    return [
        workitemType_story,
        workitemType_task
    ];
}

function scanWorkitemTypes(workitems) {   
    let issueTypes = [];

    workitems.forEach(function(workitem) {
        issueType = workitem[attribute_issueType];
        if (!issueTypes.includes(issueType)) {
            issueTypes.push(issueType);
        }
    });

    return issueTypes;
}

function filterWorkItems(workitems, filter) {
    let filteredWorkitems = [];

    let filterAttributes = Object.keys(filter);

    workitems.forEach(function(workitem) {
        let filterMatch = true;

        filterAttributes.forEach(function(attribute) {
            workitemValue = workitem[attribute];

            if (!filter[attribute].includes(workitemValue)) {
                filterMatch = false;
            }
        })

        if (filterMatch) {
            filteredWorkitems.push(workitem);
        }
    });

    return filteredWorkitems;
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
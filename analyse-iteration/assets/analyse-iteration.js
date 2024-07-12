let loadedJsonFilename = '';
let iterationWorkitems;
let stats;

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
    console.log('loaded json');
    
    iterationWorkitems = JSON.parse(loadedJsonText);
    console.log(iterationWorkitems);
    
    analyseIteration(iterationWorkitems);

    //preview stats
    showAnalysisPreview(this.stats);
}




/*----------------------------------------
  DATA PROCESSING
  --------------------------------------*/

const WORKITEMTYPE_STORY = 'Story';
const WORKITEMTYPE_TASK = 'Task';
const WORKITEMTYPE_EXTERNALDEPENDENCY = 'External Dependency';
const WORKITEMSTATUS_DONE = 'Done';

const attribute_issueType = 'Issue Type';
const attribute_storyPoints = 'Custom field (Story Points)';
const attribute_status = 'Status';

function analyseIteration(allWorkitems) {
    console.log('ANALYSING work items');
    console.log('total work items in dataset: ', allWorkitems.length);

    let workitems = filterNonStructuralWorkitems(allWorkitems);
    
    this.stats = {
        estimate: {},
        throughput: {}
    };

    //backlog size
    this.stats.estimate.backlogSize = countStoryPoints(workitems);
    this.stats.throughput.backlogSize = workitems.length;

    //completed work
    const completedWorkitems = filterCompletedWorkItems(workitems);
    this.stats.estimate.completedTotal = countStoryPoints(completedWorkitems);
    this.stats.throughput.completedTotal = completedWorkitems.length;

    //not completed in sprint
    this.stats.estimate.notCompletedInSprint = notCompletedInSprint(this.stats.estimate.backlogSize, this.stats.estimate.completedTotal);
    this.stats.throughput.notCompletedInSprint = notCompletedInSprint(this.stats.throughput.backlogSize, this.stats.throughput.completedTotal);

    console.log('stats', stats);
}

function notCompletedInSprint(backlogSize, completedTotal) {
    return backlogSize - completedTotal;
}

function filterNonStructuralWorkitems(allWorkitems) {
    const issueTypes = scanWorkitemTypes(allWorkitems);
    console.log('workitem types found: ', issueTypes);

    let workitems = filterWorkitemsByIssueType(allWorkitems, nonStructuralWorkitemTypes());
    console.log('Filter nonstructural workitems: ', nonStructuralWorkitemTypes());

    return workitems;
}

function countStoryPoints(workitems) {
    let count = 0;

    workitems.forEach(function(workitem){
        let storyPoints = workitem[attribute_storyPoints];
        if (!isNaN(storyPoints)) {
            count += Number(storyPoints);
        }
    });

    return count;
}

function filterCompletedWorkItems(workitems) {
    let filter = {};
    filter[attribute_status] = WORKITEMSTATUS_DONE;

    return filterWorkItems(workitems, filter);
}

function filterWorkitemsByIssueType(workitems, workItemTypes) {
    let filter = {};
    filter[attribute_issueType] = workItemTypes;

    return filterWorkItems(workitems, filter);
}

function nonStructuralWorkitemTypes() {
    //TODO: configure this list
    return [
        WORKITEMTYPE_STORY,
        WORKITEMTYPE_TASK,
        WORKITEMTYPE_EXTERNALDEPENDENCY
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

function showAnalysisPreview(analysisStats) {
    console.log('analysisStats', analysisStats);
    let previewHTML = renderDataAsRawJson(analysisStats, 'Analysis Preview');

    showDataViewer(previewHTML);
}

function renderDataAsRawJson(jsonObject, title) {
    console.log('jsonData: ', jsonObject);

    const jsonString = JSON.stringify(jsonObject, null, 2);

    const htmlContent = `
        <div class='json-preview'>
            <hr>
            <span class='sub-title'>${title}</span>
            
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
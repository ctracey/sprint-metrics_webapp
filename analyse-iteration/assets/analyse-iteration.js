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
}




/*----------------------------------------
  DATA PROCESSING
  --------------------------------------*/

const workitemType_story = 'Story';
const workitemType_task = 'Task';
const workitemType_externalDependency = 'External Dependency';

const attribute_issueType = 'Issue Type';
const attribute_storyPoints = 'Custom field (Story Points)';
const attribute_status = 'Status';

function analyseIteration(allWorkitems) {
    console.log('ANALYSING work items');
    console.log('total work items in dataset: ', allWorkitems.length);

    let workitems = filterNonStructuralWorkitems(allWorkitems);
    
    let stats = {
        points: {},
        throughput: {}
    };

    //backlog size
    stats.points.backlogSize = countStoryPoints(workitems);
    stats.throughput.backlogSize = workitems.length;

    //completed work
    const completedWorkitems = filterCompletedWorkItems(workitems);
    stats.points.completedTotal = countStoryPoints(completedWorkitems);
    stats.throughput.completedTotal = completedWorkitems.length;

    //not completed in sprint
    stats.points.notCompletedInSprint = notCompletedInSprint(stats.points.backlogSize, stats.points.completedTotal);
    stats.throughput.notCompletedInSprint = notCompletedInSprint(stats.throughput.backlogSize, stats.throughput.completedTotal);

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
    filter[attribute_status] = 'Done';

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
        workitemType_story,
        workitemType_task,
        workitemType_externalDependency
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
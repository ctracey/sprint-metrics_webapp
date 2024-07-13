let loadedJsonFilename = '';
let iterationWorkitems;
let stats;

const loadJsonButtonId = 'loadJsonButton';
const filePickerId = 'filePicker';
const downloadButtonId = 'downloadButton';

document.getElementById(loadJsonButtonId).addEventListener('click', handleLoadJsonButtonClick);
document.getElementById('filePicker').addEventListener('change', handleFilePickerChange);
document.getElementById(downloadButtonId).addEventListener('click', handleDownloadJsonButtonClick);




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

    // showAnalysisPreview(getFlattenedStats());
    showAnalysisPreview(getStats());

    showDownloadButton();
}

function handleDownloadJsonButtonClick(event) {
    const jsonString = JSON.stringify(getFlattenedStats(getStats()));
    console.log('jsonString', jsonString);

    const link = setupDownloadLink(jsonString, downloadFileName());
    link.click();
}

function downloadFileName() {
    return loadedJsonFilename.split('.')[0] + '_analysis.json';
}




/*----------------------------------------
  DATA PROCESSING
  --------------------------------------*/

const WORKITEMTYPE_STORY = 'Story';
const WORKITEMTYPE_TASK = 'Task';
const WORKITEMTYPE_EXTERNALDEPENDENCY = 'External Dependency';
const WORKITEMSTATUS_DONE = 'Done';

const ATTRIBUTE_ISSUETYPE = 'Issue Type';
const ATTRIBUTE_STORYPOINTS = 'Custom field (Story Points)';
const ATTRIBUTE_STATUS = 'Status';
const ATTRIBUTE_LABELS = 'Labels';
const ATTRIBUTE_COMPONENTS = 'Components';


function getStats() {
    return this.stats;
}

function getFlattenedStats() {
    return flattenJSON(getStats());
}

function analyseIteration(allWorkitems) {
    console.log('ANALYSING work items');
    console.log('total work items in dataset: ', allWorkitems.length);

    let workitems = filterNonStructuralWorkitems(allWorkitems);
    console.log('total non structural work items in dataset: ', workitems.length);
    
    //TODO: why is last item blank
    // console.log('last: ', allWorkitems[allWorkitems.length-1]);

    this.stats = {};

    this.stats.sprintOverview = analyseSprintOverview(workitems);

    //TODO: filter to completed work items before analysing labels & components
    this.stats.labels = analyseLabels(workitems);
    this.stats.components = analyseComponents(workitems);

    console.log('stats', this.stats);
}

function analyseSprintOverview(workitems){
    let sprintOverview = {
        estimate: {},
        throughput: {}
    };

    //backlog size
    sprintOverview.estimate.backlogSize = countStoryPoints(workitems);
    sprintOverview.throughput.backlogSize = workitems.length;

    //completed work
    const completedWorkitems = filterCompletedWorkItems(workitems);
    sprintOverview.estimate.completedTotal = countStoryPoints(completedWorkitems);
    sprintOverview.throughput.completedTotal = completedWorkitems.length;

    //not completed in sprint
    sprintOverview.estimate.notCompletedInSprint = notCompletedInSprint(sprintOverview.estimate.backlogSize, sprintOverview.estimate.completedTotal);
    sprintOverview.throughput.notCompletedInSprint = notCompletedInSprint(sprintOverview.throughput.backlogSize, sprintOverview.throughput.completedTotal);

    return sprintOverview;
}

function analyseLabels(workitems) {
    return analyseAttribute(workitems, ATTRIBUTE_LABELS);
}

function analyseComponents(workitems) {
    return analyseAttribute(workitems, ATTRIBUTE_COMPONENTS);
}

function analyseAttribute(workitems, attribute) {
    let analysis = {};
    
    scanWorkitemAttributeValues(workitems, attribute).forEach(function(value) {
        filtered_workitems = filterByAttributeValue(workitems, attribute, value);
        analysis[value] = {
            count: filtered_workitems.length,
            storyPoints: countStoryPoints(filtered_workitems)
        }
    });

    return analysis;
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
        let storyPoints = workitem[ATTRIBUTE_STORYPOINTS];
        if (!isNaN(storyPoints)) {
            count += Number(storyPoints);
        }
    });

    return count;
}

function filterCompletedWorkItems(workitems) {
    let filter = {};
    filter[ATTRIBUTE_STATUS] = WORKITEMSTATUS_DONE;

    return filterWorkItems(workitems, filter);
}

function filterWorkitemsByIssueType(workitems, workItemTypes) {
    let filter = {};
    filter[ATTRIBUTE_ISSUETYPE] = workItemTypes;

    return filterWorkItems(workitems, filter);
}

function filterByAttributeValue(workitems, attribute, value) {
    let filter = {};
    filter[attribute] = value;

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
    return scanWorkitemAttributeValues(workitems, ATTRIBUTE_ISSUETYPE);
}

function scanWorkitemAttributeValues(workitems, attribute) {
    let attributeValues = [];

    workitems.forEach(function(workitem) {
        workitemValue = workitem[attribute];
        if (Array.isArray(workitemValue)) {
            workitemValue.forEach(function (value) {
                if (!attributeValues.includes(value)) {
                    attributeValues.push(value);
                }    
            });
        } else {
            if (!attributeValues.includes(workitemValue)) {
                attributeValues.push(workitemValue);
            }
        }
    });

    return attributeValues;
}

function filterWorkItems(workitems, filter) {
    let filteredWorkitems = [];

    let filterAttributes = Object.keys(filter);

    workitems.forEach(function(workitem) {
        let filterMatch = true;

        filterAttributes.forEach(function(attribute) {
            workitemValue = workitem[attribute];

            if (Array.isArray(filter[attribute])) {
                if (Array.isArray(workitemValue)) {
                    //TODO: test with array value vs multi value filter ???
                    workitemValue.forEach(function(value) {
                        filterMatch = filter[attribute].includes(workitemValue);
                    });
                } else {
                    filterMatch = filter[attribute].includes(workitemValue);
                }
            } else {
                if (Array.isArray(workitemValue)) {
                    filterMatch = workitemValue.includes(filter[attribute])
                } else {
                    filterMatch = workitemValue == filter[attribute];
                }
            }
        })

        if (filterMatch) {
            filteredWorkitems.push(workitem);
        }
    });

    return filteredWorkitems;
}

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

function hideLoadCSVButton() {
    document.getElementById(loadJsonButtonId).style.display = 'none';
}

function showDataViewer(htmlContent) {
    const elementId = 'dataViewer';
    document.getElementById(elementId).innerHTML = htmlContent;
}

function showDownloadButton() {
    document.getElementById(downloadButtonId).style.display = 'block';
}

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

function showFilename(filename) {
    console.log('display filename: ', filename);
    const contentHTML = 'JSON file: ' + filename;
    document.getElementById('fileName').textContent = contentHTML;
}
let loadedJsonFilename = '';
let iterationWorkitems;
let manualSprintData;
let stats;

const userInputSectionId = 'section_userInput';
const loadJsonButtonId = 'loadJsonButton';
const filePickerId = 'filePicker';
const downloadButtonId = 'downloadButton';
const analyseButtonId = 'analyseButton';

const input_squadNameId = 'input_squadName';
const input_sprintNameId = 'input_sprintName';

const input_sprintDateStartId = 'input_sprintDate-start';
const input_sprintDateEndId = 'input_sprintDate-end';
const input_committedAtStartOfSprintEstimateId = 'input_committedAtStartOfSprint-estimate';
const input_committedAtStartOfSprintThroughputId = 'input_committedAtStartOfSprint-throughput';
const input_removedFromSprintEstimateId = 'input_removedFromSprint-estimate';
const input_removedFromSprintThroughputId = 'input_removedFromSprint-throughput';

const input_strategy_bauCapacityAllocationPercentageId = 'input_strategy_bauCapacityAllocationPercentage';
const input_sprintPlanning_targetCapacity_estimateId = 'input_sprintPlanning_targetCapacity_estimate';
const input_sprintPlanning_targetCapacity_throughputId = 'input_sprintPlanning_targetCapacity_throughput';
const input_trends_velocityTrends_estimateId = 'input_trends_velocityTrends_estimate';
const input_trends_velocityTrends_throughputId = 'input_trends_velocityTrends_throughput';

document.getElementById(loadJsonButtonId).addEventListener('click', handleLoadJsonButtonClick);
document.getElementById('filePicker').addEventListener('change', handleFilePickerChange);
document.getElementById(analyseButtonId).addEventListener('click', handleAnalyseButtonClick);
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
        hideLoadJsonButton();

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

    showSprintDetailsForm();
}

function handleAnalyseButtonClick() {
    hideAnalyseButton();
    hideSprintDetailsForm();

    processManualSprintDetails();
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
const WORKITEMSTATUSCATEGORY_NOTSTARTED = 'To Do';
const WORKITEMSTATUSCATEGORY_INPROGRESS = 'In Progress';
const WORKITEMSTATUSCATEGORY_DONE = 'Done';

const ATTRIBUTE_ISSUETYPE = 'Issue Type';
const ATTRIBUTE_STORYPOINTS = 'Custom field (Story Points)';
const ATTRIBUTE_STATUS = 'Status';
const ATTRIBUTE_STATUS_CATEGORY = 'Status Category';
const ATTRIBUTE_LABELS = 'Labels';
const ATTRIBUTE_COMPONENTS = 'Components';

//TODO: configure this list
const EMERGENTWORK_LABELS = ['BAU', 'Improvement'];

function processManualSprintDetails() {
    this.manualSprintData = getSprintDetails();
    console.log('sprintDetails', this.manualSprintData);
}

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
    
    this.stats = {};

    this.stats.sprintName = this.manualSprintData.sprintName;
    this.stats.squadName = this.manualSprintData.squadName;
    this.stats.sprintDate = this.manualSprintData.sprintDate;

    //TODO: fix consistency of structure of objects with throughput & estimate values
    this.stats.sprintOverview = analyseSprintOverview(workitems);
    this.stats.sprintOverview.committedAtStartOfSprint = this.manualSprintData.committedAtStartOfSprint;
    this.stats.sprintOverview.removedFromSprint = this.manualSprintData.removedFromSprint;

    this.stats.sprintCompletion = analyseSprintCompletion(workitems);

    let completedWorkitems = filterCompletedWorkItems(workitems);
    
    this.stats.labels = analyseLabels(workitems);
    this.stats.components = analyseComponents(workitems);
    this.stats.completedLabels = analyseLabels(completedWorkitems);
    this.stats.completedComponents = analyseComponents(completedWorkitems);

    this.stats.emergentWork = analyseEmergentWork(this.stats.labels);

    this.stats.metricConfidence = {
        workitemGranularity: analyseWorkitemGranularity(this.stats.sprintOverview.estimate.backlogSize, this.stats.sprintOverview.throughput.backlogSize),
        unestimatedWorkPercentage: analyseUnestimatedWorkInSprint(workitems, this.stats.sprintOverview.throughput.backlogSize)
    }

    this.stats.strategy_bauCapacityAllocationPercentage = this.manualSprintData.strategy_bauCapacityAllocationPercentage;
    this.stats.sprintPlanning_targetCapacity = this.manualSprintData.sprintPlanning_targetCapacity;
    this.stats.trends_velocityTrends = {
        estimate: this.manualSprintData.trends_velocityTrends.estimate,
        throughput: this.manualSprintData.trends_velocityTrends.throughput,
    }

    this.stats.insights = analyseInsights();

    console.log('stats', this.stats);
}

function analyseInsights() {
    let achievableSprintGoal = {
        estimate: analyseAchievableSprintGoal(this.stats.sprintOverview.estimate.backlogSize, this.stats.sprintPlanning_targetCapacity.estimate),
        throughput: analyseAchievableSprintGoal(this.stats.sprintOverview.throughput.backlogSize, this.stats.sprintPlanning_targetCapacity.throughput)
    }
    let healthyPerformanceTarget = {
        estimate: analyseHealthyPerformanceTarget(this.stats.sprintOverview.estimate.completedTotal, this.stats.trends_velocityTrends.estimate),
        throughput: analyseHealthyPerformanceTarget(this.stats.sprintOverview.throughput.completedTotal, this.stats.trends_velocityTrends.throughput)
    }

    return {
        achievableSprintGoal: achievableSprintGoal,
        healthyPerformanceTarget: healthyPerformanceTarget
    }
}

function analyseAchievableSprintGoal(backlogSize, targetCapacity) {
    if (backlogSize < targetCapacity) {
        return true;
    }

    return false;
}

function analyseHealthyPerformanceTarget(completedInSprint, velocityTrend) {
    if ((completedInSprint - velocityTrend > 0) || (Math.abs(completedInSprint - velocityTrend) <= 5)) {
        return true;
    }
    
    return false;
}

function analyseEmergentWork(labels) {
    let emergentWork = {
        count: 0,
        storyPoints: 0
    };

    EMERGENTWORK_LABELS.forEach((label) => {
        labelStats = labels[label];
        if (labelStats) {
            emergentWork.count += labelStats.count;
            emergentWork.storyPoints += labelStats.storyPoints;    
        }
    });

    return emergentWork;
}

function analyseUnestimatedWorkInSprint(workitems, backlogItemCount) {
    let unestimatedWorkitems = filterUnestimatedWork(workitems);

    let totalUnestimatedWorkitems = unestimatedWorkitems.length;
    let percentageWorkUnestimated = (totalUnestimatedWorkitems/backlogItemCount*100).toFixed(0);

    return percentageWorkUnestimated;
}

function analyseWorkitemGranularity(backlogTotalPoints, backlogItemCount) {
    let granularity = backlogTotalPoints / backlogItemCount;
    let roundedGranularity = granularity.toFixed(1);

    return roundedGranularity;
}

function analyseSprintCompletion(workitems) {
    let sprintCompletion = {
        estimate: {},
        throughput: {}
    };

    sprintCompletion.throughput.notStarted = filterStatusCategory(workitems, WORKITEMSTATUSCATEGORY_NOTSTARTED).length;
    sprintCompletion.throughput.inProgress = filterStatusCategory(workitems, WORKITEMSTATUSCATEGORY_INPROGRESS).length;
    sprintCompletion.throughput.done = filterStatusCategory(workitems, WORKITEMSTATUSCATEGORY_DONE).length;

    sprintCompletion.estimate.notStarted = countStoryPoints(filterStatusCategory(workitems, WORKITEMSTATUSCATEGORY_NOTSTARTED));
    sprintCompletion.estimate.inProgress = countStoryPoints(filterStatusCategory(workitems, WORKITEMSTATUSCATEGORY_INPROGRESS));
    sprintCompletion.estimate.done = countStoryPoints(filterStatusCategory(workitems, WORKITEMSTATUSCATEGORY_DONE));

    return sprintCompletion;
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

function filterUnestimatedWork(workitems) {
    let unestimatedWorkitems = [];

    workitems.forEach(function(workitem) {
        let storyPoints = workitem[ATTRIBUTE_STORYPOINTS];
        if (!storyPoints) {
            unestimatedWorkitems.push(workitem);
        }
    });

    return unestimatedWorkitems;
}

function filterStatusCategory(workitems, category) {
    let filter = {};
    filter[ATTRIBUTE_STATUS_CATEGORY] = category;

    return filterWorkItems(workitems, filter);
}

function filterNonStructuralWorkitems(allWorkitems) {
    const issueTypes = scanWorkitemTypes(allWorkitems);
    console.log('workitem types found: ', issueTypes);

    let workitems = filterWorkitemsByIssueType(allWorkitems, nonStructuralWorkitemTypes());
    console.log('Filter nonstructural workitems: ', nonStructuralWorkitemTypes());

    return workitems;
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

function hideLoadJsonButton() {
    document.getElementById(loadJsonButtonId).style.display = 'none';
}

function showDataViewer(htmlContent) {
    const elementId = 'dataViewer';
    document.getElementById(elementId).innerHTML = htmlContent;
}

function showDownloadButton() {
    document.getElementById(downloadButtonId).style.display = 'block';
}

function showAnalyseButton() {
    document.getElementById(analyseButtonId).style.display = 'block';
}

function hideAnalyseButton() {
    document.getElementById(analyseButtonId).style.display = 'none';
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

function hideSprintDetailsForm() {
    document.getElementById(userInputSectionId).style.display = 'none';
}

function showSprintDetailsForm() {
    let sprintDetailsFornHTML = renderSprintDetailsForm();
    document.getElementById(userInputSectionId).innerHTML = sprintDetailsFornHTML;

    showAnalyseButton();
}

function renderSprintDetailsForm() {
    const htmlContent = `
        <hr>
        <span class='sub-title'>Manually Captured Data</span>

        <div id='sprintDetailsForm' class='sprintDetailsForm'>
            <div class='inputField'>
                <label for'${input_squadNameId}'>squad name</label>
                <input id='${input_squadNameId}' type='text'>
            </div>
            <div class='inputField'>
                <label for'${input_sprintNameId}'>sprint name</label>
                <input id='${input_sprintNameId}' type='text'>
            </div>

            <div class='formSection'>
                <span class='formSection-heading'>Extra Jira Data</span>
                <div class='inputField'>
                    <label for'${input_sprintDateStartId}'>sprint start date</label>
                    <input id='${input_sprintDateStartId}' type='text'>
                </div>
                <div class='inputField'>
                    <label for'${input_sprintDateEndId}'>sprint end date</label>
                    <input id='${input_sprintDateEndId}' type='text'>
                </div>
                <div class='inputField'>
                    <label for'${input_committedAtStartOfSprintEstimateId}'>committed at start of sprint (estimate)</label>
                    <input id='${input_committedAtStartOfSprintEstimateId}' type='text'>
                </div>
                <div class='inputField'>
                    <label for'${input_committedAtStartOfSprintThroughputId}'>committed at start of sprint (throughput)</label>
                    <input id='${input_committedAtStartOfSprintThroughputId}' type='text'>
                </div>
                <div class='inputField'>
                    <label for'${input_removedFromSprintEstimateId}'>removed from sprint (estimate)</label>
                    <input id='${input_removedFromSprintEstimateId}' type='text'>
                </div>
                <div class='inputField'>
                    <label for'${input_removedFromSprintThroughputId}'>removed from sprint (throughput)</label>
                    <input id='${input_removedFromSprintThroughputId}' type='text'>
                </div>
            </div>

            <div class='formSection'>
                <span class='formSection-heading'>Scrum Master Intel</span>
                <div class='inputField'>
                    <label for'${input_strategy_bauCapacityAllocationPercentageId}'>BAU Capacity Allocation Percentage</label>
                    <input id='${input_strategy_bauCapacityAllocationPercentageId}' type='text'>
                </div>
                <div class='inputField'>
                    <label for'${input_sprintPlanning_targetCapacity_estimateId}'>Sprint Planning Target Capacity (estimate)</label>
                    <input id='${input_sprintPlanning_targetCapacity_estimateId}' type='text'>
                </div>
                <div class='inputField'>
                    <label for'${input_sprintPlanning_targetCapacity_throughputId}'>Sprint Planning Target Capacity (throughput)</label>
                    <input id='${input_sprintPlanning_targetCapacity_throughputId}' type='text'>
                </div>
                <div class='inputField'>
                    <label for'${input_trends_velocityTrends_estimateId}'>Velocity Trends (estimate)</label>
                    <input id='${input_trends_velocityTrends_estimateId}' type='text'>
                </div>
                <div class='inputField'>
                    <label for'${input_trends_velocityTrends_throughputId}'>Velocity Trends (throughput)</label>
                    <input id='${input_trends_velocityTrends_throughputId}' type='text'>
                </div>
            </div>
        </div>
    `;

    return htmlContent;
}

function showFilename(filename) {
    console.log('display filename: ', filename);
    const contentHTML = 'JSON file: ' + filename;
    document.getElementById('fileName').textContent = contentHTML;
}

function getSprintDetails() {
    //rename this to refer to manual data
    let sprintDetails = {}
    
    sprintDetails.squadName = getInputValueById(input_squadNameId);
    sprintDetails.sprintName = getInputValueById(input_sprintNameId);

    //extra jira details
    sprintDetails.sprintDate = {
        start: getInputValueById(input_sprintDateStartId),
        end: getInputValueById(input_sprintDateEndId)
    };
    sprintDetails.committedAtStartOfSprint = {
        estimate: getInputValueById(input_committedAtStartOfSprintEstimateId),
        throughput: getInputValueById(input_committedAtStartOfSprintThroughputId)
    };
    sprintDetails.removedFromSprint = {
        estimate: getInputValueById(input_removedFromSprintEstimateId),
        throughput: getInputValueById(input_removedFromSprintThroughputId)
    };

    //scrum master intel
    sprintDetails.strategy_bauCapacityAllocationPercentage = getInputValueById(input_strategy_bauCapacityAllocationPercentageId);
    sprintDetails.sprintPlanning_targetCapacity = {
        estimate: getInputValueById(input_sprintPlanning_targetCapacity_estimateId),
        throughput: getInputValueById(input_sprintPlanning_targetCapacity_throughputId)
    };
    sprintDetails.trends_velocityTrends = {
        estimate: getInputValueById(input_trends_velocityTrends_estimateId),
        throughput: getInputValueById(input_trends_velocityTrends_throughputId)
    };    

    return sprintDetails;
}

function getInputValueById(inputElementId) {
    return document.getElementById(inputElementId).value
}
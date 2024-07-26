let loadedJsonFilename = '';
let iterationWorkitems;
let manualSprintData;
let stats;

const userInputSectionId = 'section_userInput';
const loadJsonButtonId = 'loadJsonButton';
const filePickerId = 'filePicker';
const downloadButtonId = 'downloadButton';
const analyseButtonId = 'analyseButton';
const nextStepButtonId = 'nextStepButton';

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
document.getElementById(nextStepButtonId).addEventListener('click', handleNextStepButtonClick);




/*----------------------------------------
  ACTION HANDLERS
  --------------------------------------*/

function handleNextStepButtonClick(event) {
    const link = document.createElement('a');
    link.href = event.target.getAttribute('href');
    link.click();
}

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
    showNextStepButton();
}

function handleDownloadJsonButtonClick(event) {
    let analysedStatsJson = getStats();

    // const analysisContent = prepareAnalysisAsJson(analysedStatsJson);
    // const link = setupDownloadLink(analysisContent, downloadFileName('json'));

    const analysisContent = prepareAnalysisAsCsv(analysedStatsJson);
    const link = setupDownloadLink(analysisContent, downloadFileName('csv'));

    link.click();
}

function prepareAnalysisAsJson(analysedStatsJson) {
    return JSON.stringify(analysedStatsJson, null, 2);
}

function prepareAnalysisAsCsv(analysedStatsJson) {
    let flattenedJson = getFlattenedStats(analysedStatsJson);
    console.log('flattenedJson', flattenedJson);

    let statsCsv = convertJsonToCSV(flattenedJson);
    console.log('statsCsv', statsCsv);

    return statsCsv;
}

function downloadFileName(fileType) {
    return loadedJsonFilename.split('.')[0] + '_analysis.' + fileType;
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

    this.stats.metricConfidence = analyseMetricConfidence(workitems, this.stats.sprintOverview.backlogSize);

    this.stats.strategy_bauCapacityAllocationPercentage = this.manualSprintData.strategy_bauCapacityAllocationPercentage;
    this.stats.sprintPlanning_targetCapacity = this.manualSprintData.sprintPlanning_targetCapacity;
    this.stats.trends_velocityTrends = {
        estimate: this.manualSprintData.trends_velocityTrends.estimate,
        throughput: this.manualSprintData.trends_velocityTrends.throughput,
    }

    this.stats.insights = analyseInsights();

    console.log('stats', this.stats);
}

function analyseMetricConfidence(workitems, backlogSize) {
    let totalUnestimatedWorkitems = filterUnestimatedWork(workitems).length;

    return {
        workitemGranularity: analyseWorkitemGranularity(backlogSize.estimate, backlogSize.throughput),
        totalUnestimatedWorkitems: totalUnestimatedWorkitems,
        unestimatedWorkPercentage: calculatePercentage(totalUnestimatedWorkitems, backlogSize.throughput)
    }
}

function analyseInsights() {
    let achievableSprintGoal = {
        estimate: analyseAchievableSprintGoal(this.stats.sprintOverview.backlogSize.estimate, this.stats.sprintPlanning_targetCapacity.estimate),
        throughput: analyseAchievableSprintGoal(this.stats.sprintOverview.backlogSize.throughput, this.stats.sprintPlanning_targetCapacity.throughput)
    }
    console.log('so', this.stats);
    let healthyPerformanceTarget = {
        estimate: analyseHealthyPerformanceTarget(this.stats.sprintOverview.completedTotal.estimate, this.stats.trends_velocityTrends.estimate),
        throughput: analyseHealthyPerformanceTarget(this.stats.sprintOverview.completedTotal.throughput, this.stats.trends_velocityTrends.throughput)
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

function analyseWorkitemGranularity(backlogTotalPoints, backlogItemCount) {
    let granularity = backlogTotalPoints / backlogItemCount;
    let roundedGranularity = granularity.toFixed(1);

    return roundedGranularity;
}

function analyseSprintCompletion(workitems) {
    let notStarted = {
        throughput: filterStatusCategory(workitems, WORKITEMSTATUSCATEGORY_NOTSTARTED).length,
        estimate: countStoryPoints(filterStatusCategory(workitems, WORKITEMSTATUSCATEGORY_NOTSTARTED))
    }

    let inProgress = {
        throughput: filterStatusCategory(workitems, WORKITEMSTATUSCATEGORY_INPROGRESS).length,
        estimate: countStoryPoints(filterStatusCategory(workitems, WORKITEMSTATUSCATEGORY_INPROGRESS))
    }

    let done = {
        throughput: filterStatusCategory(workitems, WORKITEMSTATUSCATEGORY_DONE).length,
        estimate: countStoryPoints(filterStatusCategory(workitems, WORKITEMSTATUSCATEGORY_DONE))
    }

    return {
        notStarted: notStarted,
        inProgress: inProgress,
        done: done
    };
}

function analyseSprintOverview(workitems){
    //backlog size
    let backlogSize = {
        estimate: countStoryPoints(workitems),
        throughput: workitems.length
    };

    //completed work
    const completedWorkitems = filterCompletedWorkItems(workitems);
    let completedTotal = {
        estimate: countStoryPoints(completedWorkitems),
        throughput: completedWorkitems.length
    };
    
    //not completed in sprint
    let notCompletedInSprint = {
        estimate: analyseNotCompletedInSprint(backlogSize.estimate, completedTotal.estimate),
        throughput: analyseNotCompletedInSprint(backlogSize.throughput, completedTotal.throughput)
    };

    return {
        backlogSize: backlogSize,
        completedTotal: completedTotal,
        notCompletedInSprint: notCompletedInSprint
    };
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

function analyseNotCompletedInSprint(backlogSize, completedTotal) {
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
        if (!isEstimated(storyPoints)) {
            unestimatedWorkitems.push(workitem);
        }
    });

    return unestimatedWorkitems;
}

function isEstimated(storyPoints) {
    return storyPoints && storyPoints > 0
}

function calculatePercentage(numerator, denominator) {
    return (numerator/denominator*100).toFixed(0);
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

function convertJsonToCSV(jsonObject) {
    console.log('jsonObject', jsonObject);
    let csvString = '';

    let attributes = Object.keys(jsonObject);
    let values = Object.values(jsonObject);

    csvString = `${attributes.toString()}\n${values.toString()}`;
    console.log('csvString  ', csvString);

    return csvString;
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

function showNextStepButton() {
    document.getElementById(nextStepButtonId).style.display = 'block';
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
    enableJsonPreviewToggle();
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
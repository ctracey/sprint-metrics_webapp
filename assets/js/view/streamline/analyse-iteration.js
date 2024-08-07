let loadedCsvFilename = '';
let parsedCSVRows;

const loadCSVButtonId = 'loadCSVButton';
const userInputSectionId = 'section_userInput';
const analyseButtonId = 'analyseButton';
const downloadButtonId = 'downloadButton';

document.getElementById(loadCSVButtonId).addEventListener('click', handleLoadCSVButtonClick);
document.getElementById('filePicker').addEventListener('change', handleFilePickerChange);
document.getElementById(analyseButtonId).addEventListener('click', handleAnalyseButtonClick);
document.getElementById(downloadButtonId).addEventListener('click', handleDownloadJsonButtonClick);

/*----------------------------------------
  ACTION HANDLERS
  --------------------------------------*/

function handleLoadCSVButtonClick(event) {
    logTitle('STEP: Load jira csv export');
    document.getElementById('filePicker').click();
}

function handleFilePickerChange(event) {
    // //TODO: handle errors

    const file = event.target.files[0];
    if (file) {
        viewUtil.hideButton(loadCSVButtonId);

        loadedCsvFilename = file.name;
        showFilename(loadedCsvFilename);

        fileUtil.parseCSVFile(file, handleCsvLoaded);
    } else {
        showFilename('No file selected');
        showDataViewer('');
    }
}

function handleCsvLoaded(csvRows) {
    console.log('handle loaded CSV data');
    parsedCSVRows = csvRows

    logTitle('STEP: Capture sprint details');
    showSprintDetailsForm();
}

function handleAnalyseButtonClick() {
    sprintDetails = sprintDetailsForm.getSprintDetails();
    console.log('sprintDetails', sprintDetails);

    viewUtil.hideButton(analyseButtonId);
    hideSprintDetailsForm();

    analyseIteration(parsedCSVRows, sprintDetails);

    logTitle('STEP: Enable iteration analysis download');
    viewUtil.showButton(downloadButtonId);
}

function handleDownloadJsonButtonClick(event) {
    let analysedStatsJson = getStats();

    const analysisContent = prepareAnalysisAsCsv(analysedStatsJson);
    const link = fileUtil.setupCsvDownloadLink(analysisContent, downloadFileName('csv'));

    link.click();

    showNextStepButton();
}




/*----------------------------------------
  DATA PROCESSING
  --------------------------------------*/

function analyseIteration(csvRows, sprintDetails) {
	let iterationWorkitems = processWorkitemData(csvRows);
    stats = analyseWorkitemData(iterationWorkitems, sprintDetails);
}

function analyseWorkitemData(iterationWorkitems, sprintDetails) {
    logTitle('STEP: Analyse iteration');

    let iterationAnalysis = analyseIterationStep.analyseIteration(iterationWorkitems, sprintDetails);
    console.log('iterationAnalysis', iterationAnalysis);

    return iterationAnalysis;
}

function processWorkitemData(csvRows) {
	//process loaded data to structured data model
    let parsedJsonData = converCsvToJson(csvRows);
    let workitems = convertJsonToWorkitemModel(parsedJsonData);

    return workitems;
}

function converCsvToJson(csvRows) {
    logTitle('STEP: Convert CSV to JSON');

    let jsonData = dataConverterUtil.csvToJson(csvRows);
    console.log('csv converted to json data: ', jsonData);

    return jsonData;
}

function convertJsonToWorkitemModel(parsedJsonData) {
	logTitle('STEP: Convert JSON to workitem model');
	let attributeChanges = jirifyJsonStep.analyseAttributeChanges(parsedJsonData);
	console.log('attribute changes: ', attributeChanges);

    let workitemModel = jirifyJsonStep.jsonToJiraWorkitems(parsedJsonData);
    console.log('workitem model: ', workitemModel);

    return workitemModel;
}

function getStats() {
    return stats;
}

function getFlattenedStats() {
    return dataConverterUtil.flattenJSON(getStats());
}




/*----------------------------------------
  FILE HANDLING
  --------------------------------------*/

function prepareAnalysisAsCsv(analysedStatsJson) {
    let flattenedJson = getFlattenedStats(analysedStatsJson);
    console.log('flattenedJson', flattenedJson);

    let statsCsv = dataConverterUtil.convertJsonToCSV(flattenedJson);
    console.log('statsCsv', statsCsv);

    return statsCsv;
}

function downloadFileName(fileType) {
    return loadedCsvFilename.split('.')[0] + '_analysis.' + fileType;
}




/*----------------------------------------
  PRESENTATION LOGIC
  --------------------------------------*/

function showSprintDetailsForm() {
    let sprintDetailsFornHTML = sprintDetailsForm.renderSprintDetailsForm();
    document.getElementById(userInputSectionId).innerHTML = sprintDetailsFornHTML;

    viewUtil.showButton(analyseButtonId);
}

function hideSprintDetailsForm() {
    document.getElementById(userInputSectionId).style.display = 'none';
}

function showFilename(filename) {
    console.log('display filename: ', filename);
    const contentHTML = 'CSV file: ' + filename;
    document.getElementById('fileName').textContent = contentHTML;
}

function logTitle(title) {
	console.log('\n------------------------------------------------------------------');
    console.log(`${title}\n\n`);
}

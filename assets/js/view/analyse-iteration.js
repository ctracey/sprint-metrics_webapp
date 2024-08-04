let loadedJsonFilename = '';
let iterationWorkitems;
let stats = {};

const userInputSectionId = 'section_userInput';
const loadJsonButtonId = 'loadJsonButton';
const filePickerId = 'filePicker';
const downloadButtonId = 'downloadButton';
const analyseButtonId = 'analyseButton';

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
    console.log('loaded json');
    
    iterationWorkitems = JSON.parse(loadedJsonText);
    console.log(iterationWorkitems);

    showSprintDetailsForm();
}

function handleAnalyseButtonClick() {
    viewUtil.hideButton(analyseButtonId);
    hideSprintDetailsForm();

    let analysisData = analyseIterationStep.analyseIteration(iterationWorkitems, sprintDetailsForm.getSprintDetails());
    stats = analysisData;

    // showAnalysisPreview(getFlattenedStats());
    showAnalysisPreview(getStats());

    viewUtil.showButton(downloadButtonId);
}

function handleDownloadJsonButtonClick(event) {
    let analysedStatsJson = getStats();

    // const analysisContent = prepareAnalysisAsJson(analysedStatsJson);
    // const link = fileUtil.setupJsonDownloadLink(analysisContent, downloadFileName('json'));

    const analysisContent = prepareAnalysisAsCsv(analysedStatsJson);
    const link = fileUtil.setupCsvDownloadLink(analysisContent, downloadFileName('csv'));

    link.click();

    showNextStepButton();
}




/*----------------------------------------
  DATA PROCESSING
  --------------------------------------*/

function getStats() {
    return stats;
}

function getFlattenedStats() {
    return dataConverterUtil.flattenJSON(getStats());
}




/*----------------------------------------
  FILE HANDLING
  --------------------------------------*/

function prepareAnalysisAsJson(analysedStatsJson) {
    return JSON.stringify(analysedStatsJson, null, 2);
}

function prepareAnalysisAsCsv(analysedStatsJson) {
    let flattenedJson = getFlattenedStats(analysedStatsJson);
    console.log('flattenedJson', flattenedJson);

    let statsCsv = dataConverterUtil.convertJsonToCSV(flattenedJson);
    console.log('statsCsv', statsCsv);

    return statsCsv;
}

function downloadFileName(fileType) {
    return loadedJsonFilename.split('.')[0] + '_analysis.' + fileType;
}




/*----------------------------------------
  PRESENTATION LOGIC
  --------------------------------------*/

function showDataViewer(htmlContent) {
    const elementId = 'dataViewer';
    document.getElementById(elementId).innerHTML = htmlContent;
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
    let sprintDetailsFornHTML = sprintDetailsForm.renderSprintDetailsForm();
    document.getElementById(userInputSectionId).innerHTML = sprintDetailsFornHTML;

    viewUtil.showButton(analyseButtonId);
}

function showFilename(filename) {
    console.log('display filename: ', filename);
    const contentHTML = 'JSON file: ' + filename;
    document.getElementById('fileName').textContent = contentHTML;
}

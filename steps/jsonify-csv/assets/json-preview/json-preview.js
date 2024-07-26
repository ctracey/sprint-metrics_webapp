const jsonPreviewToggleId = 'jsonPreviewToggle';
const jsonPreviewContentId = 'json-preview-content';

function enableJsonPreviewToggle() {
    document.getElementById(jsonPreviewToggleId).addEventListener('click', handleJsonPreviewToggleIdClick);
}

function handleJsonPreviewToggleIdClick(event) {
    jsonPreviewToggleState = !jsonPreviewToggleState;

    if (jsonPreviewToggleState) {
        showJsonPreview();    
    } else {
        hideJsonPreview();
    }
}

function showJsonPreview() {
    document.getElementById(jsonPreviewToggleId).innerHTML = '(hide)';
    document.getElementById(jsonPreviewContentId).style.display = 'block';
}

function hideJsonPreview() {
    document.getElementById(jsonPreviewToggleId).innerHTML = '(show)';
    document.getElementById(jsonPreviewContentId).style.display = 'none';
}




/*----------------------------------------
  PRESENTATION LOGIC
  --------------------------------------*/

function renderDataAsRawJson(jsonObject, title) {
    console.log('jsonData (unprocessed): ', jsonObject);
    const jsonString = JSON.stringify(jsonObject, null, 2);

    const htmlContent = `
        <div class='json-preview'>
            <hr>
            <span class='sub-title'>${title}</span>
            <span id='${jsonPreviewToggleId}' class='jsonPreviewToggle' title='display json preview'>(show)</span>

            <pre id='${jsonPreviewContentId}' style='display:none' class='json-data'>${jsonString}</pre>
        </div>
    `;
    
    return htmlContent;
}
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

        // loadJsonFile(file, handleCsvLoaded);
    } else {
        showFilename('No file selected');
        showDataViewer('');
    }
}




/*----------------------------------------
  PRESENTATION LOGIC
  --------------------------------------*/

function hideLoadCSVButton() {
    document.getElementById(loadJsonButtonId).style.display = 'none';
}

function showFilename(filename) {
    console.log('display filename: ', filename);
    const contentHTML = 'JSON file: ' + filename;
    document.getElementById('fileName').textContent = contentHTML;
}
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

function parseCSVFile(file, csvDataHandler) {
    Papa.parse(file, {
      header: false,
      dynamicTyping: true,
      complete: function(results) {
        console.log('Parsed csv rows: ', results.data);
        csvDataHandler(results.data);
      }
    });
}




/*----------------------------------------
  JSON DOWNLOADING
  --------------------------------------*/

function setupJsonDownloadLink(jsonString, downloadFilename) {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = downloadFilename;

    return link;
}

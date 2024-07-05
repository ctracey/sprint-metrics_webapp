document.getElementById('filePicker').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        document.getElementById('fileName').textContent = file.name;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const contents = e.target.result;
            displayCSV(contents);
        };
        reader.readAsText(file);
    } else {
        document.getElementById('fileName').textContent = 'No file selected';
        document.getElementById('csvContent').innerHTML = '';
    }
});

function displayCSV(contents) {
    const rows = contents.split('\n');
    let tableHTML = '<table border="1">';
    
    rows.forEach(row => {
        tableHTML += '<tr>';
        const cells = row.split(',');
        cells.forEach(cell => {
            tableHTML += `<td>${cell}</td>`;
        });
        tableHTML += '</tr>';
    });
    
    tableHTML += '</table>';
    document.getElementById('csvContent').innerHTML = tableHTML;
}
const nextStepButtonId = 'nextStepButton';

document.getElementById(nextStepButtonId).addEventListener('click', handleNextStepButtonClick);


function showNextStepButton() {
    document.getElementById(nextStepButtonId).style.display = 'block';
}

/*----------------------------------------
  ACTION HANDLERS
  --------------------------------------*/

function handleNextStepButtonClick(event) {
    const link = document.createElement('a');
    link.href = event.target.getAttribute('href');
    link.click();
}
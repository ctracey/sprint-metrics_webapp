const nextStepButtonId = 'nextStepButton';

document.getElementById(nextStepButtonId).addEventListener('click', handleNextStepButtonClick);




/*----------------------------------------
  ACTION HANDLERS
  --------------------------------------*/

function handleNextStepButtonClick(event) {
    const link = document.createElement('a');
    link.href = event.target.getAttribute('href');
    link.click();
}
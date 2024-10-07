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




const sprintDetailsForm = {
  renderSprintDetailsForm: () => {
      const htmlContent = `
          <hr>
          <span class='sub-title'>Manually Captured Data</span>

          <div id='sprintDetailsForm' class='sprintDetailsForm'>
              <div class='inputField'>
                  <label for'${input_squadNameId}'>squad name*</label>
                  <input id='${input_squadNameId}' type='text'>
              </div>
              <div class='inputField'>
                  <label for'${input_sprintNameId}'>sprint name*</label>
                  <input id='${input_sprintNameId}' type='text'>
              </div>

              <div class='formSection'>
                  <span class='formSection-heading'>Extra Jira Data</span>
                  <div class='inputField'>
                      <label for'${input_sprintDateStartId}'>sprint start date*</label>
                      <input id='${input_sprintDateStartId}' type='text'>
                  </div>
                  <div class='inputField'>
                      <label for'${input_sprintDateEndId}'>sprint end date*</label>
                      <input id='${input_sprintDateEndId}' type='text'>
                  </div>
                  <div class='inputField'>
                      <label for'${input_committedAtStartOfSprintEstimateId}'>committed at start of sprint (estimate)*</label>
                      <input id='${input_committedAtStartOfSprintEstimateId}' type='text'>
                  </div>
                  <div class='inputField'>
                      <label for'${input_committedAtStartOfSprintThroughputId}'>committed at start of sprint (throughput)*</label>
                      <input id='${input_committedAtStartOfSprintThroughputId}' type='text'>
                  </div>
                  <div class='inputField'>
                      <label for'${input_removedFromSprintEstimateId}'>removed from sprint (estimate)*</label>
                      <input id='${input_removedFromSprintEstimateId}' type='text'>
                  </div>
                  <div class='inputField'>
                      <label for'${input_removedFromSprintThroughputId}'>removed from sprint (throughput)*</label>
                      <input id='${input_removedFromSprintThroughputId}' type='text'>
                  </div>
              </div>

              <div class='formSection'>
                  <span class='formSection-heading'>Scrum Master Intel</span>
                  <div class='inputField'>
                      <label for'${input_strategy_bauCapacityAllocationPercentageId}'>BAU capacity allocation percentage</label>
                      <input id='${input_strategy_bauCapacityAllocationPercentageId}' type='text'>
                  </div>
                  <div class='inputField'>
                      <label for'${input_sprintPlanning_targetCapacity_estimateId}'>sprint planning target capacity (estimate)*</label>
                      <input id='${input_sprintPlanning_targetCapacity_estimateId}' type='text'>
                  </div>
                  <div class='inputField'>
                      <label for'${input_sprintPlanning_targetCapacity_throughputId}'>sprint planning target capacity (throughput)*</label>
                      <input id='${input_sprintPlanning_targetCapacity_throughputId}' type='text'>
                  </div>
                  <div class='inputField'>
                      <label for'${input_trends_velocityTrends_estimateId}'>velocity trends (estimate)*</label>
                      <input id='${input_trends_velocityTrends_estimateId}' type='text'>
                  </div>
                  <div class='inputField'>
                      <label for'${input_trends_velocityTrends_throughputId}'>velocity trends (throughput)*</label>
                      <input id='${input_trends_velocityTrends_throughputId}' type='text'>
                  </div>
              </div>

              <div class='formSection'>
                <div class='form-footnote'>* denotes mandatory fields</div>
              </div>
          </div>
      `;

      return htmlContent;
  },

  getSprintDetails: () => {
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
  },

}




/*----------------------------------------
  PRIVATE
  --------------------------------------*/

function getInputValueById(inputElementId) {
    return document.getElementById(inputElementId).value
}

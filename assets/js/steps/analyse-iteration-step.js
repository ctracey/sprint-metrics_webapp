const analyseIterationStep = {

	analyseIteration: (allWorkitems, manualSprintData) => {
	    console.log('ANALYSING work items');
	    console.log('total work items in dataset: ', allWorkitems.length);

	    let workitems = filterNonStructuralWorkitems(allWorkitems);
	    console.log('total non structural work items in dataset: ', workitems.length);
	    
	    let stats = {};

	    stats.sprintName = manualSprintData.sprintName;
	    stats.squadName = manualSprintData.squadName;
	    stats.sprintDate = manualSprintData.sprintDate;

	    stats.sprintOverview = analyseSprintOverview(workitems);
	    stats.sprintOverview.committedAtStartOfSprint = manualSprintData.committedAtStartOfSprint;
	    stats.sprintOverview.removedFromSprint = manualSprintData.removedFromSprint;

	    stats.sprintCompletion = analyseSprintCompletion(workitems);

	    let completedWorkitems = filterCompletedWorkItems(workitems);
	    
	    stats.labels = analyseLabels(workitems);
	    stats.components = analyseComponents(workitems);
	    stats.completedLabels = analyseLabels(completedWorkitems);
	    stats.completedComponents = analyseComponents(completedWorkitems);

	    stats.emergentWork = analyseEmergentWork(stats.labels);

	    stats.metricConfidence = analyseMetricConfidence(workitems, stats.sprintOverview.backlogSize);

	    stats.strategy_bauCapacityAllocationPercentage = manualSprintData.strategy_bauCapacityAllocationPercentage;
	    stats.sprintPlanning_targetCapacity = manualSprintData.sprintPlanning_targetCapacity;
	    stats.trends_velocityTrends = {
	        estimate: manualSprintData.trends_velocityTrends.estimate,
	        throughput: manualSprintData.trends_velocityTrends.throughput,
	    }

	    stats.insights = analyseInsights(stats);

	    console.log('analysed stats', stats);
	    return stats;
	},
}




/*----------------------------------------
  PRIVATE
  --------------------------------------*/

const WORKITEMTYPE_STORY = 'Story';
const WORKITEMTYPE_TASK = 'Task';
const WORKITEMTYPE_EXTERNALDEPENDENCY = 'External Dependency';
const WORKITEMSTATUS_DONE = 'Done';
const WORKITEMSTATUSCATEGORY_NOTSTARTED = 'To Do';
const WORKITEMSTATUSCATEGORY_INPROGRESS = 'In Progress';
const WORKITEMSTATUSCATEGORY_DONE = 'Done';

//TODO: configure this list
const EMERGENTWORK_LABELS = ['BAU', 'Improvement'];

const ATTRIBUTE_ISSUETYPE = 'Issue Type';
const ATTRIBUTE_STORYPOINTS = 'Custom field (Story Points)';
const ATTRIBUTE_STATUS = 'Status';
const ATTRIBUTE_STATUS_CATEGORY = 'Status Category';
const ATTRIBUTE_LABELS = 'Labels';
const ATTRIBUTE_COMPONENTS = 'Components';




/*----------------------------------------
  SCAN WORKITEMS
  --------------------------------------*/

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




/*----------------------------------------
  INSIGHTS
  --------------------------------------*/

function analyseInsights(stats) {
    let achievableSprintGoal = {
        estimate: analyseAchievableSprintGoal(stats.sprintOverview.backlogSize.estimate, stats.sprintPlanning_targetCapacity.estimate),
        throughput: analyseAchievableSprintGoal(stats.sprintOverview.backlogSize.throughput, stats.sprintPlanning_targetCapacity.throughput)
    }

    let healthyPerformanceTarget = {
        estimate: analyseHealthyPerformanceTarget(stats.sprintOverview.completedTotal.estimate, stats.trends_velocityTrends.estimate),
        throughput: analyseHealthyPerformanceTarget(stats.sprintOverview.completedTotal.throughput, stats.trends_velocityTrends.throughput)
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




/*----------------------------------------
  DATA CONFIDENCE
  --------------------------------------*/

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

function analyseMetricConfidence(workitems, backlogSize) {
    let totalUnestimatedWorkitems = filterUnestimatedWork(workitems).length;

    return {
        workitemGranularity: analyseWorkitemGranularity(backlogSize.estimate, backlogSize.throughput),
        totalUnestimatedWorkitems: totalUnestimatedWorkitems,
        unestimatedWorkPercentage: calculatePercentage(totalUnestimatedWorkitems, backlogSize.throughput)
    }
}

function analyseWorkitemGranularity(backlogTotalPoints, backlogItemCount) {
    let granularity = backlogTotalPoints / backlogItemCount;
    let roundedGranularity = granularity.toFixed(1);

    return roundedGranularity;
}

function calculatePercentage(numerator, denominator) {
    return (numerator/denominator*100).toFixed(0);
}





/*----------------------------------------
  METADATA
  --------------------------------------*/

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




/*----------------------------------------
  SPRINT OVERVIEW
  --------------------------------------*/

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




/*----------------------------------------
  SPRINT COMPLETION
  --------------------------------------*/

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




/*----------------------------------------
  FILTERS
  --------------------------------------*/

function filterNonStructuralWorkitems(allWorkitems) {
    const issueTypes = scanWorkitemTypes(allWorkitems);
    console.log('workitem types found: ', issueTypes);

    let workitems = filterWorkitemsByIssueType(allWorkitems, nonStructuralWorkitemTypes());
    console.log('Filter nonstructural workitems: ', nonStructuralWorkitemTypes());

    return workitems;
}

function filterWorkitemsByIssueType(workitems, workItemTypes) {
    let filter = {};
    filter[ATTRIBUTE_ISSUETYPE] = workItemTypes;

    return filterWorkItems(workitems, filter);
}

function filterCompletedWorkItems(workitems) {
    let filter = {};
    filter[ATTRIBUTE_STATUS] = WORKITEMSTATUS_DONE;

    return filterWorkItems(workitems, filter);
}

function filterStatusCategory(workitems, category) {
    let filter = {};
    filter[ATTRIBUTE_STATUS_CATEGORY] = category;

    return filterWorkItems(workitems, filter);
}

function filterByAttributeValue(workitems, attribute, value) {
    let filter = {};
    filter[attribute] = value;

    return filterWorkItems(workitems, filter);
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




/*----------------------------------------
  PROPERTIES
  --------------------------------------*/

function nonStructuralWorkitemTypes() {
    //TODO: configure this list
    return [
        WORKITEMTYPE_STORY,
        WORKITEMTYPE_TASK,
        WORKITEMTYPE_EXTERNALDEPENDENCY
    ];
}

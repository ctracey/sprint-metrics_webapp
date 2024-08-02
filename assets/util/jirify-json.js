function analyseAttributeChanges(workItemModelDefinition, workitemsJson) {
    const workitemAttributes = scanWorkitemAttributes(workitemsJson);

    //TODO: enable config changes checkboxes
    let attributeChanges = identifyAttributeChanges(workItemModelDefinition, workitemAttributes);

    return attributeChanges;
}

function scanWorkitemAttributes(workitemsJson) {
    let scannedAttributes = [];

    workitemsJson.forEach(function(workitem) {
        workitemAttributes = Object.keys(workitem);
        workitemAttributes.forEach(function(attribute) {
            if (!scannedAttributes.includes(attribute)) {
                scannedAttributes.push(attribute);
            }
        });
    });

    return scannedAttributes;
}

function identifyAttributeChanges(workitemModelDefinition, availableAttributes) {
    let attributeChanges = [];

    availableAttributes.forEach(function (attribute) {
        let attributeChange = {
            attribute: attribute,
            keep: workitemModelDefinition.attributes.includes(attribute),
            limitedToSingleValue: isAttributeLimitedToSingleValue(attribute)
        }

        attributeChanges.push(attributeChange);
    });

    return attributeChanges;
}

function jsonToJiraWorkitems(workitemModelDefinition) {
    let jiraWorkitems = [];

    loadedJson.forEach(function(jsonObject) {
        let jiraWorkitem = jsonToJiraWorkitem(jsonObject, workitemModelDefinition);
        jiraWorkitems.push(jiraWorkitem);
    });

    return jiraWorkitems;
}

function jsonToJiraWorkitem(jsonObject, workitemModelDefinition) {
    let jiraWorkitem = {};

    let attributes = workitemModelDefinition.attributes;
    
    //only keep attributes in model definition
    attributes.forEach(function(attribute) {
        let jsonValue = jsonObject[attribute];
        if (Array.isArray(jsonValue) && isAttributeLimitedToSingleValue(attribute)) {
            jsonValue = jsonValue[0];
        }
        jiraWorkitem[attribute] = jsonValue;
    });

    return jiraWorkitem;
}

function isAttributeLimitedToSingleValue(attribute) {
    return getWorkitemModelDefinition().singleValueLimitAttributes.includes(attribute);
}

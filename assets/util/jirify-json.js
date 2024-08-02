function analyseAttributeChanges(workitemsJson) {
    const workitemAttributes = scanWorkitemAttributes(workitemsJson);

    //TODO: enable config changes checkboxes
    let attributeChanges = identifyAttributeChanges(workitemAttributes);

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

function identifyAttributeChanges(availableAttributes) {
    let attributeChanges = [];

    let workitemModelDefinition = WorkitemModel.getInstance().getDefinition();
    let workitemModel = WorkitemModel.getInstance();

    availableAttributes.forEach((attribute) => {
        let attributeChange = {
            attribute: attribute,
            keep: workitemModel.hasAttribute(attribute),
            limitedToSingleValue: workitemModel.isAttributeLimitedToSingleValue(attribute)
        }

        attributeChanges.push(attributeChange);
    });

    return attributeChanges;
}

function jsonToJiraWorkitems() {
    let jiraWorkitems = [];

    loadedJson.forEach(function(jsonObject) {
        let jiraWorkitem = jsonToJiraWorkitem(jsonObject);
        jiraWorkitems.push(jiraWorkitem);
    });

    return jiraWorkitems;
}

function jsonToJiraWorkitem(jsonObject) {
    let jiraWorkitem = {};

    let workitemModel = WorkitemModel.getInstance();
    
    //only keep attributes in model definition
    workitemModel.getDefinitionAttributes().forEach(function(attribute) {
        let jsonValue = jsonObject[attribute];
        if (Array.isArray(jsonValue) && workitemModel.isAttributeLimitedToSingleValue(attribute)) {
            jsonValue = jsonValue[0];
        }
        jiraWorkitem[attribute] = jsonValue;
    });

    return jiraWorkitem;
}

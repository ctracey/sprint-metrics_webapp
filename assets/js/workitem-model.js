class WorkitemModel {
	
	static getInstance() {
        if (!WorkitemModel.instance) {
            WorkitemModel.instance = new WorkitemModel();
        }
        return WorkitemModel.instance;
    }

	constructor() {
		console.log('DEBUG: WorkitemModel#new');

		if (WorkitemModel.instance) {
            return WorkitemModel.instance;
        }

        //needs config/workitem-model-definition-config.js to be sourced in html
		this.workItemModelDefinition = defaultWorkitemModelDefinitionConfig;
    }

    hasAttribute(attributeName) {
    	return this.getDefinitionAttributes().includes(attributeName);
    }

    isAttributeLimitedToSingleValue(attributeName) {
	    return this.getSingleValueLimitAttributes().includes(attributeName);
	}

	getDefinition() {
    	return this.workItemModelDefinition;
    }

	getDefinitionAttributes() {
		return this.getDefinition().attributes;
	}

	getSingleValueLimitAttributes() {
		return this.getDefinition().singleValueLimitAttributes;
	}
}

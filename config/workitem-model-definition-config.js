const defaultWorkitemModelDefinitionConfig = {
    attributes: [
        'Components',
        'Labels',
        'Sprint',
        'Summary',
        'Issue key',
        'Issue Type',
        'Status',
        'Created',
        'Updated',
        'Custom field (Story Points)',
        'Parent',
        'Status Category',
        'Status Category Changed',
        'Resolution',
        'Resolved',
        'Custom field ([CHART] Time in Status)',
        'Parent',
        'Parent summary',
    ],
    singleValueLimitAttributes: [
        'Custom field (Story Points)',
    ],
    attributeValueReference: {
      'workitemStatus_Done': 'Done',
      // 'workitemStatus_Done': 'Closed',
      'workitemStatusCategory_Done': 'Done'
    },
    nonStructuralWorkitemTypes: [
      'Story',
      'Task',
      // 'QA Defect',
      // 'Bug',
      // 'Enabler',
      'External Dependency'
    ]
};

function renderWorkItemChangesPreview(attributeChanges) {
    let attributeChangeRecords = renderAttributeChangeRecords(attributeChanges);

    console.log('list:', `<li>${attributeChangeRecords.join('</li><li>')}</li>`);

    let previewHTML = `
        <div>
            <hr>
            <span class='sub-title'>Workitem Changes Preview</span>
            <span class='attribute-heading'>attributes to keep:</span>

            <div class='attribute-preview'>
                <ul class='attributeChangesPreviewList'>
                    <li>${attributeChangeRecords.join('</li><li>')}</li>
                </ul>
            </div>
        </div>
    `;

    return previewHTML;
}

function renderAttributeChangeRecords(attributeChanges) {
    let attributeChangeRecords = [];

    attributeChanges.forEach(function (attributeChange) {
        attributeChangeRecord = renderAttributeChangeItem(attributeChange);
        attributeChangeRecords.push(attributeChangeRecord);
    });

    return attributeChangeRecords;
}

function renderAttributeChangeItem(attributeChange) {
    let checked = attributeChange.keep ? 'x' : '';
    let onlyUseFirstValueWarning = attributeChange.limitedToSingleValue ? '(LIMITED TO SINGLE VALUE)' : '';
    return `[${checked}] ${attributeChange.attribute} ${onlyUseFirstValueWarning}`;
}

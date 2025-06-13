$(document).ready(function() {
    // Make field items draggable with improved settings
    $('.field-item').draggable({
        helper: 'clone',
        revert: 'invalid',
        zIndex: 1000,
        appendTo: 'body',
        start: function(event, ui) {
            $(ui.helper).addClass('ui-draggable-dragging');
        },
        stop: function(event, ui) {
            $(ui.helper).removeClass('ui-draggable-dragging');
        }
    });

    // Make field config container droppable and sortable
    $('#field-config-container')
        .droppable({
            accept: '.field-item',
            drop: function(event, ui) {
                const fieldType = ui.draggable.data('type');
                createFieldConfig(fieldType);
            },
            over: function(event, ui) {
                $(this).addClass('highlight-drop');
            },
            out: function(event, ui) {
                $(this).removeClass('highlight-drop');
            }
        })
        .sortable({
            items: '.field-config',
            handle: '.field-config-header',
            placeholder: 'field-config-placeholder',
            forcePlaceholderSize: true,
            update: function(event, ui) {
                updateAllPreviews();
            }
        });

    // Function to create field configuration
    function createFieldConfig(fieldType) {
        const fieldId = 'field_' + Date.now();
        let configHtml = `
            <div class="field-config" id="${fieldId}" data-field-type="${fieldType}">
                <div class="field-config-header">
                    <span class="field-title">${getFieldTypeLabel(fieldType)}</span>
                    <div class="field-actions">
                        <button class="btn btn-sm btn-outline-danger remove-field" data-field-id="${fieldId}">
                            <i class="bi bi-trash"></i> Remove
                        </button>
                        <button class="btn btn-sm btn-outline-primary toggle-config">
                            <i class="bi bi-chevron-down"></i>
                        </button>
                    </div>
                </div>
                <div class="field-config-body">
                    <div class="config-section">
                        <div class="config-section-title">Basic Settings</div>
                        <div class="mb-3">
                            <label class="form-label">Field Label</label>
                            <input type="text" class="form-control field-label" placeholder="Enter field label">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Field Name</label>
                            <input type="text" class="form-control field-name" placeholder="Enter field name (for form submission)">
                        </div>`;

        // Add placeholder field for all types except checkbox
        if (fieldType !== 'checkbox') {
            configHtml += `
                <div class="mb-3">
                    <label class="form-label">Placeholder</label>
                    <input type="text" class="form-control field-placeholder" placeholder="Enter placeholder text">
                </div>`;
        }

        configHtml += `
                        <div class="mb-3">
                            <div class="form-check">
                                <input class="form-check-input field-required" type="checkbox" id="required_${fieldId}">
                                <label class="form-check-label" for="required_${fieldId}">
                                    Required
                                </label>
                            </div>
                        </div>
                    </div>`;

        // Add type-specific configuration
        if (fieldType === 'select') {
            configHtml += `
                <div class="config-section">
                    <div class="config-section-title">Select Options</div>
                    <div class="mb-3">
                        <label class="form-label">Options (one per line)</label>
                        <textarea class="form-control field-options" rows="3" placeholder="Option 1&#10;Option 2&#10;Option 3"></textarea>
                    </div>
                    <div class="mb-3">
                        <div class="form-check">
                            <input class="form-check-input field-multiple" type="checkbox" id="multiple_${fieldId}">
                            <label class="form-check-label" for="multiple_${fieldId}">
                                Allow Multiple Selection
                            </label>
                        </div>
                    </div>
                </div>`;
        } else if (fieldType === 'checkbox') {
            configHtml += `
                <div class="config-section">
                    <div class="config-section-title">Checkbox Settings</div>
                    <div class="mb-3">
                        <div class="form-check">
                            <input class="form-check-input field-default" type="checkbox" id="default_${fieldId}">
                            <label class="form-check-label" for="default_${fieldId}">
                                Checked by Default
                            </label>
                        </div>
                    </div>
                </div>`;
        }

        configHtml += `
                    <div class="text-end">
                        <button class="btn btn-primary btn-sm update-preview" data-field-id="${fieldId}">Update Preview</button>
                    </div>
                </div>
            </div>`;

        $('#field-config-container').append(configHtml);
        updatePreview(fieldId);
    }

    // Function to get additional configuration based on field type
    function getAdditionalConfig(fieldType) {
        switch(fieldType) {
            case 'number':
                return `
                    <div class="config-section">
                        <div class="config-section-title">Number Settings</div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">Min Value</label>
                                    <input type="number" class="form-control field-min">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">Max Value</label>
                                    <input type="number" class="form-control field-max">
                                </div>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Step Value</label>
                            <input type="number" class="form-control field-step" value="1">
                        </div>
                    </div>
                `;
            case 'select':
                return `
                    <div class="config-section">
                        <div class="config-section-title">Select Options</div>
                        <div class="mb-3">
                            <label class="form-label">Options (one per line)</label>
                            <textarea class="form-control field-options" rows="3" placeholder="Option 1&#10;Option 2&#10;Option 3"></textarea>
                        </div>
                        <div class="mb-3">
                            <div class="form-check">
                                <input class="form-check-input field-multiple" type="checkbox" id="multiple_${fieldId}">
                                <label class="form-check-label" for="multiple_${fieldId}">
                                    Allow Multiple Selection
                                </label>
                            </div>
                        </div>
                    </div>
                `;
            case 'textarea':
                return `
                    <div class="config-section">
                        <div class="config-section-title">Textarea Settings</div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">Rows</label>
                                    <input type="number" class="form-control field-rows" value="3">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">Max Length</label>
                                    <input type="number" class="form-control field-maxlength">
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            case 'text':
            case 'email':
                return `
                    <div class="config-section">
                        <div class="config-section-title">Validation Settings</div>
                        <div class="mb-3">
                            <label class="form-label">Pattern (Regex)</label>
                            <input type="text" class="form-control field-pattern" placeholder="e.g., [A-Za-z]{3,}">
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">Min Length</label>
                                    <input type="number" class="form-control field-minlength">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">Max Length</label>
                                    <input type="number" class="form-control field-maxlength">
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            case 'checkbox':
                return `
                    <div class="config-section">
                        <div class="config-section-title">Checkbox Settings</div>
                        <div class="mb-3">
                            <div class="form-check">
                                <input class="form-check-input field-default" type="checkbox" id="default_${fieldId}">
                                <label class="form-check-label" for="default_${fieldId}">
                                    Checked by Default
                                </label>
                            </div>
                        </div>
                    </div>
                `;
            default:
                return '';
        }
    }

    // Function to update preview
    function updatePreview(fieldId) {
        const config = $(`#${fieldId}`);
        const fieldType = config.data('field-type');
        const label = config.find('.field-label').val() || 'New Field';
        const name = config.find('.field-name').val() || `field_${fieldId}`;
        const required = config.find('.field-required').is(':checked');

        let fieldHtml = '';

        if (fieldType === 'checkbox') {
            const defaultChecked = config.find('.field-default').is(':checked');
            fieldHtml = `
                <div class="mb-3" id="preview_${fieldId}">
                    <div class="form-check">
                        <input type="checkbox" 
                            class="form-check-input" 
                            name="${name}"
                            id="preview_checkbox_${fieldId}"
                            ${required ? 'required' : ''}
                            ${defaultChecked ? 'checked' : ''}>
                        <label class="form-check-label" for="preview_checkbox_${fieldId}">
                            ${label}${required ? ' <span class="text-danger">*</span>' : ''}
                        </label>
                    </div>
                </div>`;
        } else if (fieldType === 'select') {
            const options = config.find('.field-options').val();
            const multiple = config.find('.field-multiple').is(':checked');
            const placeholder = config.find('.field-placeholder').val() || 'Select an option';
            
            fieldHtml = `
                <div class="mb-3" id="preview_${fieldId}">
                    <label class="form-label" for="preview_select_${fieldId}">${label}${required ? ' <span class="text-danger">*</span>' : ''}</label>
                    <select class="form-select" 
                        id="preview_select_${fieldId}"
                        name="${name}"
                        ${required ? 'required' : ''}
                        ${multiple ? 'multiple' : ''}>
                        <option value="">${placeholder}</option>`;
            
            if (options) {
                const optionList = options.split('\n').filter(opt => opt.trim());
                optionList.forEach(opt => {
                    fieldHtml += `<option value="${opt.trim()}">${opt.trim()}</option>`;
                });
            }
            
            fieldHtml += `</select></div>`;
        } else {
            // Handle other field types as before
            const placeholder = config.find('.field-placeholder').val();
            fieldHtml = `
                <div class="mb-3" id="preview_${fieldId}">
                    <label class="form-label">${label}${required ? ' <span class="text-danger">*</span>' : ''}</label>`;

            switch(fieldType) {
                case 'text':
                case 'email':
                case 'number':
                    const min = config.find('.field-min').val();
                    const max = config.find('.field-max').val();
                    const step = config.find('.field-step').val();
                    const pattern = config.find('.field-pattern').val();
                    const minlength = config.find('.field-minlength').val();
                    const maxlength = config.find('.field-maxlength').val();

                    fieldHtml += `
                        <input type="${fieldType}" 
                            class="form-control" 
                            name="${name}"
                            placeholder="${placeholder}"
                            ${required ? 'required' : ''}
                            ${min ? `min="${min}"` : ''}
                            ${max ? `max="${max}"` : ''}
                            ${step ? `step="${step}"` : ''}
                            ${pattern ? `pattern="${pattern}"` : ''}
                            ${minlength ? `minlength="${minlength}"` : ''}
                            ${maxlength ? `maxlength="${maxlength}"` : ''}>
                    `;
                    break;

                case 'textarea':
                    const rows = config.find('.field-rows').val() || 3;
                    const textareaMaxlength = config.find('.field-maxlength').val();
                    fieldHtml += `
                        <textarea class="form-control" 
                            name="${name}"
                            rows="${rows}"
                            placeholder="${placeholder}"
                            ${required ? 'required' : ''}
                            ${textareaMaxlength ? `maxlength="${textareaMaxlength}"` : ''}></textarea>
                    `;
                    break;
            }

            if (fieldType !== 'checkbox' && fieldType !== 'select') {
                fieldHtml += '</div>';
            }
        }

        // Remove existing preview if any
        $(`#preview_${fieldId}`).remove();
        // Add new preview
        $('#preview-form').append(fieldHtml);
    }

    // Function to update all previews
    function updateAllPreviews() {
        $('#field-config-container .field-config').each(function() {
            const fieldId = $(this).attr('id');
            updatePreview(fieldId);
        });
    }

    // Function to get field type label
    function getFieldTypeLabel(type) {
        const labels = {
            text: 'Text Input',
            email: 'Email Input',
            number: 'Number Input',
            checkbox: 'Checkbox',
            select: 'Select Dropdown',
            textarea: 'Text Area'
        };
        return labels[type] || type;
    }

    // Event delegation for remove and update buttons
    $(document).on('click', '.remove-field', function() {
        const fieldId = $(this).data('field-id');
        $(`#${fieldId}`).remove();
        $(`#preview_${fieldId}`).remove();
    });

    $(document).on('click', '.update-preview', function() {
        const fieldId = $(this).data('field-id');
        updatePreview(fieldId);
    });

    // Toggle configuration panel with animation
    $(document).on('click', '.toggle-config', function() {
        const config = $(this).closest('.field-config');
        const body = config.find('.field-config-body');
        const icon = $(this).find('i');
        
        if (config.hasClass('active')) {
            body.slideUp(200, function() {
                config.removeClass('active');
            });
            icon.removeClass('bi-chevron-up').addClass('bi-chevron-down');
        } else {
            config.addClass('active');
            body.slideDown(200);
            icon.removeClass('bi-chevron-down').addClass('bi-chevron-up');
        }
    });

    // Generate JSON button click handler
    $('#generate-json').click(function() {
        const formStructure = [];
        $('#field-config-container .field-config').each(function() {
            const config = $(this);
            const fieldType = config.data('field-type');
            const fieldData = {
                type: fieldType,
                label: config.find('.field-label').val(),
                name: config.find('.field-name').val(),
                required: config.find('.field-required').is(':checked')
            };

            // Add placeholder for all types except checkbox
            if (fieldType !== 'checkbox') {
                fieldData.placeholder = config.find('.field-placeholder').val();
            }

            // Add additional properties based on field type
            switch(fieldType) {
                case 'number':
                    fieldData.min = config.find('.field-min').val();
                    fieldData.max = config.find('.field-max').val();
                    fieldData.step = config.find('.field-step').val();
                    break;
                case 'select':
                    fieldData.options = config.find('.field-options').val().split('\n').filter(opt => opt.trim());
                    fieldData.multiple = config.find('.field-multiple').is(':checked');
                    break;
                case 'textarea':
                    fieldData.rows = config.find('.field-rows').val();
                    fieldData.maxlength = config.find('.field-maxlength').val();
                    break;
                case 'text':
                case 'email':
                    fieldData.pattern = config.find('.field-pattern').val();
                    fieldData.minlength = config.find('.field-minlength').val();
                    fieldData.maxlength = config.find('.field-maxlength').val();
                    break;
                case 'checkbox':
                    fieldData.default = config.find('.field-default').is(':checked');
                    break;
            }

            formStructure.push(fieldData);
        });

        const jsonOutput = JSON.stringify(formStructure, null, 2);
        $('#json-output').text(jsonOutput).show();
        $('#download-json').prop('disabled', false);
    });

    // Download JSON button click handler
    $('#download-json').click(function() {
        const jsonOutput = $('#json-output').text();
        if (!jsonOutput) return;

        const blob = new Blob([jsonOutput], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'form-structure.json';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    });
}); 
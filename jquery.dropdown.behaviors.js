const PREFERRED = " (preferred)";
const COMPUTE_METHODS = {
    INCLUDE: "include",
    EXCLUDE: "exculde",
    LESSTHAN: "lessthan",
    GREATERTHAN: "greaterthan",
    ANY: "any"
};
const MARKUP = {
    PREFERRED: " (preferred)",
    QUALIFIED: " (qualified)",
};


function dropdown_ClearSelection(element) {
    element.data('dropdown').reset();
    dropdown_Blur(element);
}

function dropdown_Blur(element) {
    //Hack for now to blur. Something with events from control stop it blurring on revert
    setTimeout(function () {
        $(element).removeClass("active");
    }, 50);
}

function dropDown_Revert(element, fieldsArray, candidateOptionsArray, dataForCountsArray, computeMethod,
    markup, onChoiceSelectedCallback, filterEmpty) {

    element.data('dropdown').destroy();
    dropdown_Populate(element, fieldsArray, candidateOptionsArray, dataForCountsArray, true,
        computeMethod, markup, onChoiceSelectedCallback, filterEmpty);
    dropdown_ToggleRevertVisibility(element, candidateOptionsArray, markup);
    dropdown_Blur(element);
}

function dropdown_ToggleRevertVisibility(element, candidateOptionsArray, markup) {

    var revertEl = $(element).children(".revert");

    if (candidateOptionsArray.length == 0) {
        revertEl.css("display", "none");
        return;
    }

    var list = $(element).find(".dropdown-chose");

    if (!candidateOptionsArray.some(isNaN)) {
        candidateOptionsArray = candidateOptionsArray.map(String);
    }

    //check markups are seleected
    var itemMatchedCount = 0;
    var result = $.each(list, function (index, value) {

        var option = drowdown_RemoveCountFromOption(value.outerText);
        option = option.replace(markup, "");//remove markup
        var exists = candidateOptionsArray.includes(option);
        if (exists) {
            itemMatchedCount++;
        }
    });

    if (itemMatchedCount != candidateOptionsArray.length) {
        revertEl.css("display", "block");
        return;
    }

    if (candidateOptionsArray.length != list.length) {
        revertEl.css("display", "block");
        return;
    }

    revertEl.css("display", "none");
    return;
}

function dropdown_Populate(element, fieldsArray, candidateOptions,
    dataForCountsArray, selectPreferences, computeMethod, markup, onChoiceSelectedCallback, filterEmpty) {
    //1. Create the options objects
    var menuItemsArray = [];
    $.each(fieldsArray, function (index, value) {

        var preference = _.contains(candidateOptions, value);

        //var count = _.countBy(dataForCountsArray)

        var name = value;
        if (preference) {
            name += markup;
        }

        var menuItem = {
            "id": index,
            "disabled": false,
            "selected": selectPreferences & preference,
            "name": name
        };

        menuItemsArray.push(menuItem);
    });



    $(element).dropdown({
        data: menuItemsArray,
        multipleMode: 'label',
        searchable: true,
        choice: function () {
            dropdown_ToggleRevertVisibility($(element), candidateOptions, markup);
            onChoiceSelectedCallback();
        }
    });

    dropdown_SetRevertCounts(element, dataForCountsArray, candidateOptions, computeMethod, filterEmpty);
    dropdown_SetCountsForOptions(element, dataForCountsArray, computeMethod, filterEmpty);
    dropdown_ToggleRevertVisibility(element, candidateOptions, markup, onChoiceSelectedCallback);

    dropdown_Blur(element);

}

function dropdown_GetSelectedArray(element, markup) {
    var list = $(element).find(".dropdown-chose");

    var out = [];
    $.each(list, function (index, value) {
        var option = value.outerText.replace(markup, "");

        option = drowdown_RemoveCountFromOption(option);

        out.push(option);
    });

    return out;
}

function dropdown_CalculateCounts(dataForCountsArray, candidateOptions, computeMethod, filterEmpty) {

    //add counts - assumes an array of options
    var preferencesMatchCount = 0;
    var includeEmpty = !filterEmpty;
    $.each(dataForCountsArray, function (index, value) {

        if (computeMethod == COMPUTE_METHODS.INCLUDE) {

            var match = false;
            if (!value || value == "" || value.length == 0) {
                match = includeEmpty;
            }
            else if (Array.isArray(value)) {
                match = candidateOptions?.every(elem => value.includes(elem));
            } else {
                match = candidateOptions?.includes(value);
            }

            if (match) {
                preferencesMatchCount++;
            }
        }
        else if (computeMethod == COMPUTE_METHODS.EXCLUDE) { //exclude
            var match = false;
            if (!value || value == "" || value.length == 0) {
                match = includeEmpty;
            }
            else {
                match = !candidateOptions?.some(elem => value.includes(elem));
            }

            if (match) {
                preferencesMatchCount++;
            }
        }
        else if (computeMethod == COMPUTE_METHODS.LESSTHAN) {

            var candidateOption = Math.max(candidateOptions);
            var match = false;

            if (!value || value == "" || value.length == 0) {
                match = includeEmpty;
            }
            else if (candidateOption >= value) {
                match = true;
            }

            if (match) {
                preferencesMatchCount++;
            }
        }
        else if (computeMethod == COMPUTE_METHODS.GREATERTHAN) {

            var candidateOption = Math.min(candidateOptions);
            var match = false;

            if (!value || value == "" || value.length == 0) {
                match = includeEmpty;
            }
            else if (candidateOption <= value) {
                match = true;
            }

            if (match) {
                preferencesMatchCount++;
            }
        }
        else if (computeMethod == COMPUTE_METHODS.ANY) {
            var match = false;
            if (!value || value == "" || value.length == 0) {
                match = includeEmpty;
            }
            else if (Array.isArray(value)) {
                match = value?.some(elem => candidateOptions.includes(elem));
            } else {
                match = candidateOptions?.includes(value);
            }

            if (match) {
                preferencesMatchCount++;
            }
        }

    });
    return preferencesMatchCount;
}

function dropdown_SetRevertCount(element, filteredDataForCountsArray, candidateOptionsArray, computeMethod, filterEmpty) {
    //add counts - assumes an array of options
    var preferencesMatchCount = dropdown_CalculateCounts(filteredDataForCountsArray, candidateOptionsArray, computeMethod, filterEmpty);

    var revertEl = $(element).children(".revert");
    if (revertEl) {
        revertEl.text("Revert [" + preferencesMatchCount + " jobs]");
    }
}

var COUNTDELIM = " - [";
function drowdown_RemoveCountFromOption(option) {

    if (!option) {
        return option;
    }

    //remove count if exists
    var countIndex = option.indexOf(COUNTDELIM);
    if (countIndex != -1) {
        option = option.substring(0, countIndex);
    }

    return option;
}

function dropdown_GetOptionsArrayWithoutCountsAndMarkups(element) {
    var list = $(element).find(".dropdown-option");

    //Still will have preference markups

    var out = [];
    $.each(list, function (index, value) {
        var txtValue = drowdown_RemoveCountFromOption(value.outerText);

        //remove markup
        txtValue = txtValue.replace(MARKUP.PREFERRED, "");
        txtValue = txtValue.replace(MARKUP.QUALIFIED, "");

        out.push(txtValue);
    });

    return out;
}


function dropdown_SetCountsForOptions(element, dataForCountsArray, computeMethod, filterEmpty) {

    var options = dropdown_GetOptionsArrayWithoutCountsAndMarkups(element);

    var optionCounts = dropdown_CalculateCountsForOptions(dataForCountsArray, options, computeMethod, filterEmpty);

    //now set the counts on the options
    var list = $(element).find(".dropdown-option");

    $.each(list, function (index, value) {

        var option = value;
        option = drowdown_RemoveCountFromOption(option.outerText);

        // add the count
        for (var i = 0; i < optionCounts.length; i++) {

            if (option.includes(optionCounts[i].name)) {
                option = option + COUNTDELIM + optionCounts[i].count + "]";
            }
        }

        value.textContent = option;
    });
}

function dropdown_CalculateCountsForOptions(dataForCountsArray, options, computeMethod, filterEmpty) {

    var includeEmpty = !filterEmpty;

    //Create the count objects
    var optionCounts = [];


    for (var i = 0; i < options.length; i++) {
        optionCounts.push({ 'name': options[i], 'count': 0 });
    }

    $.each(dataForCountsArray, function (index, value) {

        for (var i = 0; i < options.length; i++) {

            var option = optionCounts[i];

            if (computeMethod == COMPUTE_METHODS.INCLUDE) {

                var match = false;
                if (!value || value == "" || value.length == 0) {
                    match = includeEmpty;
                } else if (Array.isArray(value)) {
                    match = value?.some(elem => option.name == elem);
                } else {
                    match = option.name == value;
                }

                if (match) {
                    option.count++;
                }
            }
            else if (computeMethod == COMPUTE_METHODS.EXCLUDE) { //exclude
                var match = false;
                if (!value || value == "" || value.length == 0) {
                    match = includeEmpty;
                }
                else if (Array.isArray(value)) {
                    match = !value.includes(option.name);
                }
                else {
                    match = !(value == option.name);
                }

                if (match) {
                    option.count++;
                }
            }
            else if (computeMethod == COMPUTE_METHODS.LESSTHAN) {

                var match = false;

                var num = parseFloat(option.name);

                if (!value || value == "" || value.length == 0 || isNaN(num)) {
                    match = includeEmpty;
                }
                else if (num >= value) {
                    match = true;
                }

                if (match) {
                    option.count++;
                }
            }
            else if (computeMethod == COMPUTE_METHODS.GREATERTHAN) {

                var match = false;

                var num = parseFloat(option.name);

                if (!value || value == "" || value.length == 0 || isNaN(num)) {
                    match = includeEmpty;
                }
                else if (num <= value) {
                    match = true;
                }

                if (match) {
                    option.count++;
                }
            }
            else if (computeMethod == COMPUTE_METHODS.ANY) {
                var match = false;
                if (!value || value == "" || value.length == 0) {
                    match = includeEmpty;
                }
                else if (Array.isArray(value)) {
                    match = value?.some(elem => option.name == elem);
                } else {
                    match = option.name == value;
                }

                if (match) {
                    option.count++;
                }
            }
        }
    });

    return optionCounts;
}
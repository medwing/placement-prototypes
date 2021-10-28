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
            markup, onChoiceSelectedCallback) {

            element.data('dropdown').destroy();
            dropdown_Populate(element, fieldsArray, candidateOptionsArray, dataForCountsArray, true,
                computeMethod, markup, onChoiceSelectedCallback);
            dropdown_ToggleRevertVisibility(element, candidateOptionsArray, markup);
            dropdown_Blur(element);
        }

        function dropdown_ToggleRevertVisibility(element, candidateOptionsArray, markup) {

            var revertEl = $(element).children(".revert");

            if (candidateOptionsArray.length == 0){
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

                var exists = candidateOptionsArray.includes(value.outerText.replace(markup, ""));
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
            dataForCountsArray, selectPreferences, computeMethod, markup, onChoiceSelectedCallback) {
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
                searchable: false,
                choice: function () {
                    dropdown_ToggleRevertVisibility($(element), candidateOptions, markup);
                    onChoiceSelectedCallback();
                }
            });

            dropdown_SetRevertCount(element, dataForCountsArray, candidateOptions, computeMethod);
            dropdown_ToggleRevertVisibility(element, candidateOptions, markup, onChoiceSelectedCallback);

            dropdown_Blur(element);

        }

        function dropdown_GetSelectedArray(element, markup) {
            var list = $(element).find(".dropdown-chose");

            var out = [];
            $.each(list, function (index, value) {
                var option = value.outerText.replace(markup, "");
                out.push(option);
            });

            return out;
        }

        function dropdown_SetRevertCount(element, dataForCountsArray, candidateOptionsArray, computeMethod) {
            //add counts - assumes an array of options
            var preferencesMatchCount = dropdown_CalculateCounts(dataForCountsArray, candidateOptionsArray, computeMethod);

            var revertEl = $(element).children(".revert");
            if (revertEl) {
                revertEl.text("Revert [" + preferencesMatchCount + " jobs]");
            }
        }

        function dropdown_CalculateCounts(dataForCountsArray, candidateOptions, computeMethod) {

            //add counts - assumes an array of options
            var preferencesMatchCount = 0;
            $.each(dataForCountsArray, function (index, value) {

                if (typeof computeMethod === 'function') {
                    // do something
                    var match = computeMethod(value, candidateOptions);
                    if (match) {
                        preferencesMatchCount++;
                    }
                }
                else if (computeMethod == COMPUTE_METHODS.INCLUDE) {

                    var match = false;
                    if (Array.isArray(value)) {
                        match = candidateOptions.every(elem => value.includes(elem));
                    } else {
                        match = candidateOptions.includes(value);
                    }

                    if (match) {
                        preferencesMatchCount++;
                    }
                }
                else if (computeMethod == COMPUTE_METHODS.EXCLUDE) { //exclude
                    var match;
                    if (value.length == 0)
                    {
                      match = false;
                    }
                    else 
                    {
                      match = candidateOptions.some(elem => value.includes(elem));
                    }
                    if (!match) {
                        preferencesMatchCount++;
                    }
                }
                else if (computeMethod == COMPUTE_METHODS.LESSTHAN) {

                    var candidateOption = Math.max(candidateOptions);
                    var match = (candidateOption >= value);

                    if (match) {
                        preferencesMatchCount++;
                    }
                }
                else if (computeMethod == COMPUTE_METHODS.GREATERTHAN) {

                    var candidateOption = Math.min(candidateOptions);
                    var match = (candidateOption <= value);

                    if (match) {
                        preferencesMatchCount++;
                    }
                }
                else if (computeMethod == COMPUTE_METHODS.ANY) {
                    var match = false;
                    if (Array.isArray(value)) {
                        match = value.some(elem => candidateOptions.includes(elem));
                    } else {
                        match = candidateOptions.includes(value);
                    }

                    if (match) {
                        preferencesMatchCount++;
                    }
                }

            });
            return preferencesMatchCount;
        }

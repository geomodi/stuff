// ==UserScript==
// @name         eLeads Check Internet Box Only
// @namespace    http://tampermonkey
// @version      1
// @description  Only check the Internet checkbox
// @match        https://www.eleadcrm.com/evo2/fresh/eLead-V45/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Uncheck all checkboxes
    var checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(function(checkbox) {
        checkbox.checked = false;
    });

    // Check the Internet checkbox
    var internetCheckbox = document.querySelector('#Filters_chkWebUps');
    internetCheckbox.checked = true;
})();

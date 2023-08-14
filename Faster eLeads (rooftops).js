// ==UserScript==
// @name         Faster Rooftop (eLeads)
// @version      1.2
// @description  Open All Customers on Rooftop (eLeads)
// @match        https://www.eleadcrm.com/evo2/fresh/eLead-V45/elead_track/reports/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const batchSize = 10;

    // Prevent page from refreshing
    const metaRefresh = document.querySelector('meta[http-equiv="refresh"]');
    if (metaRefresh) metaRefresh.remove();
    for (var i = 1; i < 99999; i++) {
        window.clearInterval(i);
        window.clearTimeout(i);
    }

    // Function to count occurrences of each customer name
    function countCustomerNames(links) {
        const count = {};
        for (let link of links) {
            const name = link.innerText.trim();
            if (count[name]) {
                count[name]++;
            } else {
                count[name] = 1;
            }
        }
        return count;
    }

    // Helper function to list customer names in the specified range
    function listCustomerNames(links, startIndex, endIndex, nameCounts) {
        let listHtml = '<ul>';
        const alreadyMarked = {};
        for (let i = startIndex; i < endIndex && i < links.length; i++) {
            const name = links[i].innerText.trim();
            if (nameCounts[name] > 1 && !alreadyMarked[name]) {
                alreadyMarked[name] = true;
                listHtml += `<li>${name}</li>`;
            } else if (nameCounts[name] > 1 && alreadyMarked[name]) {
                listHtml += `<li>${name} <span style="color: red;">(duplicated)</span></li>`;
            } else {
                listHtml += `<li>${name}</li>`;
            }
        }
        listHtml += '</ul>';
        return listHtml;
    }

    // Helper function to create a dialog box
    function createDialogBox(htmlContent) {
        const dialogBox = document.createElement('div');
        dialogBox.style.position = 'fixed';
        dialogBox.style.top = '50%';
        dialogBox.style.left = '50%';
        dialogBox.style.transform = 'translate(-50%, -50%)';
        dialogBox.style.backgroundColor = 'white';
        dialogBox.style.border = '1px solid #ccc';
        dialogBox.style.padding = '20px';
        dialogBox.style.zIndex = '9999';
        dialogBox.innerHTML = htmlContent;
        return dialogBox;
    }

    // Helper function to click on each customer name link in batches
    function clickNextBatch(links, startIndex, nameCounts) {
        for (let i = startIndex; i < startIndex + batchSize && i < links.length; i++) {
            // Trigger a click event on the link to open the popup
            const event = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true
            });
            links[i].dispatchEvent(event);
        }

        if (startIndex + batchSize < links.length) {
            // If there are remaining links, show the custom dialog for the next batch
            const dialogBox = createDialogBox(`<div style="font-size: 18px; font-weight: bold;">Do you want to continue with the next batch?</div><br>${listCustomerNames(links, startIndex + batchSize, startIndex + 2*batchSize, nameCounts)}
            <div style="text-align: center;">
                <button id="cancelBtn" style="padding: 5px 10px; background-color: #f44336; color: white; border: none; cursor: pointer; margin-right: 10px;">Cancel</button>
                <button id="continueBtn" style="padding: 5px 10px; background-color: #4CAF50; color: white; border: none; cursor: pointer;">Continue with the next batch</button>
            </div>`);
            document.body.appendChild(dialogBox);

            // Handle button clicks
            const cancelBtn = dialogBox.querySelector('#cancelBtn');
            cancelBtn.addEventListener('click', () => {
                document.body.removeChild(dialogBox);
            });

            const continueBtn = dialogBox.querySelector('#continueBtn');
            continueBtn.addEventListener('click', () => {
                document.body.removeChild(dialogBox);
                setTimeout(() => clickNextBatch(links, startIndex + batchSize, nameCounts), 1000);
            });
        } else {
            // If all links have been opened, show the final dialog
            window.alert('All links have been opened.');
        }
    }

    // Wait for 1 second before executing the script
    setTimeout(() => {
        // Find all <a> tags with an id containing "CustomerName"
        const links = document.querySelectorAll('a[id*="CustomerName"]');
        const nameCounts = countCustomerNames(links);

        // Prompt the user to start clicking on the links
        const dialogBox = createDialogBox(`<div style="font-size: 18px; font-weight: bold;">Found ${links.length} Customers. Start with the first batch of 10?</div><br>${listCustomerNames(links, 0, batchSize, nameCounts)}
        <div style="text-align: center;">
            <button id="cancelBtn" style="padding: 5px 10px; background-color: #f44336; color: white; border: none; cursor: pointer; margin-right: 10px;">Cancel</button>
            <button id="startBtn" style="padding: 5px 10px; background-color: #4CAF50; color: white; border: none; cursor: pointer;">Start clicking</button>
        </div>`);
        document.body.appendChild(dialogBox);

        // Handle button clicks
        const cancelBtn = dialogBox.querySelector('#cancelBtn');
        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(dialogBox);
        });

        const startBtn = dialogBox.querySelector('#startBtn');
        startBtn.addEventListener('click', () => {
            document.body.removeChild(dialogBox);
            clickNextBatch(links, 0, nameCounts);
        });
    }, 1000); // Wait for 1 second
})();

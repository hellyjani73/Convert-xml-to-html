document.addEventListener("DOMContentLoaded", function () {
    // Load XML data on page load
    
    loadXML("Transactions");
  
    // Function to load XML data
    function loadXML(name) {
      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
          displayData(this.responseXML);
        }
      };
      xhr.open("GET", `${name}.xml`, true);
      xhr.send();
    }
  
    // Function to display XML data in HTML table
    function displayData(xml) {
      var table = document.createElement("table");
      var thead = document.createElement("thead");
      var tbody = document.createElement("tbody");
      table.appendChild(thead);
      table.appendChild(tbody);
  
      // Clear previous data
      thead.innerHTML = "";
      tbody.innerHTML = "";
  
      // Extract headers from the first VOUCHER element
      var headers = ["Index", ...Array.from(xml.querySelectorAll("TALLYMESSAGE")[0].children[0].children).map((el) => el.tagName)];
      var tableHeader = xml.querySelector("TALLYREQUEST");
  
      const header = document.createElement("center");
      header.innerHTML = `<h2>${tableHeader.textContent}</h2>`;
  
      // Create table headers
      var headerRow = document.createElement("tr");
      headers.forEach((header) => {
        var th = document.createElement("th");
        th.textContent = header;
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
  
      // Extract data rows from all VOUCHER elements
      var dataRows = Array.from(xml.querySelectorAll("TALLYMESSAGE")).map((item) => item.children[0]);
  
      dataRows.forEach((row, index) => {
        // Create main row for non-list data
        var mainRow = document.createElement("tr");
  
        // Add Index column
        var indexTd = document.createElement("td");
        indexTd.textContent = index + 1;
        mainRow.appendChild(indexTd);
  
        // Add other columns for non-list data
        headers.slice(1).forEach((header) => {
          var td = document.createElement("td");
          var cellValue = "";
          var currentElement = row.querySelector(header);
          if (header.indexOf(".LIST") !== -1) {
            var listItems = row.querySelectorAll(`${header.split(".LIST")[0]}`);
            if (listItems) {
              for (var k = 0; k < listItems.length; k++) {
                cellValue += listItems[k].textContent.trim();
              }
            }
          } else {
            cellValue = currentElement?.textContent;
          }
  
          // Make cells editable
          td.classList.add("editable");
          td.setAttribute("contenteditable", "true");
          td.textContent = cellValue;
          mainRow.appendChild(td);
        });
  
        // Append the main row to the table body
        tbody.appendChild(mainRow);
      });
  
      // Append the table to the data tables container
      const tables = document.getElementById("data-tables");
      tables.innerHTML = ''; // Clear previous tables
      tables.appendChild(header);
      tables.appendChild(table);
  
      // Add event listener for cell editing
      table.addEventListener("input", function (event) {
        var targetCell = event.target;
        if (targetCell.classList.contains("editable")) {
          //updateXMLData(); // Commented for now to test the Save Changes button
        }
      });
  
      // Add event listener for the "Save Changes" button
      document.getElementById("saveBtn").addEventListener("click", function () {
        updateXMLData();
        alert("Changes saved successfully!");
      });
  
      // Function to update XML data based on HTML table edits
      function updateXMLData() {
        var tableName = document.querySelector("center h2").textContent.trim(); // Get the table name
        var tableData = document.getElementById("data-tables").querySelector("table");
  
        // Generate XML content from the HTML table data
        var xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n<TALLYREQUEST>\n<TALLYMESSAGE>\n';
        var headers = Array.from(tableData.querySelectorAll("thead th")).map((th) => th.textContent.trim());
  
        Array.from(tableData.querySelectorAll("tbody tr")).forEach((row) => {
          xmlContent += '<VOUCHER>\n';
          for (var i = 1; i < row.children.length; i++) {
            var header = headers[i];
            var cellValue = row.children[i].textContent.trim();
  
            // Handle .LIST data if necessary
            if (header.indexOf(".LIST") !== -1) {
              // Handle .LIST data as needed
            } else {
              xmlContent += `<${header}>${cellValue}</${header}>\n`;
            }
          }
          xmlContent += '</VOUCHER>\n';
        });
  
        xmlContent += '</TALLYMESSAGE>\n</TALLYREQUEST>';
  
        // Log the XML content to the console for debugging
        console.log("Updated XML Content:", xmlContent);
  
        // Save the updated XML content to Local Storage
        localStorage.setItem(tableName, xmlContent);
  
        console.log("Changes saved to Local Storage successfully!");
      }
    }
  });
  
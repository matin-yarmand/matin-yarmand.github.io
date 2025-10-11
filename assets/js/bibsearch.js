import { highlightSearchTerm } from "./highlight-search-term.js";

document.addEventListener("DOMContentLoaded", function () {
  // actual bibsearch logic
  const filterItems = (searchTerm) => {
    document.querySelectorAll(".bibliography, .unloaded").forEach((element) => element.classList.remove("unloaded"));
    
    // Remove previous abstract button highlighting
    document.querySelectorAll(".abstract.btn").forEach((btn) => {
      btn.classList.remove("highlighted-abstract");
    });

    // highlight-search-term
    if (CSS.highlights) {
      const nonMatchingElements = highlightSearchTerm({ search: searchTerm, selector: ".bibliography > li" });
      if (nonMatchingElements == null) {
        return;
      }
      nonMatchingElements.forEach((element) => {
        element.classList.add("unloaded");
      });
    } else {
      // Simply add unloaded class to all non-matching items if Browser does not support CSS highlights
      document.querySelectorAll(".bibliography > li").forEach((element, index) => {
        const visibleText = element.innerText.toLowerCase();
        const abstractElement = element.querySelector(".abstract.hidden");
        const abstractText = abstractElement ? abstractElement.innerText.toLowerCase() : "";
        const combinedText = visibleText + " " + abstractText;
        
        if (combinedText.indexOf(searchTerm) == -1) {
          element.classList.add("unloaded");
        } else if (abstractText.indexOf(searchTerm) !== -1) {
          // Highlight abstract button if keyword is found in abstract
          const abstractBtn = element.querySelector(".abstract.btn");
          if (abstractBtn) {
            abstractBtn.classList.add("highlighted-abstract");
          }
        }
      });
    }
    
    // Also check for abstract matches when using CSS highlights
    if (CSS.highlights && searchTerm) {
      document.querySelectorAll(".bibliography > li").forEach((element) => {
        const abstractElement = element.querySelector(".abstract.hidden");
        if (abstractElement && abstractElement.innerText.toLowerCase().indexOf(searchTerm) !== -1) {
          const abstractBtn = element.querySelector(".abstract.btn");
          if (abstractBtn) {
            abstractBtn.classList.add("highlighted-abstract");
          }
        }
      });
    }

    document.querySelectorAll("h2.bibliography").forEach(function (element) {
      let iterator = element.nextElementSibling; // get next sibling element after h2, which can be h3 or ol
      let hideFirstGroupingElement = true;
      // iterate until next group element (h2), which is already selected by the querySelectorAll(-).forEach(-)
      while (iterator && iterator.tagName !== "H2") {
        if (iterator.tagName === "OL") {
          const ol = iterator;
          const unloadedSiblings = ol.querySelectorAll(":scope > li.unloaded");
          const totalSiblings = ol.querySelectorAll(":scope > li");

          if (unloadedSiblings.length === totalSiblings.length) {
            ol.previousElementSibling.classList.add("unloaded"); // Add the '.unloaded' class to the previous grouping element (e.g. year)
            ol.classList.add("unloaded"); // Add the '.unloaded' class to the OL itself
          } else {
            hideFirstGroupingElement = false; // there is at least some visible entry, don't hide the first grouping element
          }
        }
        iterator = iterator.nextElementSibling;
      }
      // Add unloaded class to first grouping element (e.g. year) if no item left in this group
      if (hideFirstGroupingElement) {
        element.classList.add("unloaded");
      }
    });
  };

  const updateInputField = () => {
    const hashValue = decodeURIComponent(window.location.hash.substring(1)); // Remove the '#' character
    document.getElementById("bibsearch").value = hashValue;
    filterItems(hashValue);
  };

  // Sensitive search. Only start searching if there's been no input for 300 ms
  let timeoutId;
  document.getElementById("bibsearch").addEventListener("input", function () {
    clearTimeout(timeoutId); // Clear the previous timeout
    const searchTerm = this.value.toLowerCase();
    timeoutId = setTimeout(filterItems(searchTerm), 300);
  });

  window.addEventListener("hashchange", updateInputField); // Update the filter when the hash changes

  updateInputField(); // Update filter when page loads
});

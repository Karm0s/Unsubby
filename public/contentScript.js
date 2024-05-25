console.log("Working on: " + document.title);

function createCheckmarkSVG() {
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("width", "20");
  svg.setAttribute("height", "20");
  svg.setAttribute("viewBox", "0 0 20 20");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "white");
  svg.setAttribute("stroke-width", "2");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");

  const path = document.createElementNS(svgNS, "path");
  path.setAttribute("d", "M5 10L8 13L15 6");

  svg.appendChild(path);
  svg.classList = "unsubby-checkmark";
  return svg;
}

class Unsubscriber {
  constructor() {
    this.elementsList = {};
  }
  pushElement(id, element) {
    if (!this.elementsList[id]) {
      console.log("Element not in list. pushing...");
      this.elementsList[id] = element;
    }
    console.log(this.elementsList);
  }
  popElement(id) {
    console.log("Popping element from list");
    delete this.elementsList[id];
    console.log(this.elementsList);
  }
  run() {
    alert("running script ....");

  }
  getListLength() {
    return Object.keys(this.elementsList).length;
  }
}


class ExtensionUI {
  constructor(unsubscriber) {
    this.batchId = 0;
    this.channelCheckboxes = [];
    this.selectedAllState = false;
    this.confirmationPopupVisible = false;
    this.unsubscribeButtonVisible = false;
    this.unsubscriber = unsubscriber;

    if (document.documentElement.hasAttribute("dark")) {
      document.body.classList.add("unsubby-dark");
    }

    this.confirmationPopup = this.renderConfirmationPopup();
    this.floatingUnsubscribeButton = this.createFloatingButton();

    document.body.appendChild(this.floatingUnsubscribeButton);

    const sectionsContainer = document.getElementById("contents");
    sectionsContainer.parentNode.insertBefore(this.renderSelectAllCheckbox(), sectionsContainer);
    const channels = Array.from(sectionsContainer.querySelectorAll("ytd-channel-renderer"));
    this.injectCheckboxes(channels);

    const observer = new MutationObserver((mutationList, observer) => {
      if (mutationList[0].addedNodes.length) {
        const channels = Array.from(mutationList[0].addedNodes[0].querySelectorAll("ytd-channel-renderer"));
        this.injectCheckboxes(channels);
      }
    });
    observer.observe(sectionsContainer, { childList: true });
  }

  injectCheckboxes(channels) {
    channels.map((channel, index) => {
      const channelCheckbox = this.createCheckbox(`${this.batchId}-${index}`, (event) => {
        if (event.target.checked === true) {
          const unsubscribeButton = event.target.parentElement.parentElement.parentElement.querySelector("#subscribe-button button");
          this.unsubscriber.pushElement(event.target.id, unsubscribeButton);
        } else {
          this.unsubscriber.popElement(event.target.id);
        }
        this.floatingUnsubscribeButton.hidden = this.unsubscriber.getListLength() === 0;
      });
      this.channelCheckboxes.push(channelCheckbox);
      channel.querySelector("#buttons").appendChild(channelCheckbox);
    });
    this.batchId += 1;
  }


  renderSelectAllCheckbox() {
    const label = document.createElement("p");
    label.textContent = "Select All Loaded Channels";
    const selectAllCheckbox = this.createCheckbox("unsubby-select-all-checkbox", (checked) => {
      this.channelCheckboxes.map(channel => {
        const checkbox = channel.querySelector("input");
        checkbox.checked = checked;
        const unsubscribeButton = checkbox.parentElement.parentElement.parentElement.querySelector("#subscribe-button button");
        this.unsubscriber.pushElement(checkbox.id, unsubscribeButton);
      });
      this.selectedAllState = checked;
      this.floatingUnsubscribeButton.hidden = !checked;
    });

    const container = document.createElement("div");
    container.className = "unsubby-select-all-container";

    container.appendChild(label);
    container.appendChild(selectAllCheckbox);
    return container;
  }

  createCheckbox(id, callback) {
    const checkboxId = `${id}-unsubby-checkbox`;
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = checkboxId;
    checkbox.className = "unsubby-checkbox-input";
    checkbox.checked = this.selectedAllState;

    checkbox.addEventListener("change", (event) => {
      callback(event.target.checked);
    });

    const label = document.createElement("label");
    label.className = "unsubby-checkbox-label";
    label.htmlFor = checkboxId;
    label.appendChild(checkbox);
    label.appendChild(createCheckmarkSVG());

    const container = document.createElement("div");
    container.className = "unsubby-checkbox-container";
    container.appendChild(label);
    return container;
  }

  renderConfirmationPopup() {
    const confirmationPopup = document.createElement("div");
    confirmationPopup.className = "unsubby-confirmation-popup";

    const text = document.createElement("p");
    text.textContent = `You have selected ${this.unsubscriber.getListLength()} channels to unsubscibe from, do you want to proceed ?`;
    text.className = "unsubby-popup-text";
    text.id = "unsubby-popup-text";

    const buttonsContainer = document.createElement("div");
    buttonsContainer.className = "unsubby-buttons-container";

    const cancelButton = document.createElement("button");
    cancelButton.className = "unsubby-button unsubby-secondary-button";
    cancelButton.textContent = "Cancel";
    cancelButton.addEventListener("click", () => {
      this.hideConfirmationPopup();
    })

    const confirmButton = document.createElement("button");
    confirmButton.className = "unsubby-button unsubby-primary-button";
    confirmButton.textContent = "Go";
    confirmButton.addEventListener("click", () => {
      this.hideConfirmationPopup();
      this.unsubscriber.run();
    })

    buttonsContainer.appendChild(cancelButton);
    buttonsContainer.appendChild(confirmButton);

    confirmationPopup.appendChild(text);
    confirmationPopup.appendChild(buttonsContainer);

    const container = document.createElement("div");
    container.id = "unsubby-popup-container";
    container.className = "unsubby-popup-container";
    container.appendChild(confirmationPopup);

    document.body.appendChild(container);
    return container;
  }

  showConfirmationPopup() {
    this.updateConfirmationPopup();
    this.confirmationPopup.classList.add("unsubby-show-popup");
  }

  hideConfirmationPopup() {
    this.confirmationPopup.classList.remove("unsubby-show-popup");
  }

  updateConfirmationPopup() {
    this.confirmationPopup.querySelector("p#unsubby-popup-text").textContent = `You have selected ${this.unsubscriber.getListLength()} channels to unsubscibe from, do you want to proceed ?`;
  }

  createFloatingButton() {
    const button = document.createelement("button");
    button.classname = "unsubby-button unsubby-primary-button unsubby-unsubscribe-button";
    button.id = "unsubby-unsubscribe-button";
    button.hidden = true;

    button.textcontent = "unsubscribe";
    button.addeventlistener("click", (event) => {
      this.showconfirmationpopup();
    });
    return button;
  }
}



const unsubscriber = new Unsubscriber();
console.log(unsubscriber);
const UI = new ExtensionUI(unsubscriber);

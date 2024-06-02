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

class Button {
  constructor(mediator, id, type, text, hidden = false) {
    this.buttonTypes = {
      "main": "unsubby-button unsubby-primary-button unsubby-unsubscribe-button",
      "primary": "unsubby-button unsubby-primary-button",
      "secondary": "unsubby-button unsubby-secondary-button",
    };
    this.mediator = mediator;

    this.element = document.createElement("button");
    if (this.buttonTypes[type]) {
      this.element.className = this.buttonTypes[type];
    } else {
      console.error("No corresponding style for type: ", type);
    }
    this.element.id = id;
    this.element.hidden = hidden;

    this.element.textContent = text;
    this.element.addEventListener("click", () => {
      mediator.notify(this, { type: "click" });
    });
  }
  hide() {
    this.element.hidden = true;
  }
  show() {
    this.element.hidden = false;
  }
  getDOMElement() {
    return this.element;
  }
}

class Checkbox {
  constructor(mediator, id, initialState) {
    this.id = `${id}-unsubby-checkbox-container`;
    this.checkboxId = `${id}-unsubby-checkbox`;


    this.mediator = mediator;
    this.checkbox = document.createElement("input");
    this.checkbox.type = "checkbox";
    this.checkbox.id = this.checkboxId;
    this.checkbox.className = "unsubby-checkbox-input";
    this.checkbox.checked = initialState;

    this.checkbox.addEventListener("change", (event) => {
      mediator.notify(this, { type: "change", id: this.id, state: event.target.checked });
    });

    const label = document.createElement("label");
    label.className = "unsubby-checkbox-label";
    label.htmlFor = this.checkboxId;
    label.appendChild(this.checkbox);
    label.appendChild(createCheckmarkSVG());

    this.element = document.createElement("div");
    this.element.id = this.id;
    this.element.className = "unsubby-checkbox-container";
    this.element.appendChild(label);
  }

  set(state) {
    this.checkbox.checked = state;
  }

  getDOMElement() {
    return this.element;
  }
}

class CheckAllCheckbox {
  constructor(mediator) {
    this.mediator = mediator;

    const label = document.createElement("p");
    label.textContent = "Select All channels in page";

    this.checkbox = new Checkbox(this, "unsubby-select-all-checkbox", false);

    this.element = document.createElement("div");
    this.element.className = "unsubby-select-all-container";
    this.element.appendChild(label);
    this.element.appendChild(this.checkbox.getDOMElement());
  }

  notify(sender, payload) {
    if (sender === this.checkbox && payload.type === "change") {
      if (payload.state) {
        this.mediator.notify(this, { type: 'select_all' });
      } else {
        this.mediator.notify(this, { type: 'unselect_all' });
      }
    }
  }

  getDOMElement() {
    return this.element;
  }
}

class Popup {
  constructor(mediator, contentElement = undefined,
    {
      title = "",
      hasConfirmButton = false,
      hasCancelButton = false,
      confirmText = "confirm",
      cancelText = "cancel" }) {

    this.mediator = mediator;





    const buttonsContainer = document.createElement("div");
    buttonsContainer.className = "unsubby-buttons-container";
    if (hasCancelButton) {
      this.cancelButton = new Button(this, "unsubby-popup-cancel-button", "secondary", cancelText);
      buttonsContainer.appendChild(this.cancelButton.getDOMElement());
    }
    if (hasConfirmButton) {
      this.confirmButton = new Button(this, "unsubby-popup-primary-button", "primary", confirmText);
      buttonsContainer.appendChild(this.confirmButton.getDOMElement());
    }


    this.popupElement = document.createElement("div");
    this.popupElement.className = "unsubby-popup";
    if (contentElement) {
      this.contentElement = contentElement;
      this.contentElement.classList.add("unsubby-popup-content");
      this.popupElement.appendChild(this.contentElement);
    }
    if (title) {
      const titleElement = document.createElement("p");
      titleElement.textContent = title;
      titleElement.className = "unsubby-popup-text";
      titleElement.id = "unsubby-popup-text";
      this.popupElement.appendChild(titleElement);
    }
    this.popupElement.appendChild(buttonsContainer);

    this.element = document.createElement("div");
    this.element.id = "unsubby-popup-container";
    this.element.className = "unsubby-popup-container";
    this.element.appendChild(this.popupElement);
  }

  getDOMElement() {
    return this.element;
  }

  notify(sender, payload) {
    let event = "";
    if (sender === this.confirmButton && payload.type === "click") {
      event = "confirm";
    } else if (sender === this.cancelButton && payload.type === "click") {
      event = "cancel";
    }
    this.mediator.notify(this, { type: event });
  }

  refreshContent(newContent) {
    if (this.contentElement) {
      this.popupElement.removeChild(this.contentElement);
    }
    this.contentElement = newContent;
    this.contentElement.classList.add("unsubby-popup-content");
    const lastChild = this.popupElement.childNodes[this.popupElement.childNodes.length - 1];
    this.popupElement.insertBefore(this.contentElement, lastChild);
  }

  hide() {
    this.element.classList.remove("unsubby-show-popup");
  }

  show() {
    this.element.classList.add("unsubby-show-popup");
  }
}

function createLoadingSpinner() {
  const spinner = document.createElement("span");
  spinner.className = "unsubby-loader";
  return spinner;
}

class ConfirmationPopup extends Popup {
  constructor(mediator) {
    super(mediator, undefined, { hasCancelButton: true, hasConfirmButton: true });
    this.label = document.createElement("p");
    this.label.textContent = "HELLO TEST TEST";
    this.label.className = "unsubby-popup-text";
    this.label.id = "unsubby-popup-text";

    this.refreshContent(this.label);
  }

  show(listLength) {
    this.label.textContent = `You have selected ${listLength} channels to unsubscibe from, do you want to proceed ?`;
    super.show();
  }
}

class ChannelCheckboxes {
  constructor(mediator) {
    this.batchIndex = 0;
    this.initialState = false;
    this.checkedIds = [];
    this.checkboxes = [];
    this.mediator = mediator;
    this.channelsContainer = document.getElementById("contents");

    const channels = Array.from(this.channelsContainer.querySelectorAll("ytd-channel-renderer"));
    this.inject(channels);

    const observer = new MutationObserver((mutationList) => {
      if (mutationList[0].addedNodes.length) {
        const channels = Array.from(mutationList[0].addedNodes[0].querySelectorAll("ytd-channel-renderer"));
        this.inject(channels);
      }
    });
    observer.observe(this.channelsContainer, { childList: true });
  }

  inject(channels) {
    channels.forEach((channel, index) => {
      const checkbox = new Checkbox(this, `${this.batchIndex}-${index}`);
      this.checkboxes.push(checkbox);
      channel.querySelector("#buttons").appendChild(checkbox.getDOMElement());
    });
    this.batchIndex++;
  }

  notify(sender, payload) {
    if (payload.type === "change") {
      if (payload.state) {
        this.checkedIds.push(payload.id);
        if (this.checkedIds.length === 1) {
          this.mediator.notify(this, { type: "first_element_pushed" });
        }
      } else {
        this.checkedIds = this.checkedIds.filter(id => id !== payload.id);
        if (!this.checkedIds.length) {
          this.mediator.notify(this, { type: "last_element_removed" });
        }
      }
    }
  }

  set(id, state) {
    const checkbox = this.checkboxes.filter(checkbox => checkbox.id === id)[0];
    if (checkbox) {
      checkbox.set(state);
      if (!state && this.checkedIds.includes(id)) {
        this.checkedIds = this.checkedIds.filter(id => id !== checkbox.id);
      } else if (state && !this.checkedIds.includes(id)) {
        this.checkedIds.push(id);
      }
    }
  }

  setAll(state) {
    this.initialState = state;
    this.checkboxes.forEach(checkbox => {
      checkbox.set(state);
      if (state) {
        if (!this.checkedIds.includes(checkbox.id)) {
          this.checkedIds.push(checkbox.id);
        }
      } else {
        this.checkedIds = [];

      }
    });
  }

  removeCheckbox(id) {
    const checkbox = this.checkboxes.filter(c => c.id === id)[0];
    if (checkbox) {
      const parent = checkbox.getDOMElement().parentElement;
      parent.removeChild(checkbox.getDOMElement());
      this.checkboxes = this.checkboxes.filter(c => c.id !== id);
    }
  }

  getListLength() {
    return this.checkedIds.length;
  }

  getList() {
    return this.checkedIds;
  }
}

class ExtensionUI {
  constructor(unsubscriber) {
    this.unsubscriber = unsubscriber;

    this.unsubscribeButton = new Button(this, "unsubby-unsubscribe-button", "main", "Unsubscribe", true);
    this.selectAllCheckbox = new CheckAllCheckbox(this);
    this.confirmationPopup = new ConfirmationPopup(this);
    this.channelCheckboxes = new ChannelCheckboxes(this);
    this.loadingPopup = new Popup(this, createLoadingSpinner(), { title: "Process running...", hasCancelButton: true, cancelText: "cancel" });

    this.bindUI();

    if (document.documentElement.hasAttribute("dark")) {
      document.body.classList.add("unsubby-dark");
    }
  }

  bindUI() {
    document.body.appendChild(this.unsubscribeButton.getDOMElement());
    document.body.appendChild(this.confirmationPopup.getDOMElement());
    document.body.appendChild(this.loadingPopup.getDOMElement());

    const channelRenderersContainer = document.getElementById("contents");
    channelRenderersContainer.parentNode.insertBefore(this.selectAllCheckbox.getDOMElement(), channelRenderersContainer);
  }

  async notify(sender, payload) {
    if (sender === this.unsubscribeButton && payload.type === "click") {
      this.confirmationPopup.show(this.channelCheckboxes.getListLength());
    }
    if (sender === this.confirmationPopup) {
      this.confirmationPopup.hide();
      switch (payload.type) {
        case "confirm":
          this.loadingPopup.show();
          const processedIds = await this.unsubscriber.unsubscribe(this.channelCheckboxes.getList());
          processedIds.map(id => {
            this.channelCheckboxes.set(id, false);
            console.log("Removing that checkbox...");
            this.channelCheckboxes.removeCheckbox(id);
          });

          this.loadingPopup.hide();
          break;
        case "cancel":
          break;
      }
    }
    if (sender === this.selectAllCheckbox) {
      switch (payload.type) {
        case "select_all":
          this.channelCheckboxes.setAll(true);
          this.unsubscribeButton.show();
          break;
        case "unselect_all":
          this.channelCheckboxes.setAll(false);
          this.unsubscribeButton.hide();
          break;
      }
    }
    if (sender === this.channelCheckboxes) {
      switch (payload.type) {
        case "first_element_pushed":
          this.unsubscribeButton.show();
          break;
        case "last_element_removed":
          this.unsubscribeButton.hide();
          break;
      }
    }
    if (sender === this.loadingPopup) {
      switch (payload.type) {
        case "cancel":
          this.loadingPopup.hide();
          break;
      }
    }
  }
}

class Unsubscriber {
  constructor() {
    this.stopProcess = false;
  }

  breakProcess() {
    this.stopProcess = true;
  }

  unsubscribe(idsList) {
    return new Promise((resolve) => {
      const processedIds = [];
      this.stopProcess = false;
      let interval = 800;
      let confirmWaitTime = 200;

      const processId = (id, index) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            const buttonContainer = document.getElementById(id).parentElement;
            buttonContainer.querySelector("button").click();
            setTimeout(() => {
              const popup = document.getElementsByTagName("tp-yt-paper-dialog")[0];
              popup.querySelector("#confirm-button button").click();
              processedIds.push(id);
              resolve();
            }, confirmWaitTime * index);
          }, interval * index);
        });
      }

      const processAllIds = async () => {
        for (let i = 0; i < idsList.length; i++) {
          if (this.stopProcess) {
            break;
          }
          await processId(idsList[i], i);
        }
        resolve(processedIds);
      }

      processAllIds();
    });
  }
}

const unsubscriber = new Unsubscriber();
const UI = new ExtensionUI(unsubscriber);

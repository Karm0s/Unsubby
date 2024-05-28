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
    this.id = `${id}-unsubby-checkbox`;


    this.mediator = mediator;
    this.checkbox = document.createElement("input");
    this.checkbox.type = "checkbox";
    this.checkbox.id = this.id;
    this.checkbox.className = "unsubby-checkbox-input";
    this.checkbox.checked = initialState;

    this.checkbox.addEventListener("change", (event) => {
      mediator.notify(this, { type: "change", id: this.id, state: event.target.checked });
    });

    const label = document.createElement("label");
    label.className = "unsubby-checkbox-label";
    label.htmlFor = this.id;
    label.appendChild(this.checkbox);
    label.appendChild(createCheckmarkSVG());

    this.element = document.createElement("div");
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
    console.log(this.checkbox.getDOMElement());
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

class ConfirmationPopup {
  constructor(mediator) {
    this.mediator = mediator;
    this.listLength = 0;

    this.cancelButton = new Button(this, "unsubby-popup-cancel-button", "secondary", "cancel");
    this.confirmButton = new Button(this, "unsubby-popup-primary-button", "primary", "go");

    const buttonsContainer = document.createElement("div");
    buttonsContainer.className = "unsubby-buttons-container";
    buttonsContainer.appendChild(this.cancelButton.getDOMElement());
    buttonsContainer.appendChild(this.confirmButton.getDOMElement());

    this.confirmationPopup = document.createElement("div");
    this.confirmationPopup.className = "unsubby-confirmation-popup";
    this.confirmationPopup.appendChild(buttonsContainer);

    this.element = document.createElement("div");
    this.element.id = "unsubby-popup-container";
    this.element.className = "unsubby-popup-container";
    this.element.appendChild(this.confirmationPopup);
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

  refreshLabel() {
    if (this.label) {
      this.confirmationPopup.removeChild(this.label);
    }
    this.label = document.createElement("p");
    this.label.textContent = `You have selected ${this.listLength} channels to unsubscibe from, do you want to proceed ?`;
    this.label.className = "unsubby-popup-text";
    this.label.id = "unsubby-popup-text";
    this.confirmationPopup.insertBefore(this.label, this.confirmationPopup.firstChild);
  }

  hide() {
    this.element.classList.remove("unsubby-show-popup");
  }

  show(listLength) {
    if (this.listLength !== listLength) {
      this.listLength = listLength;
      this.refreshLabel();
    }
    this.element.classList.add("unsubby-show-popup");
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
          this.mediator.notify(this, {type: "first_element_pushed"});
        }
      } else {
        this.checkedIds = this.checkedIds.filter(id => id !== payload.id);
        if (!this.checkedIds.length) {
          this.mediator.notify(this, {type: "last_element_removed"});
        }
      }
    }
  }

  setAll(state) {
    this.initialState = state;
    this.checkboxes.forEach(checkbox => {
      checkbox.set(state);
      if (state) {
        if (!(checkbox.id in this.checkedIds)) {
          this.checkedIds.push(checkbox.id);
        }
      } else {
        this.checkedIds = [];

      }
    });
  }

  getListLength() {
    return this.checkedIds.length;
  }
}

class ExtensionUI {
  constructor() {
    this.unsubscribeButton = new Button(this, "unsubby-unsubscribe-button", "main", "Unsubscribe", true);
    this.selectAllCheckbox = new CheckAllCheckbox(this);
    this.confirmationPopup = new ConfirmationPopup(this);
    this.channelCheckboxes = new ChannelCheckboxes(this);

    this.bindUI();

   if (document.documentElement.hasAttribute("dark")) {
      document.body.classList.add("unsubby-dark");
    }
  }

  bindUI() {
    document.body.appendChild(this.unsubscribeButton.getDOMElement());
    document.body.appendChild(this.confirmationPopup.getDOMElement());

    const channelRenderersContainer = document.getElementById("contents");
    channelRenderersContainer.parentNode.insertBefore(this.selectAllCheckbox.getDOMElement(), channelRenderersContainer);
  }

  notify(sender, payload) {
    if (sender === this.unsubscribeButton && payload.type === "click") {
      this.confirmationPopup.show(this.channelCheckboxes.getListLength());
    }
    if (sender === this.confirmationPopup) {
      switch (payload.type) {
        case "confirm":
          console.log("CONFIRMED...RUNNING PROCESS");
          break;
        case "cancel":
          console.log("CANCELED...");
          break;
      }
      this.confirmationPopup.hide();
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
  }
}


const UI = new ExtensionUI();

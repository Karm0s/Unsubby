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

const createCheckbox = (id) => {
  const checkboxId = `${id}-unsubby-checkbox`;
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = checkboxId;
  checkbox.className = "unsubby-checkbox-input";

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

const injectStyles = () => {
  const cssStyles = `
.unsubby-checkbox-container {
  position: relative;
  align-self: center;
  margin: 0 0 0.5rem 2rem;
}
.unsubby-checkbox-input {
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0%;
}
.unsubby-checkbox-label {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 4px;
  border: 1px solid #cccfdb;
  transition: all 0.1s ease-out;
}
.unsubby-checkbox-label > svg {
  opacity: 0%;
  transform: scale(1.5);
  transition: all 0.1s ease-out;
}
.unsubby-checkbox-label:has(input[type="checkbox"]:checked) {
  background-color: #FF0000;
} 
.unsubby-checkbox-label:has(input[type="checkbox"]:checked) > svg {
  opacity: 100%;
}
`;
  const styles = document.createElement("style");
  styles.appendChild(document.createTextNode(cssStyles));
  document.head.appendChild(styles);
}


function injectUI(channels) {
  injectStyles();
  channels.map((channel, index) => {
    const channelCheckbox = createCheckbox(index);
    channel.querySelector("#buttons").appendChild(channelCheckbox);
  });
}

const channelsContainer = document.getElementById("grid-container");

const channelsList = Array.from(document.querySelectorAll("ytd-channel-renderer"));
console.log(channelsList);

injectUI(channelsList);


// const channel = channelsList[0].querySelector("#subscribe-button button");
// console.log(channel);
//
// channel.click();
// setTimeout(() => {
//   const confirmBtn = document.querySelector("#confirm-button button");
//   console.log(confirmBtn);
// }, 500);
//


// [...channelsList].map(channel => {
//   const btn = channel.querySelector("#subscribe-button button");
//   console.log(btn);
// });

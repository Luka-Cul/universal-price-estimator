const state = {};

function updateState(fieldKey, value) {
  state[fieldKey] = value;
  calculatePrice();
}

let totalPrice = 0;

function updatePriceDisplay() {
  document.getElementById("price").innerText =
    `Total: ${config.currency}${totalPrice}`;
}

function calculatePrice() {
  let total = 0;

  config.fields.forEach(field => {

    const value = state[field.key];

    if (!value) return;

    // RADIO
    if (field.type === "radio") {
      const option = field.options.find(o => o.value === value);
      if (option) total += option.price;
    }

    // CHECKBOX
    if (field.type === "checkbox") {
      value.forEach(v => {
        const option = field.options.find(o => o.label === v);
        if (option) total += option.price;
      });
    }

    // SLIDER
    if (field.type === "slider") {
      const num = Number(value);
      total += num * (field.unitPrice || 0);
    }
  });

  totalPrice = total;
  updatePriceDisplay();
}

//radio buttons
function renderRadio(field) {
    let html = `<div class="field"><h3>${field.label}</h3>`;

    field.options.forEach(option => {
        html += `
        <label>
        <input type="radio"
            name="${field.key}"
            value="${option.value}"
            data-price="${option.price}"
            onchange="updateState('${field.key}', this.value)"
        >
        ${option.label} (+${option.price}€)
        </label><br>
        `;
    });

    html += `</div>`;
    return html;
}

function handleCheckbox(fieldKey, el) {
    if (!state[fieldKey]) {
        state[fieldKey] = [];
    }

    if (el.checked) {
        state[fieldKey].push(el.value);
    } 
    else {
        state[fieldKey] = state[fieldKey].filter(v => v !== el.value);
    }

    calculatePrice();
}

//checkbox fileds
function renderCheckbox(field) {
    let html = `<div class="field"><h3>${field.label}</h3>`;

    field.options.forEach(option => {
        html += `
        <label>
        <input type="checkbox"
            value="${option.label}"
            data-price="${option.price}"
            onchange="handleCheckbox('${field.key}', this)"
        >
        ${option.label} (+${option.price}€)
        </label><br>
        `;
    });

    html += `</div>`;
    return html;
}

//Slider field
function renderSlider(field) {
    return `
        <div class="field">

        <h3>${field.label}</h3>

        <input type="range"
            min="${field.min}"
            max="${field.max}"
            value="${field.min}"
            data-priceperpage="${field.unitPrice}"
            id="${field.key}"
            oninput="updateState('${field.key}', this.value)"
        >

        <span id="${field.key}-value">${field.min}</span>

        </div>
    `;
}

function shouldShowField(field) {

  if (!field.showWhen) {
    return true;
  }

  const selected = document.querySelector(
    `input[name="${field.showWhen.field}"]:checked`
  );

  if (!selected) {
    return false;
  }

  return selected.value === field.showWhen.value;
}

function renderForm() {
    let html = "";

    config.fields.forEach((field) => {
        if (field.type === "radio") {
            html += renderRadio(field);
        }

        if (field.type === "checkbox") {
            html += renderCheckbox(field);
        }

        if (field.type === "slider") {
            html += renderSlider(field);
        }
    });

    document.getElementById("form").innerHTML = html;
}

function init() {
  renderForm();
  calculatePrice();
}

init();
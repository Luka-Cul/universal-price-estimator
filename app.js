const app = document.getElementById("app");
let totalPrice = 0;

app.innerHTML = `
    <h2>${config.title}</h2>
    <div id="form"></div>
    <h2 id="price">Total: €0</h2>
`;


function updatePriceDisplay() {
  document.getElementById("price").innerText =
    `Total: ${config.currency}${totalPrice}`;
}

function calculatePrice() {
    let total = 0;

    //radio buttons
    const radios = document.querySelectorAll("input[type='radio']:checked");

    radios.forEach(radio => {
        total += Number(radio.dataset.price || 0);
    });

    //checkboxes
      const checkboxes = document.querySelectorAll("input[type='checkbox']:checked");

    checkboxes.forEach(box => {
        total += Number(box.dataset.price || 0);
    });

    //slider
    const slider = document.querySelector("input[type='range']");

    if (slider) {
        const pages = Number(slider.value);
        const pricePerPage = Number(slider.dataset.priceperpage);

        total += pages * pricePerPage;
    }
    totalPrice = total;

    updatePriceDisplay();
}

function attachEvents() {
  document.addEventListener("input", (e) => {
    
    calculatePrice();

    if (e.target.type === "range") {
        const id = e.target.id;
        const display = document.getElementById(id + "-value");
        if (display) display.innerText = e.target.value;
    }
  });
}

function renderRadio(fieldKey, field) {
    let html = `<div class="field"> <h3>${field.label}</h3>`;
    
    field.options.forEach((option) => {
        html += `
            <label>
            <input type="radio" name="${fieldKey}" value="${option.value}" data-price="${option.price}">
            ${option.label} (+${option.price}€)
            </label><br>
            `;
    });

    html += `</div>`;
    return html;
}

function renderCheckbox(fieldKey, field) {
    let html = `
        <div class="field">
        <h3>${field.label}</h3>
        `;

    field.options.forEach(option => {
    html += `
        <label>
        <input type="checkbox" value="${option.label}" data-price="${option.price}">
        ${option.label} (+${option.price}€)
        </label><br>
        `;
    });

    html += `</div>`;
    return html;
}

function renderSlider(fieldKey, field) {
    return `
        <div class="field">
        <h3>${field.label}</h3>
        
        <input type="range"
            min="${field.min}"
            max="${field.max}"
            value="${field.min}"
            data-priceperpage="${field.pricePerPage}"
            id="${fieldKey}"
        >
        
        <span id="${fieldKey}-value">${field.min}</span>
        </div>
        `;
}

function renderForm() {
    let html = "";
    for (let key in config) {
        if (key === "title" || key === "currency") continue;

        const field = config[key];

        if (field.type === "radio") {
            html += renderRadio(key, field);
        }

        if (field.type === "checkbox") {
            html += renderCheckbox(key, field);
        }

        if (field.type === "slider") {
            html += renderSlider(key, field);
        }
    }
    app.innerHTML += html;
}

renderForm();
attachEvents();
calculatePrice();
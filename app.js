const state = {};

let lead = {
    customer: {
        name: "",
        email: ""
    },
    quote: {
        items: [],
        total: 0
    },
    submittedAt: null
};

let quote = {
  items: [],
  total: 0
};

function updateState(fieldKey, value) {
  state[fieldKey] = value;
  calculatePrice();
}

let totalPrice = 0;

function updatePriceDisplay() {
    document.getElementById("price").innerText = `Total: ${config.currency}${totalPrice}`;
}

function calculatePrice() {
    let total = 0;
    quote.items = [];

    config.fields.forEach(field => {

        const value = state[field.key];

        if (!value) return;

        // RADIO
        if (field.type === "radio") {
            const option = field.options.find(o => o.value === value);
            if (option) {

                total += option.price;

                quote.items.push({
                    label: field.label,
                    value: option.label,
                    price: option.price
                });

            }
        }

        // CHECKBOX
        if (field.type === "checkbox") {

            value.forEach(v => {

            const option = field.options.find(o => o.label === v);

                if (option) {

                    total += option.price;

                    quote.items.push({
                        label: field.label,
                        value: option.label,
                        price: option.price
                    });
                }
            });
        }

        // SLIDER
        if (field.type === "slider") {

            const num = Number(value);

            const price = num * (field.unitPrice || 0);

            total += price;

            quote.items.push({
                label: field.label,
                value: num,
                price: price
            });
        }
    });

    totalPrice = total;
    quote.total = total;
    updatePriceDisplay();
    updateSummary();
}

//radio buttons
function renderRadio(field) {
    let html = `
        <div class="field card">
        <h3 class="field-title">${field.label}</h3>
    `;

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
    let html = `
        <div class="field card">
        <h3 class="field-title">${field.label}</h3>
    `;

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
        <div class="field card">
        
        <h3 class="field-title">${field.label}</h3>

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

function updateSummary() {
    let html = "";

    config.fields.forEach(field => {
        const value = state[field.key];

        if (!value) return;

        // RADIO
        if (field.type === "radio") {
            const option = field.options.find(o => o.value === value);
            if (option) {
                html += `<p><strong>${field.label}:</strong> ${option.label} — €${option.price}</p>`;
            }
        }

        // CHECKBOX
        if (field.type === "checkbox") {
            let items = [];

            value.forEach(v => {
                const option = field.options.find(o => o.label === v);
                if (option) {
                    items.push(`- ${option.label} (€${option.price})`);
                }
            });

            if (items.length) {
                html += `<p><strong>${field.label}:</strong><br>${items.join("<br>")}</p>`;
            }
        }

        // SLIDER
        if (field.type === "slider") {
            html += `<p><strong>${field.label}:</strong> ${value}</p>`;
        }
    });

    document.getElementById("summary").innerHTML = html;
}

function init() {
  renderForm();
  calculatePrice();
}

function getQuoteText() {
    let text = "QUOTE SUMMARY\n\n";

    quote.items.forEach(item => {
        text += `${item.label}: ${item.value} (€${item.price})\n`;
    });

    text += `\nTOTAL: €${quote.total}`;

    return text;
}

function copyQuote() {
    const text = getQuoteText();

    navigator.clipboard.writeText(text)
    .then(() => {
        alert("Quote copied to clipboard!");
    })
    .catch(err => {
        console.error("Copy failed:", err);
    });
}

function sendQuote() {

    const name = document.getElementById("leadName").value;
    const email = document.getElementById("leadEmail").value;

    if (!name || !email) {
        alert("Please enter your name and email");
        return;
    }

    const total = totalPrice;
    const summary = document.getElementById("summary").innerText;

    const templateParams = {
        name: name,
        email: email,
        total: total,
        summary: summary
    };

    emailjs.send(
        "service_z70fuz8",
        "template_2dqpizi",
        templateParams
    )
    .then(() => {
        alert("Quote sent successfully!");
    })
    .catch((error) => {
        console.error("EmailJS error:", error);
        alert("Failed to send quote");
    });

    emailjs.send(
        "service_z70fuz8",
        "template_6mq0aj8",
        templateParams
    )
    .then(() => {
        console.log("Owner notification sent");
    })
        .catch((error) => {
        console.error("Owner email error:", error);
    });

    fetch("https://script.google.com/macros/s/AKfycbyZVKT7dori_mrrXoMbWAgFon1b_QZibrqFU98LMv5jASOq1hNKrvWwEH0j2ZRRNAxg/exec", {
        method: "POST",
        body: JSON.stringify({
            name: name,
            email: email,
            total: totalPrice,
            summary: document.getElementById("summary").innerText
        })
    })
    .then(() => console.log("Saved to sheet"))
    .catch(err => console.error("Sheet error:", err));

    // optional: store locally
    lead.customer.name = name;
    lead.customer.email = email;
    lead.quote.total = total;
    lead.submittedAt = new Date().toISOString();

    console.log("Lead:", lead);
}

init();
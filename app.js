const state = {};
let totalPrice = 0;

// State changes always flow through here so the UI and price stay in sync.
function updateState(fieldKey, value) {
	state[fieldKey] = value;
	calculatePrice();
	updateFormVisuals(fieldKey, value);
}

function handleCheckbox(fieldKey, optionLabel, checked) {
	if (!state[fieldKey]) state[fieldKey] = [];
	if (checked) {
		if (!state[fieldKey].includes(optionLabel)) state[fieldKey].push(optionLabel);
	} else {
		state[fieldKey] = state[fieldKey].filter(v => v !== optionLabel);
	}
	calculatePrice();
}

function getSelectedOption(field) {
	const value = state[field.key];
	return field.options.find(option => option.value === value);
}

function getPrimaryRadioOption() {
	const radioField = config.fields.find(field => field.type === "radio");
	return radioField ? getSelectedOption(radioField) : null;
}

function formatPrice(value) {
	return `${config.currency}${value.toLocaleString()}`;
}

// Builds the current quote lines and pushes the calculated total to the UI.
function calculatePrice() {
	let subtotal = 0;
	const lineItems = [];

	config.fields.forEach(field => {
		const value = state[field.key];
		if (!value && value !== 0) return;

		if (field.type === "radio") {
			const opt = getSelectedOption(field);
			if (opt) {
				subtotal += opt.price;
				lineItems.push({ label: opt.label, price: opt.price, qty: null });
			}
		}

		if (field.type === "checkbox") {
			value.forEach(v => {
				const opt = field.options.find(o => o.label === v);
				if (opt) {
					subtotal += opt.price;
					lineItems.push({ label: opt.label, price: opt.price, qty: null });
				}
			});
		}

		if (field.type === "slider") {
			const num = Number(value);
			const price = num * (field.unitPrice || 0);
			const radioOpt = getPrimaryRadioOption();

			subtotal += price;
			lineItems.push({ label: field.label, price: price, qty: num, unitPrice: field.unitPrice, radioOpt });

			updateSliderDisplay(field, num, price, radioOpt);
		}
	});

	totalPrice = subtotal;

  document.getElementById("subtotal").textContent = `€${subtotal}`;
	animatePrice(Math.round(subtotal));
	updateSummary(lineItems);
}

function updateSliderDisplay(field, num, price, radioOpt) {
	const numEl = document.getElementById(`${field.key}-num`);
	const calcEl = document.getElementById(`${field.key}-calc`);
	const rangeEl = document.getElementById(field.key);
	const perUnit = field.unitPrice || 0;
	const base = radioOpt ? formatPrice(radioOpt.price) : formatPrice(perUnit);

	if (numEl) numEl.textContent = String(num).padStart(2, "0");
	if (rangeEl) rangeEl.value = num;
	if (calcEl) calcEl.textContent = `× ${base} = ${formatPrice(price)}`;
}

function animatePrice(target) {
	const el = document.getElementById("price");
	const start = parseInt(el.textContent.replace(/[^0-9]/g, "")) || 0;
	if (start === target) return;
	const duration = 400;
	const startTime = performance.now();
	function step(now) {
		const progress = Math.min((now - startTime) / duration, 1);
		const eased = 1 - Math.pow(1 - progress, 3);
		const current = Math.round(start + (target - start) * eased);
		el.textContent = `€${current}`;
		if (progress < 1) requestAnimationFrame(step);
	}
	requestAnimationFrame(step);
}

// Summary panel mirrors the selected form values in invoice-like rows.
function updateSummary(lineItems) {
	const el = document.getElementById("summary");
	if (!lineItems || lineItems.length === 0) {
		el.innerHTML = `<div class="summary-line empty-note">No options selected yet.</div>`;
		return;
	}
	el.innerHTML = lineItems.map(item => `
		<div class="summary-line">
			<span>${item.label}${item.qty ? ` × ${item.qty}` : ""}</span>
			<strong>€${item.price}</strong>
		</div>
	`).join("");
}

function updateFormVisuals(fieldKey, value) {
	const field = config.fields.find(f => f.key === fieldKey);
	if (!field) return;

	if (field.type === "radio") {
		document.querySelectorAll(`[data-radio-key="${fieldKey}"]`).forEach(card => {
			card.classList.toggle("selected", card.dataset.radioValue === value);
		});
	}
}

// Renderers translate config.js field definitions into interactive controls.
function renderRadio(field, idx) {
	const optionsHtml = field.options.map(option => `
		<div class="radio-card"
				 data-radio-key="${field.key}"
				 data-radio-value="${option.value}"
				 onclick="updateState('${field.key}', '${option.value}')">
			<input type="radio" name="${field.key}" value="${option.value}">
			<div class="radio-dot"></div>
			<div class="radio-info">
				<div class="radio-name">${option.label}</div>
				${option.desc ? `<div class="radio-desc">${option.desc}</div>` : ""}
			</div>
			<div class="radio-price">${formatPrice(option.price)}</div>
		</div>
	`).join("");

	return `
		<div class="form-section">
			<div class="section-heading">
				<span class="section-num">${String(idx + 1).padStart(2, "0")}</span>
				<span class="section-label">${field.label}</span>
			</div>
			<div class="radio-options">${optionsHtml}</div>
		</div>
	`;
}

function renderSlider(field, idx) {
	return `
		<div class="form-section">
			<div class="section-heading">
				<span class="section-num">${String(idx + 1).padStart(2, "0")}</span>
				<span class="section-label">${field.label}</span>
			</div>
			<div class="slider-card">
				<div class="slider-display">
					<button class="slider-btn" onclick="sliderStep('${field.key}', -1)">−</button>
					<div class="slider-num" id="${field.key}-num">${String(field.min).padStart(2,"0")}</div>
					<button class="slider-btn" onclick="sliderStep('${field.key}', 1)">+</button>
				</div>
				<div class="slider-calc" id="${field.key}-calc">× €${field.unitPrice} = €${field.min * field.unitPrice}</div>
				<input type="range"
					id="${field.key}"
					min="${field.min}"
					max="${field.max}"
					value="${field.min}"
					oninput="updateState('${field.key}', this.value)"
				>
			</div>
		</div>
	`;
}

function renderCheckbox(field, idx) {
	const optionsHtml = field.options.map(option => `
		<label class="checkbox-card" data-cb-key="${field.key}" data-cb-label="${option.label}">
			<input type="checkbox" value="${option.label}"
				onchange="handleCheckbox('${field.key}', '${option.label}', this.checked); toggleCheckboxCard(this)">
			<div class="checkbox-top">
				<span class="checkbox-name">${option.label}</span>
				<span class="checkbox-price">+€${option.price}</span>
			</div>
			${option.desc ? `<div class="checkbox-desc">${option.desc}</div>` : ""}
		</label>
	`).join("");

	return `
		<div class="form-section">
			<div class="section-heading">
				<span class="section-num">${String(idx + 1).padStart(2, "0")}</span>
				<span class="section-label">${field.label}</span>
			</div>
			<div class="checkbox-grid">${optionsHtml}</div>
		</div>
	`;
}

function toggleCheckboxCard(input) {
	input.closest(".checkbox-card").classList.toggle("selected", input.checked);
}

function sliderStep(key, delta) {
	const field = config.fields.find(f => f.key === key);
	if (!field) return;
	const current = Number(state[key] ?? field.min);
	const next = Math.min(field.max, Math.max(field.min, current + delta));
	updateState(key, next);
}

function renderForm() {
	const html = config.fields.map((field, idx) => {
		if (field.type === "radio") return renderRadio(field, idx);
		if (field.type === "slider") return renderSlider(field, idx);
		if (field.type === "checkbox") return renderCheckbox(field, idx);
		return "";
	});

	document.getElementById("form").innerHTML = html.join("");

	// Defaults are applied after rendering so generated DOM nodes exist.
	config.fields.filter(f => f.type === "slider").forEach(f => {
		state[f.key] = f.min;
	});

	config.fields.filter(f => f.type === "radio").forEach(field => {
		const defaultOption = field.options.find(option => option.default === true);
		if (defaultOption) updateState(field.key, defaultOption.value);
	});
}

// Quote actions: plain-text summary, print, email, and sheet sync.
function buildQuoteText() {
	let text = `QUOTE SUMMARY\n${"─".repeat(30)}\n\n`;
	config.fields.forEach(field => {
		const value = state[field.key];
		if (!value && value !== 0) return;
		if (field.type === "radio") {
			const opt = field.options.find(o => o.value === value);
			if (opt) text += `${field.label}: ${opt.label} — €${opt.price}\n`;
		}
		if (field.type === "checkbox") {
			text += `${field.label}:\n`;
			value.forEach(v => {
				const opt = field.options.find(o => o.label === v);
				if (opt) text += `  · ${opt.label} — €${opt.price}\n`;
			});
		}
		if (field.type === "slider") {
			text += `${field.label}: ${value}\n`;
		}
	});
	text += `\nSubtotal: €${totalPrice}\nTOTAL: €${totalPrice}\n`;
	return text;
}

function printQuote() {
	window.print();
}

function showSheetSyncError() {
	const toast = document.createElement("div");
	toast.textContent = "Quote saved locally — sheet sync failed";
	toast.style.position = "fixed";
	toast.style.right = "20px";
	toast.style.bottom = "20px";
	toast.style.zIndex = "9999";
	toast.style.background = "#2A1010";
	toast.style.color = "#FFFFFF";
	toast.style.border = "1px solid rgba(255,255,255,0.18)";
	toast.style.borderRadius = "8px";
	toast.style.padding = "12px 14px";
	toast.style.fontSize = "13px";
	toast.style.fontWeight = "700";
	toast.style.boxShadow = "0 10px 30px rgba(0,0,0,0.25)";

	document.body.appendChild(toast);
	setTimeout(() => toast.remove(), 4000);
}

function sendToSheet(name, email, total, summary) {
	fetch("https://script.google.com/macros/s/AKfycbyZVKT7dori_mrrXoMbWAgFon1b_QZibrqFU98LMv5jASOq1hNKrvWwEH0j2ZRRNAxg/exec", {
		method: "POST",
		mode: "cors",
		body: JSON.stringify({ name, email, total, summary })
	})
	.then(res => res.text())
	.then(data => console.log("Sheet response:", data))
	.catch(err => {
		console.error("Sheet error:", err);
		showSheetSyncError();
	});
}

function setSendButtonLoading(isLoading) {
	const btn = document.getElementById("sendBtn");
	btn.disabled = isLoading;
	btn.innerHTML = isLoading
		? `Sending… <span class="send-btn-arrow">→</span>`
		: `Send quote <span class="send-btn-arrow">→</span>`;
}

function sendQuote() {
	document.getElementById("successMessage").style.display = "none";
	const name  = document.getElementById("leadName").value.trim();
	const email = document.getElementById("leadEmail").value.trim();
	if (!name || !email) { alert("Please enter your name and email."); return; }

	setSendButtonLoading(true);

	const total   = Math.round(totalPrice);
	const summary = buildQuoteText();

	Promise.all([
		emailjs.send("service_z70fuz8", "template_2dqpizi", { name, email, total, summary }),
		emailjs.send("service_z70fuz8", "template_6mq0aj8", { name, email, total, summary })
	])
	.then(() => {
		setSendButtonLoading(false);
		document.getElementById("successMessage").style.display = "block";
		sendToSheet(name, email, total, summary);
	})
	.catch(err => {
		console.error(err);
		setSendButtonLoading(false);
		alert("Email sending failed. Please try again.");
	});
}

function init() {
	renderForm();
	calculatePrice();
}

init();

# Universal Price Estimator

A lightweight, config-driven price estimator widget for websites and services. Drop it into any project, edit a single config file, and get a fully functional live quote generator with email delivery and PDF export — no frameworks, no build step.

## Features

- **Config-driven** — all fields, labels, prices, and options live in `config.js`. No touching the core logic to customise it.
- **Live pricing** — total updates instantly as the user makes selections, with a smooth count-up animation
- **Three field types** — radio cards, quantity slider, and checkbox add-ons
- **PDF export** — the right panel prints as a clean, styled quote via `window.print()` with no dependencies
- **Email delivery** — sends the quote to both the business and the customer via [EmailJS](https://www.emailjs.com/)
- **Google Sheets logging** — optionally logs each submission to a spreadsheet via a Google Apps Script endpoint
- **Unique quote IDs** — each session gets a collision-proof ID using `Date.now().toString(36)`
- **Fully responsive** — works on mobile, right panel stacks above the form

## File Structure

```
├── index.html      # Markup and layout
├── style.css       # All styles including print stylesheet
├── app.js          # Rendering, state, pricing logic, and actions
├── config.js       # Your fields, options, and prices — edit this
```

## How It Works

All form fields are defined in `config.js` as an array under `fields`. The app reads this config on init, renders the form dynamically, and recalculates the total on every interaction.

### Field types

**Radio** — single-select cards, each with a label, value, price, and optional description.

**Slider** — a quantity input with a min, max, and `unitPrice` per unit.

**Checkbox** — multi-select add-ons, each with a label, price, and optional description.

### Default selection

Add `default: true` to any radio option to have it pre-selected on load, so the summary panel is never empty when the page first renders.

```js
{ label: "Basic", value: "basic", price: 300, default: true, desc: "..." }
```

### Pricing

Each field type contributes to the running subtotal. Radio and checkbox options have a flat `price`. Slider contributes `value × unitPrice`. The total updates live and animates on every change.

## Integrations

### EmailJS

Sends two emails on quote submission — one to the customer, one to you. Replace the IDs in `index.html` and `app.js` with your own:

```js
emailjs.init("YOUR_PUBLIC_KEY");
emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", { name, email, total, summary });
```

### Google Sheets

`sendToSheet()` in `app.js` posts the submission to a Google Apps Script web app URL. Replace the endpoint with your own deployed script URL. Failed syncs surface a visible toast to the user rather than failing silently.

## PDF Export

Clicking "Download PDF" triggers `window.print()`. A `@media print` stylesheet in `style.css` hides everything except the right summary panel and renders it full-width with colors preserved. Works in all modern browsers — no libraries needed.

## Customisation

Everything visual is controlled by CSS variables at the top of `style.css`. The accent color (`--acid`) is `#C8F135` by default — swap it out to match your brand.

## License

MIT
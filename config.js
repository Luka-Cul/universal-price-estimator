const config = {
  title: "Service Estimator",
  currency: "€",

  fields: [
    {
      key: "serviceType",
      label: "Choose a tier",
      type: "radio",
      options: [
        { label: "Basic",    value: "basic",    price: 300,  desc: "Single deliverable, one round of feedback. · 5–7 days" },
        { label: "Standard", value: "standard", price: 600,  desc: "Full scope, two rounds, source files. · 10–14 days" },
        { label: "Premium",  value: "premium",  price: 1200, desc: "End-to-end, unlimited rounds, priority slot. · 3–4 weeks" }
      ]
    },
    {
      key: "quantity",
      label: "How many units?",
      type: "slider",
      min: 1,
      max: 20,
      unitPrice: 50
    },
    {
      key: "extras",
      label: "Add-ons",
      type: "checkbox",
      options: [
        { label: "Rush delivery",   price: 100, desc: "Cut lead time in half" },
        { label: "Extra revisions", price: 80,  desc: "+3 additional rounds" }
      ]
    }
  ]
};
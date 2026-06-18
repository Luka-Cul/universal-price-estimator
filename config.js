const config = {
  title: "Website Price Estimator",

  currency: "€",

  websiteType: {
    label: "What type of website do you need?",

    type: "radio",

    options: [
      { label: "Landing Page", value: "landing", price: 150 },
      { label: "Business Website", value: "business", price: 600 },
      { label: "Ecommerce", value: "ecommerce", price: 1200 }
    ]
  }
};

config.pages = {
  label: "How many pages do you need?",

  type: "slider",

  min: 1,
  max: 20,

  pricePerPage: 50
};

config.features = {
  label: "Extra features",

  type: "checkbox",

  options: [
    { label: "Blog", price: 150 },
    { label: "Multilingual", price: 300 },
    { label: "Booking System", price: 500 },
    { label: "Animations", price: 200 }
  ]
};

console.log(config);
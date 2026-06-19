const config = {
  title: "Service Estimator",
  currency: "€",

  fields: [
    {
      key: "serviceType",
      label: "What do you need?",

      type: "radio",

      options: [
        { label: "Basic Service", value: "basic", price: 300 },
        { label: "Standard Service", value: "standard", price: 600 },
        { label: "Premium Service", value: "premium", price: 1200 }
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
      label: "Extra options",

      type: "checkbox",

      options: [
        { label: "Fast delivery", price: 100 },
        { label: "Extra revisions", price: 80 }
      ]
    }
  ]
};
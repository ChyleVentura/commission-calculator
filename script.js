const SHEET_API =
  "https://script.google.com/macros/s/AKfycbwfFbB7lTOTFDaTva6OZTbj6HvOH9FQEjgr5vUYKL8PI01ePir1TE1zNZhcn_-cg8BDog/exec";

const productSelect =
  document.getElementById("product");

  const productList =
  document.getElementById("productList");

const paymentSelect =
  document.getElementById("payment");

const sellingPrice =
  document.getElementById("price");

const soldPriceInput =
  document.getElementById("sold_price");

const discountThreshold =
  document.getElementById("discountThreshold");

formatNumberInput(sellingPrice);

formatNumberInput(soldPriceInput);

formatNumberInput(discountThreshold);

let productsData = [];

    // SETTINGS
    const discountLimit = 0.03;

    const commissionShare = 0.25;

    const noDiscount = 0.30;

// LOAD PRODUCTS
async function loadProducts() {

  const CACHE_KEY =
    "products";

  const CACHE_TIME_KEY =
    "products_cache_time";

  const CACHE_DURATION =
    5 * 60 * 1000; // 5 minutes

  const now = Date.now();

  const cachedData =
    localStorage.getItem(CACHE_KEY);

  const cachedTime =
    localStorage.getItem(CACHE_TIME_KEY);

  // USE CACHE IF STILL VALID
  if (
    cachedData &&
    cachedTime &&
    (now - cachedTime < CACHE_DURATION)
  ) {

    productsData =
      JSON.parse(cachedData);

    renderProducts();

    return;

  }

  // FETCH LATEST DATA
  const response =
    await fetch(SHEET_API);

  const data =
    await response.json();

  productsData = data;

  // SAVE CACHE
  localStorage.setItem(
    CACHE_KEY,
    JSON.stringify(data)
  );

  localStorage.setItem(
    CACHE_TIME_KEY,
    now
  );

  renderProducts();

}

function formatNumberInput(input) {

  input.addEventListener("input", () => {

    // REMOVE NON-NUMBERS
    let value =
      input.value.replace(/,/g, "");

    // ALLOW DECIMALS
    if (isNaN(value)) return;

    // FORMAT
    input.value =
      Number(value).toLocaleString(
        "en-US"
      );

  });

}


function renderProducts() {

  productList.innerHTML = "";

  productsData.forEach(item => {

    const option =
      document.createElement("option");

    option.value =
      item.product;

    productList.appendChild(option);

  });

}

loadProducts();

// AUTO PRICE
function updatePrice() {

  const product =
    productSelect.value;

  const payment =
    paymentSelect.value;

  if (!product || !payment) {

    sellingPrice.innerText = "";
    discountThreshold.innerText = "";

    return;

  }

  const selected =
    productsData.find(
      item => item.product === product
    );

  if (!selected) return;

  let basePrice = 0;

  // CASH
  if (payment === "Card Transaction") {

    basePrice =
      Number(
        String(selected.srp)
          .replace(/,/g, "")
      );

  }

  // NON-CASH
  else {

    basePrice =
      Number(
        String(selected.cashPrice)
          .replace(/,/g, "")
      );

  }

    sellingPrice.innerText =
      Number(basePrice)
        .toLocaleString("en-US");

  // FINAL THRESHOLD PRICE
  const thresholdPrice =
    basePrice -
    (basePrice * discountLimit);

    discountThreshold.innerText =
      Number(thresholdPrice)
        .toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });

}

productSelect.addEventListener(
  "change",
  updatePrice,
  loadProducts
);

paymentSelect.addEventListener(
  "change",
  updatePrice,
  loadProducts
);

const priceError =
  document.getElementById("priceError");

soldPriceInput.addEventListener(
  "input",
  () => {

    const sold =
      Number(
        soldPriceInput.value
          .replace(/,/g, "")
      );

    const threshold =
      Number(
        discountThreshold.innerText
          .replace(/,/g, "")
      );

    const selling =
      Number(
        sellingPrice.innerText
          .replace(/,/g, "")
      );

    // EMPTY
    if (!soldPriceInput.value) {

      priceError.innerText = "";

      soldPriceInput.classList.remove(
        "input-error"
      );

      return;

    }

    // BELOW THRESHOLD
    if (sold < threshold) {

      priceError.innerText =
        `Minimum allowed price is ₱${threshold.toLocaleString()}`;

      soldPriceInput.classList.add(
        "input-error"
      );

    }

    // ABOVE SELLING PRICE
    else if (sold > selling) {

      priceError.innerText =
        `Sold price cannot exceed ₱${selling.toLocaleString()}`;

      soldPriceInput.classList.add(
        "input-error"
      );

    }

    // VALID
    else {

      priceError.innerText = "";

      soldPriceInput.classList.remove(
        "input-error"
      );

    }

});

// COMPUTE
document
  .getElementById("computeBtn")
  .addEventListener("click", () => {

    const product =
      productSelect.value;

    const payment =
      paymentSelect.value;

    const sellprice =
      Number(
        sellingPrice.innerText
          .replace(/,/g, "")
      );

    const soldPrice =
      Number(
        soldPriceInput.value
          .replace(/,/g, "")
      );

    const threshold =
      Number(
        discountThreshold.innerText
          .replace(/,/g, "")
      );

    const selling =
      Number(
        sellingPrice.innerText
          .replace(/,/g, "")
      );

    // BELOW THRESHOLD
    if (soldPrice < threshold) {

      priceError.innerText =
        `Minimum allowed price is ₱${threshold.toLocaleString()}`;

      return;

    }

    // ABOVE SELLING PRICE
    if (soldPrice > selling) {

      priceError.innerText =
        `Sold price cannot exceed ₱${selling.toLocaleString()}`;

      return;

    }

    // CLEAR ERROR
    priceError.innerText = "";

    if (
      !product ||
      !payment ||
      !soldPrice
    ) {

      alert("Complete all fields.");

      return;

    }

    const selected =
      productsData.find(
        item => item.product === product
      );

    let basePrice = 0;

    // CASH PRICE
    if (payment === "Card Transaction") {

      basePrice =
        selected.srp;

    }

    // SRP
    else {

      basePrice =
        selected.cashPrice;

    }

    // THRESHOLD
    const thresholdPrice =
      basePrice -
      (basePrice * discountLimit);

    // EXCESS
    let excess =
      soldPrice - thresholdPrice;

    // Prevent negative
    // if (excess < 0) {

    //   excess = 0;

    // }
    console.log(excess)
    // COMMISSION
    

    let commission = 0;
    let commissionRate =0;
      if (sellprice === soldPrice){
        commission = excess*noDiscount
        commissionRate = noDiscount
        console.log('no discount')
      }else{
        commission = excess*commissionShare
        commissionRate = commissionShare
        console.log('discounted')
      };
    
    // DISPLAY
    document.getElementById(
      "commission"
    ).innerText =
      `₱${commission.toLocaleString(undefined,{
        minimumFractionDigits:2,
        maximumFractionDigits:2
      })}`;

    document.getElementById(
      "grossProfit"
    ).innerText =
      `₱${excess.toLocaleString(undefined,{
        minimumFractionDigits:2,
        maximumFractionDigits:2
      })}`;

    document.getElementById(
      "commissionRate"
    ).innerText =
      `${(commissionRate * 100).toFixed(2)}%`;


});
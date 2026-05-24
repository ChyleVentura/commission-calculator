const SHEET_API =
  "https://script.google.com/macros/s/AKfycbwfFbB7lTOTFDaTva6OZTbj6HvOH9FQEjgr5vUYKL8PI01ePir1TE1zNZhcn_-cg8BDog/exec?type=products";

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

const dropdown =
  document.getElementById(
    "productDropdown"
  );

const loadingScreen =
  document.getElementById(
    "loadingScreen"
  );



const discountThreshold =
  document.getElementById("discountThreshold");

formatNumberInput(sellingPrice);

formatNumberInput(soldPriceInput);

formatNumberInput(discountThreshold);

let productsData = [];

let addonsData = [];

let selectedAddons = [];

let originalBasePrice = 0;

    localStorage.clear();
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
    5 * 60 * 1000;

  const now =
    Date.now();

  const cachedData =
    localStorage.getItem(
      CACHE_KEY
    );

  const cachedTime =
    localStorage.getItem(
      CACHE_TIME_KEY
    );

  // =========================
  // USE CACHE
  // =========================
  if (

    cachedData &&
    cachedTime &&
    (now - cachedTime < CACHE_DURATION)

  ) {

    const parsed =
      JSON.parse(cachedData);

    productsData =
      parsed.products || [];

    addonsData =
      parsed.addons || [];

    renderProducts();

    loadingScreen.style.display =
      "none";

    return;

  }

  // =========================
  // FETCH API
  // =========================
  const response =
    await fetch(
      SHEET_API
    );

  const data =
    await response.json();

  productsData =
    data.products || [];

  addonsData =
    data.addons || [];

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

  loadingScreen.style.display =
    "none";

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

document
  .getElementById("addAddonBtn")
  .addEventListener(
    "click",
    addAddonSelect
);

function addAddonSelect() {

  const container =
    document.getElementById(
      "addonContainer"
    );

  // ROW
  const row =
    document.createElement("div");

  row.className =
    "addon-row flex items-center gap-3";

  // SELECT
  const select =
    document.createElement(
      "select"
    );

  select.className =
    "addon-select flex-1 h-14 rounded-2xl bg-[#1a1a1a] border border-yellow-400/10 px-5 text-white outline-none";

  select.innerHTML =
    `<option value="">
      Select Add-on
    </option>`;

  addonsData.forEach(addon => {

    select.innerHTML += `
      <option
        value="${addon.amount}">
        ${addon.name}
        (+₱${Number(addon.amount)
          .toLocaleString()})
      </option>
    `;

  });

  select.addEventListener(
    "change",
    updateAddonTotal
  );

  // DELETE BUTTON
  const deleteBtn =
    document.createElement(
      "button"
    );

  deleteBtn.type = "button";

  deleteBtn.innerText = "✕";

deleteBtn.className =
  "delete-addon-btn w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-2xl font-bold flex items-center justify-center shrink-0 active:scale-95 transition";

  deleteBtn.addEventListener(
    "click",
    () => {

      row.remove();

      updateAddonTotal();

    }
  );

  // APPEND
  row.appendChild(select);

  row.appendChild(deleteBtn);

  container.appendChild(row);

}

function updateAddonTotal() {

  let addonTotal = 0;

  document
    .querySelectorAll(
      ".addon-select"
    )
    .forEach(select => {

      addonTotal +=
        Number(select.value || 0);

    });

  // FINAL PRICE
  const finalPrice =
    originalBasePrice +
    addonTotal;

  // UPDATE SELLING PRICE
  sellingPrice.innerText =
    `₱${finalPrice.toLocaleString(
      "en-US"
    )}`;

  // NEW THRESHOLD
  const thresholdPrice =
    finalPrice -
    (finalPrice * discountLimit);

  // UPDATE THRESHOLD
  discountThreshold.innerText =
    `₱${thresholdPrice.toLocaleString(
      "en-US",
      {
        minimumFractionDigits:2,
        maximumFractionDigits:2
      }
    )}`;

  validateSoldPrice();

}

function validateSoldPrice() {

  const soldPrice =
    Number(
      soldPriceInput.value
        .replace(/[₱,]/g, "")
    );

  const threshold =
    Number(
      discountThreshold.innerText
        .replace(/[₱,]/g, "")
    );

  const selling =
    Number(
      sellingPrice.innerText
        .replace(/[₱,]/g, "")
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
  if (soldPrice < threshold) {

    priceError.innerText =
      `Minimum allowed price is ₱${threshold.toLocaleString(
        "en-US",
        {
          minimumFractionDigits:2,
          maximumFractionDigits:2
        }
      )}`;

    soldPriceInput.classList.add(
      "input-error"
    );

    return;

  }

  // ABOVE SELLING PRICE
  if (soldPrice > selling) {

    priceError.innerText =
      `Sold price cannot exceed ₱${selling.toLocaleString(
        "en-US",
        {
          minimumFractionDigits:2,
          maximumFractionDigits:2
        }
      )}`;

    soldPriceInput.classList.add(
      "input-error"
    );

    return;

  }

  // VALID
  priceError.innerText = "";

  soldPriceInput.classList.remove(
    "input-error"
  );

}

function validateProduct() {

  const value =
    productSelect.value.trim();

  const exists =
    productsData.some(
      item =>
        item.product
          .trim()
          .toLowerCase() ===
        value
          .trim()
          .toLowerCase()
    );

  // INVALID
  if (!exists) {

    productError.innerText =
      "Invalid product selected.";

    productSelect.classList.add(
      "input-error"
    );

    // CLEAR INPUT
    productSelect.value = "";

    // CLEAR PRICE INFO
    sellingPrice.innerText =
      "₱0.00";

    discountThreshold.innerText =
      "₱0.00";

    return false;

  }

  // VALID
  productError.innerText = "";

  productSelect.classList.remove(
    "input-error"
  );

  return true;

}


function renderProducts() {

  showDropdown(productsData);

}

function showDropdown(data = []) {

  dropdown.innerHTML = "";

  data.forEach(item => {

    const div =
      document.createElement("div");

    div.classList.add(
      "dropdown-item"
    );

    div.innerText =
      item.product;

    div.addEventListener(
      "click",
      () => {

        productSelect.value =
          item.product;

        // CLEAR ERROR
        productError.innerText =
          "";

        productSelect.classList.remove(
          "input-error"
        );

        dropdown.style.display =
          "none";

        updatePrice();

      }
    );

    dropdown.appendChild(div);

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

  // SAVE ORIGINAL PRICE
  originalBasePrice =
    basePrice;

  // DISPLAY PRICE
  sellingPrice.innerText =
    `₱${basePrice.toLocaleString()}`;

  // THRESHOLD
  const thresholdPrice =
    basePrice -
    (basePrice * discountLimit);

  discountThreshold.innerText =
    `₱${thresholdPrice.toLocaleString(
      "en-US",
      {
        minimumFractionDigits:2,
        maximumFractionDigits:2
      }
    )}`;

  // UPDATE ADDONS
  updateAddonTotal();

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

productSelect.addEventListener(
  "input",
  () => {

    // CLEAR PRODUCT ERROR
    productError.innerText = "";

    productSelect.classList.remove(
      "input-error"
    );

    // CLEAR SOLD PRICE
    soldPriceInput.value = "";

    const keyword =
      productSelect.value
        .trim()
        .toLowerCase();

    // EMPTY SEARCH
    if (!keyword) {

      dropdown.style.display =
        "none";

      return;

    }

    // FILTER PRODUCTS
    const filtered =
      productsData.filter(item =>

        String(item.product)
          .toLowerCase()
          .includes(keyword)

      );

    // SHOW RESULTS
    if (filtered.length > 0) {

      dropdown.style.display =
        "block";

      showDropdown(filtered);

    }

    // NO RESULTS
    else {

      dropdown.style.display =
        "none";

    }

});

productSelect.addEventListener(
  "blur",
  validateProduct
);

document.addEventListener(
  "click",
  (e) => {

    if (
      !e.target.closest(
        ".search-wrapper"
      )
    ) {

      dropdown.style.display =
        "none";

    }

});

const priceError =
  document.getElementById("priceError");

soldPriceInput.addEventListener(
  "input",
  () => {

    const sold =
      Number(
        soldPriceInput.value
          .replace(/[₱,]/g, "")
      );

    const threshold =
      Number(
        discountThreshold.innerText
          .replace(/[₱,]/g, "")
      );

    const selling =
      Number(
        sellingPrice.innerText
          .replace(/[₱,]/g, "")
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
        `Minimum allowed price is ₱${threshold.toLocaleString(
          "en-US",
          {
            minimumFractionDigits:2,
            maximumFractionDigits:2
          }
        )}`;

      soldPriceInput.classList.add(
        "input-error"
      );

      return;

    }

    // ABOVE SELLING PRICE
    if (sold > selling) {

      priceError.innerText =
        `Sold price cannot exceed ₱${selling.toLocaleString(
          "en-US",
          {
            minimumFractionDigits:2,
            maximumFractionDigits:2
          }
        )}`;

      soldPriceInput.classList.add(
        "input-error"
      );

      return;

    }

    // VALID
    priceError.innerText = "";

    soldPriceInput.classList.remove(
      "input-error"
    );

});

// COMPUTE
document
  .getElementById("computeBtn")
  .addEventListener("click", () => {

    const product =
      productSelect.value;

    const payment =
      paymentSelect.value;

    if (priceError.innerText !== "") {

      return;

    }

    const sellprice =
      Number(
        sellingPrice.innerText
          .replace(/[₱,]/g, "")
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

    const basePrice =
      Number(
        sellingPrice.innerText
          .replace(/[₱,]/g, "")
      );

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

    document.getElementById(
      "productName"
    ).innerText =
      product;

    // ADD-ONS
    const addonNames = [];

    document
      .querySelectorAll(
        ".addon-select"
      )
      .forEach(select => {

        if (select.selectedIndex > 0) {

          addonNames.push(
            select.options[
              select.selectedIndex
            ].text
          );

        }

    });

    document.getElementById(
      "addOnSpan"
    ).innerText =
      addonNames.length > 0
        ? addonNames.join(", ")
        : "None";

    // SELLING PRICE
    document.getElementById(
      "sellingPriceSpan"
    ).innerText =
      `₱${sellprice.toLocaleString(
        "en-US",
        {
          minimumFractionDigits:2,
          maximumFractionDigits:2
        }
      )}`;

    // SOLD PRICE
    document.getElementById(
      "soldPriceSpan"
    ).innerText =
      `₱${soldPrice.toLocaleString(
        "en-US",
        {
          minimumFractionDigits:2,
          maximumFractionDigits:2
        }
      )}`;


});
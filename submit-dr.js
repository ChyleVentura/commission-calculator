// submit-dr.js

const API_URL =
  "https://script.google.com/macros/s/AKfycbwfFbB7lTOTFDaTva6OZTbj6HvOH9FQEjgr5vUYKL8PI01ePir1TE1zNZhcn_-cg8BDog/exec";

// LOGIN
const agentName =
  localStorage.getItem(
    "agentName"
  );

// ELEMENTS
const unitInput =
  document.getElementById(
    "unit"
  );

const dropdown =
  document.getElementById(
    "productDropdown"
  );

const soldPriceInput =
  document.getElementById(
    "soldPrice"
  );

const sellingPrice =
  document.getElementById(
    "sellingPrice"
  );

const threshold =
  document.getElementById(
    "threshold"
  );

const grossProfit =
  document.getElementById(
    "grossProfit"
  );

const commission =
  document.getElementById(
    "commission"
  );

const addonContainer =
  document.getElementById(
    "addonContainer"
  );

const drInput =
  document.getElementById(
    "drNumber"
  );

const drError =
  document.getElementById(
    "drError"
  );

const commissionRateDisplay =
  document.getElementById(
    "commissionRateDisplay"
  );

const soldPriceError =
  document.getElementById(
    "soldPriceError"
  );

const formError =
  document.getElementById(
    "formError"
  );

const customerNameError =
  document.getElementById(
    "customerNameError"
  );

const releaseDateError =
  document.getElementById(
    "releaseDateError"
  );

const unitError =
  document.getElementById(
    "unitError"
  );

const paymentTypeError =
  document.getElementById(
    "paymentTypeError"
  );

let productsData = [];

let addonsData = [];

let originalPrice = 0;

// SETTINGS
const discountLimit = 0.03;

const commissionRate = 0.25;

// LOAD DATA
async function loadProducts() {

  const response =
    await fetch(
      `${API_URL}?type=products`
    );

  const data =
    await response.json();

  productsData =
    data.products;

  addonsData =
    data.addons;

}

// DR FORMAT
// DR-2026-5005

// DR FORMAT
// USER INPUT:
// 2026-5005

drInput.addEventListener(
  "input",
  () => {

    // REMOVE INVALID
    let value =
      drInput.value
        .replace(
          /[^0-9]/g,
          ""
        );

    // AUTO FORMAT
    if (
      value.length > 4
    ) {

      value =
        value.substring(0,4)

        +

        "-"

        +

        value.substring(4,8);

    }

    drInput.value =
      value;

    // FINAL VALUE
    const fullDR =
      "DR-" + value;

    // VALIDATION
    const regex =
      /^DR-\d{4}-\d{4}$/;

    // EMPTY
    if (!value) {

      drError.innerText =
        "";

      drInput.classList.remove(
        "input-error"
      );

      return;

    }

    // INVALID
    if (
      !regex.test(fullDR)
    ) {

      drError.innerText =
        "Format should be 2026-5005";

      drInput.classList.add(
        "input-error"
      );

    }

    // VALID
    else {

      drError.innerText =
        "";

      drInput.classList.remove(
        "input-error"
      );

    }

  }
);

document
  .getElementById(
    "customerName"
  )
  .addEventListener(
    "input",
    e => {

      if (
        e.target.value.trim()
      ) {

        customerNameError.innerText =
          "";

        e.target.classList.remove(
          "input-error"
        );

      }

    }
);

document
  .getElementById(
    "releaseDate"
  )
  .addEventListener(
    "input",
    e => {

    const today =
    new Date();

    today.setHours(
    0,0,0,0
    );

    const selected =
    new Date(
        e.target.value
    );

    if (
    selected > today
    ) {

    releaseDateError.innerText =
        "Release date cannot be future date";

    e.target.classList.add(
        "input-error"
    );

    return;

    }

      if (
        e.target.value
      ) {

        releaseDateError.innerText =
          "";

        e.target.classList.remove(
          "input-error"
        );

      }

    }
);

document
  .getElementById(
    "paymentType"
  )
  .addEventListener(
    "change",
    e => {

      if (
        e.target.value
      ) {

        paymentTypeError.innerText =
          "";

        e.target.classList.remove(
          "input-error"
        );

      }

    }
);

unitInput.addEventListener(
  "input",
  () => {

    if (
      unitInput.value.trim()
    ) {

      unitError.innerText =
        "";

      unitInput.classList.remove(
        "input-error"
      );

    }

});

soldPriceInput.addEventListener(
  "input",
  () => {

    if (
      soldPriceInput.value.trim()
    ) {

      soldPriceError.innerText =
        "";

      soldPriceInput.classList.remove(
        "input-error"
      );

    }

});

loadProducts();

// SEARCH
let productSelected =
  false;

// SEARCH
unitInput.addEventListener(
  "input",
  () => {

    // PREVENT REOPEN
    if (productSelected) {

      productSelected =
        false;

      return;

    }

    const keyword =
      unitInput.value
        .toLowerCase()
        .trim();

    // EMPTY
    if (!keyword) {

      dropdown.style.display =
        "none";

      return;

    }

    const filtered =
      productsData.filter(
        item =>

          item.product
            .toLowerCase()
            .includes(keyword)

      );

    // NO RESULTS
    if (
      filtered.length === 0
    ) {

      dropdown.style.display =
        "none";

      return;

    }

    showDropdown(filtered);

  }
);

// DROPDOWN
function showDropdown(data) {

  dropdown.innerHTML = "";

  dropdown.style.display =
    "block";

  data.forEach(item => {

    const div =
      document.createElement(
        "div"
      );

    div.classList.add(
      "dropdown-item"
    );

    div.innerText =
      item.product;

    div.addEventListener(
    "click",
    () => {

        productSelected =
        true;

        unitInput.value =
        item.product;

        dropdown.innerHTML =
        "";

        dropdown.style.display =
        "none";

        unitInput.blur();

        updatePrice();

    }
    );

    dropdown.appendChild(div);

  });

}

// SUBMIT
document
  .getElementById(
    "submitBtn"
  )
  .addEventListener(
    "click",
    submitDR
);

async function submitDR() {

    const dr =
    "DR-" +

    document
        .getElementById(
        "drNumber"
        )
        .value
        .trim();

  const customerName =
    document
      .getElementById(
        "customerName"
      )
      .value
      .trim();

  const releaseDate =
    document
      .getElementById(
        "releaseDate"
      )
      .value;

    const today =
    new Date();

    today.setHours(
    0,0,0,0
    );

    const selectedDate =
    new Date(
        releaseDate
    );

  const unit =
    unitInput.value;

  const soldPrice =
    Number(
      soldPriceInput.value
    );

  // VALIDATION
  if (

    !dr ||
    !customerName ||
    !releaseDate ||
    !unit ||
    !soldPrice

  ) {

// RESET
formError.innerText = "";

customerNameError.innerText = "";
releaseDateError.innerText = "";
unitError.innerText = "";

document
  .querySelectorAll(
    ".input-error"
  )
  .forEach(input => {

    input.classList.remove(
      "input-error"
    );

  });

let hasError = false;

// CUSTOMER NAME
if (!customerName) {

  customerNameError.innerText =
    "Customer name is required";

  document
    .getElementById(
      "customerName"
    )
    .classList.add(
      "input-error"
    );

  hasError = true;

}

// RELEASE DATE
// RELEASE DATE
if (!releaseDate) {

  releaseDateError.innerText =
    "Release date is required";

  document
    .getElementById(
      "releaseDate"
    )
    .classList.add(
      "input-error"
    );

  hasError = true;

}

// FUTURE DATE
else if (
  selectedDate > today
) {

  releaseDateError.innerText =
    "Release date cannot be future date";

  document
    .getElementById(
      "releaseDate"
    )
    .classList.add(
      "input-error"
    );

  hasError = true;

}

// UNIT
if (!unit) {

  unitError.innerText =
    "Unit is required";

  unitInput.classList.add(
    "input-error"
  );

  hasError = true;

}

// SOLD PRICE
if (!soldPrice) {

  soldPriceError.innerText =
    "Sold price is required";

  soldPriceInput.classList.add(
    "input-error"
  );

  hasError = true;

}

// INVALID DR
const drRegex =
  /^DR-\d{4}-\d{4}$/;

if (
  !drRegex.test(dr)
) {

  drError.innerText =
    "Invalid DR format";

  drInput.classList.add(
    "input-error"
  );

  hasError = true;

}

// SOLD PRICE VALIDATION
if (
  soldPriceError.innerText !== ""
) {

  hasError = true;

}

// SHOW FORM ERROR
if (hasError) {

  formError.innerText =
    "Complete all required fields";

  return;

}

    return;

  }

  // LOADER
  loadingScreen.classList.remove(
    "hidden"
  );

  try {

    // ADDONS
// GET ALL ADDONS
    const addons =
    Array.from(

        document.querySelectorAll(
        ".addon-row select"
        )

    )

    .map(select => {

        const option =
        select.options[
            select.selectedIndex
        ];

        // IGNORE DEFAULT
        if (
        option.value === "0"
        ) {

        return null;

        }

        return option.textContent
        .replace(/\(\+₱.*?\)/, "")
        .trim();

    })

    .filter(Boolean)

    .join(", ");

    // VALUES
    const selling =
      Number(
        sellingPrice.innerText
          .replace(/[₱,]/g, "")
      );

    const thresholdPrice =
      Number(
        threshold.innerText
          .replace(/[₱,]/g, "")
      );

    const gp =
      Number(
        grossProfit.innerText
          .replace(/[₱,]/g, "")
      );

    const comm =
      Number(
        commission.innerText
          .replace(/[₱,]/g, "")
      );
    
    const drRegex =
    /^DR-\d{4}-\d{4}$/;

    if (
    !drRegex.test(dr)
    ) {

    drError.innerText =
        "Invalid DR format";

    drInput.classList.add(
        "input-error"
    );

    return;

    }

    if (
    soldPriceError.innerText !== ""
    ) {

    alert(
        "Please fix sold price"
    );

    return;

    }

    const response =
    await fetch(

`${API_URL}?type=submitDR&salesAgent=${encodeURIComponent(agentName)}&dr=${encodeURIComponent(dr)}&releaseDate=${encodeURIComponent(releaseDate)}&customerName=${encodeURIComponent(customerName)}&modeOfPayment=${encodeURIComponent(
  document.getElementById(
    "paymentType"
  ).value
)}&unit=${encodeURIComponent(unit)}&addons=${encodeURIComponent(addons)}&sellingPrice=${encodeURIComponent(selling)}&soldPrice=${encodeURIComponent(soldPrice)}`

    );

    const data =
      await response.json();

    if (data.success) {

    alert(
        "DR Submitted Successfully"
    );

    window.location.href =
        "dashboard.html";

    }

    else {

    formError.innerText =
        data.error;

    loadingScreen.classList.add(
        "hidden"
    );

    }

  }

  catch(error) {

    console.error(error);

    alert(
      "Failed to submit DR"
    );

  }

  loadingScreen.classList.add(
    "hidden"
  );

}

// PRICE
function updatePrice() {

  const selected =
    productsData.find(
      item =>

        item.product ===
        unitInput.value

    );

  // NO PRODUCT
  if (!selected) {

    originalPrice = 0;

    updateAddonTotal();

    return;

  }

  const paymentType =
    document
      .getElementById(
        "paymentType"
      )
      .value;

  // SAFE NUMBER CONVERSION
  const srp =
    Number(
      selected.srp || 0
    );

  const cashPrice =
    Number(
      selected.cashPrice || 0
    );

  // CARD = SRP
  if (
    paymentType === "card"
  ) {

    originalPrice =
      srp;

  }

  // CASH / FINANCING
  else {

    originalPrice =
      cashPrice;

  }

  updateAddonTotal();

}

// ADDON
document
  .getElementById(
    "addAddonBtn"
  )
  .addEventListener(
    "click",
    addAddon
);

document
  .getElementById(
    "paymentType"
  )
  .addEventListener(
    "change",
    updatePrice
);

function addAddon() {

  const row =
    document.createElement(
      "div"
    );

  row.classList.add(
    "addon-row"
  );

  const select =
    document.createElement(
      "select"
    );

  // DEFAULT OPTION
  select.innerHTML =
    `
      <option value="0">
        Select Add-on
      </option>
    `;

  // ADD OPTIONS
  addonsData.forEach(addon => {

    select.innerHTML += `
      <option
        value="${Number(addon.amount || 0)}"
      >
        ${addon.name}
        (+₱${Number(addon.amount || 0)
          .toLocaleString()})
      </option>
    `;

  });

  // UPDATE TOTAL
  select.addEventListener(
    "change",
    () => {

      updateAddonTotal();

    }
  );

  // REMOVE BUTTON
  const remove =
    document.createElement(
      "button"
    );

  remove.innerHTML =
    `
      <span class="material-symbols-outlined">
        delete
      </span>
    `;

  remove.classList.add(
    "delete-addon-btn"
  );

  remove.addEventListener(
    "click",
    () => {

      row.remove();

      updateAddonTotal();

    }
  );

  row.appendChild(select);

  row.appendChild(remove);

  addonContainer.appendChild(
    row
  );

}

// TOTAL
function updateAddonTotal() {

  let addonTotal = 0;

  // GET ADDON VALUES
  document
    .querySelectorAll(
      ".addon-row select"
    )
    .forEach(select => {

      addonTotal +=
        Number(
          select.value || 0
        );

    });

  // COMPUTE FINAL PRICE
  const finalPrice =
    Number(originalPrice || 0)
    +
    Number(addonTotal || 0);

  // THRESHOLD
  const thresholdPrice =
    finalPrice -
    (finalPrice * discountLimit);

  // UI
  sellingPrice.innerText =
    `₱${finalPrice.toLocaleString(
      "en-US",
      {
        minimumFractionDigits:2,
        maximumFractionDigits:2
      }
    )}`;

  threshold.innerText =
    `₱${thresholdPrice.toLocaleString(
      "en-US",
      {
        minimumFractionDigits:2,
        maximumFractionDigits:2
      }
    )}`;

  // UPDATE COMMISSION
  computeCommission();

}

// COMMISSION
soldPriceInput.addEventListener(
  "input",
  computeCommission
);
function computeCommission() {

  const sold =
    Number(
      soldPriceInput.value
        .replace(/,/g,"")
    ) || 0;

  const sell =
    Number(
      sellingPrice.innerText
        .replace(/[₱,]/g, "")
    ) || 0;

  const thresholdPrice =
    Number(
      threshold.innerText
        .replace(/[₱,]/g, "")
    ) || 0;

  // RESET ERROR
  soldPriceError.innerText =
    "";

  soldPriceInput.classList.remove(
    "input-error"
  );

  // ===================================
  // VALIDATION
  // ===================================

  // ABOVE SELLING PRICE
  if (
    sold > sell
  ) {

    soldPriceError.innerText =
      "Sold price cannot exceed selling price";

    soldPriceInput.classList.add(
      "input-error"
    );

    grossProfit.innerText =
    "₱0.00";

    commission.innerText =
    "₱0.00";

    commissionRateDisplay.innerText =
    "-";

return;

    return;

  }

  // BELOW THRESHOLD
  if (
    sold < thresholdPrice
  ) {

    soldPriceError.innerText =
      "Sold price is below discount threshold";

    soldPriceInput.classList.add(
      "input-error"
    );

    grossProfit.innerText =
    "₱0.00";

    commission.innerText =
    "₱0.00";

    commissionRateDisplay.innerText =
    "-";

return;

    return;

  }

  // ===================================
  // COMMISSIONABLE
  // ===================================

  const gp =
    sold - thresholdPrice;

  // ===================================
  // COMMISSION RATE
  // ===================================

  let rate = 0.25;

  // FULL PRICE OR HIGHER
  if (
    sold >= sell
  ) {

    rate = 0.30;

  }

  // UPDATE RATE
  commissionRateDisplay.innerText =
    `${rate * 100}%`;

  // COMMISSION
  const comm =
    gp * rate;

  // UI
  grossProfit.innerText =
    `₱${gp.toLocaleString(
      "en-US",
      {
        minimumFractionDigits:2,
        maximumFractionDigits:2
      }
    )}`;

  commission.innerText =
    `₱${comm.toLocaleString(
      "en-US",
      {
        minimumFractionDigits:2,
        maximumFractionDigits:2
      }
    )}`;

}

// BACK
document
  .getElementById(
    "backBtn"
  )
  .addEventListener(
    "click",
    () => {

      window.location.href =
        "dashboard.html";

    }
);
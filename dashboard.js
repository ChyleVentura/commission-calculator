const API_URL =
  "https://script.google.com/macros/s/AKfycbwfFbB7lTOTFDaTva6OZTbj6HvOH9FQEjgr5vUYKL8PI01ePir1TE1zNZhcn_-cg8BDog/exec";

const recordsContainer =
  document.getElementById(
    "recordsContainer"
  );

const totalCommission =
  document.getElementById(
    "totalCommission"
  );

const searchInput =
  document.getElementById(
    "searchInput"
  );

const logoutBtn =
  document.getElementById(
    "logoutBtn"
  );

const loadingScreen =
  document.getElementById(
    "loadingScreen"
  );

const loadingText =
  document.getElementById(
    "loadingText"
  );

// LOGIN DATA
const agentName =
  localStorage.getItem(
    "agentName"
  );

const username =
  localStorage.getItem(
    "username"
  );

document.getElementById(
  "agentDisplay"
).innerText =
  agentName;

const pin =
  localStorage.getItem(
    "pin"
  );

const monthFilter =
  document.getElementById(
    "monthFilter"
  );

const refreshBtn =
  document.getElementById(
    "refreshBtn"
  );

// DEFAULT TO CURRENT MONTH
const currentMonth =
  new Date()
    .getMonth()
    .toString();

monthFilter.value =
  currentMonth;

// NOT LOGGED IN
if (!agentName || !username || !pin) {

  window.location.href =
    "login.html";

}

let allRecords = [];

let currentStatus =
  "all";

// LOAD DASHBOARD
async function loadDashboard() {

  // SHOW LOADER
  loadingScreen.classList.remove(
    "hidden"
  );

  loadingText.innerText =
    "Loading commissions...";

  try {

    const response =
    await fetch(

        `${API_URL}?type=dashboard&agent=${encodeURIComponent(username)}&pin=${encodeURIComponent(pin)}`

    );

    const data =
      await response.json();

    // INVALID LOGIN
    if (!data.records) {

    loadingText.innerText =
        "No records found";

    return;

    }

    allRecords =
    data.records || [];

    renderRecords(
    allRecords
    );

    // HIDE LOADER
    loadingScreen.classList.add(
      "hidden"
    );

  }

  catch(error) {

    console.error(error);

    loadingText.innerText =
      "Failed to load data";

  }

}

// RENDER RECORDS
function renderRecords(data) {

  recordsContainer.innerHTML =
    "";

  // ====================================
  // UNCLAIMED TOTAL
  // MONTH-BASED ONLY
  // ====================================

  const selectedMonth =
    monthFilter.value;

  let unclaimedTotal =
    0;

  allRecords.forEach(item => {

    const date =
      new Date(
        item.releaseDate
      );

    const matchesMonth =

      selectedMonth === ""

      ||

      date.getMonth()
        .toString() ===
      selectedMonth;

    const unpaid =

      String(item.paymentStatus)
        .trim()
        .toLowerCase() !==
      "paid";

    if (
      matchesMonth &&
      unpaid
    ) {

      unclaimedTotal +=
        Number(item.commission);

    }

  });

  // UPDATE TOTAL
  totalCommission.innerText =
    `₱${unclaimedTotal.toLocaleString(
      "en-US",
      {
        minimumFractionDigits:2,
        maximumFractionDigits:2
      }
    )}`;

  // ====================================
  // EMPTY
  // ====================================

  if (data.length === 0) {

    recordsContainer.innerHTML =
      `
        <div class="empty-card">

          No commission records found

        </div>
      `;

    return;

  }

  // ====================================
  // RENDER CARDS
  // ====================================

  data.forEach(item => {

    const formattedDate =
      new Date(
        item.releaseDate
      )
      .toLocaleDateString(
        "en-US",
        {
          month:"long",
          day:"numeric",
          year:"numeric"
        }
      );

    const paid =

      String(item.paymentStatus)
        .trim()
        .toLowerCase() ===
      "paid";

    const card =
      document.createElement(
        "div"
      );

    card.classList.add(
      "commission-card"
    );

    card.innerHTML = `

      <div class="card-header">

        <div>

          <p class="label">
            DR#
          </p>

          <h3>
            ${item.dr}
          </h3>

        </div>

        <div class="header-right">

          ${
            paid

            ?

            `<div class="paid-badge">
              PAID
            </div>`

            :

            `<div class="unpaid-badge">
              UNPAID
            </div>`

          }

          <div class="commission-badge">

            ₱${Number(item.commission)
              .toLocaleString(
                "en-US",
                {
                  minimumFractionDigits:2,
                  maximumFractionDigits:2
                }
              )}

          </div>

        </div>

      </div>

      <div class="card-body">

        <div class="info-row">

          <span class="info-label">
            Release Date
          </span>

          <span class="info-value">
            ${formattedDate}
          </span>

        </div>

        <div class="info-row">

          <span class="info-label">
            Unit
          </span>

          <span class="info-value">
            ${item.unit}
          </span>

        </div>

      </div>

    `;

    recordsContainer.appendChild(
      card
    );

  });

}

function applyFilters() {

  const keyword =
    searchInput.value
      .trim()
      .toLowerCase();

  const selectedMonth =
    monthFilter.value;

  let filtered =
    [...allRecords];

  // SEARCH
  if (keyword) {

    filtered =
      filtered.filter(item =>

        String(item.dr)
          .toLowerCase()
          .includes(keyword)

        ||

        String(item.unit)
          .toLowerCase()
          .includes(keyword)

      );

  }

  // MONTH
  if (selectedMonth !== "") {

    filtered =
      filtered.filter(item => {

        const date =
          new Date(
            item.releaseDate
          );

        return (

          date.getMonth()
            .toString() ===

          selectedMonth

        );

      });

  }

  // STATUS
if (currentStatus === "paid") {

  filtered =
    filtered.filter(item =>

      String(item.paymentStatus)
        .trim()
        .toLowerCase() ===
      "paid"

    );

}

else if (
  currentStatus === "unpaid"
) {

  filtered =
    filtered.filter(item =>

      String(item.paymentStatus)
        .trim()
        .toLowerCase() !==
      "paid"

    );

}

  renderRecords(filtered);

}

// SEARCH
searchInput.addEventListener(
  "input",
  applyFilters
);

document
  .querySelectorAll(
    ".filter-btn"
  )
  .forEach(btn => {

    btn.addEventListener(
      "click",
      () => {

        // REMOVE ACTIVE
        document
          .querySelectorAll(
            ".filter-btn"
          )
          .forEach(b =>

            b.classList.remove(
              "active"
            )

          );

        // ACTIVE BUTTON
        btn.classList.add(
          "active"
        );

        // SAVE STATUS
        currentStatus =
          btn.dataset.status;

        // APPLY FILTERS
        applyFilters();

      }
    );

});

refreshBtn.addEventListener(
  "click",
  async () => {

    // SPIN EFFECT
    refreshBtn.style.transform =
      "rotate(360deg)";

    refreshBtn.style.transition =
      "0.5s";

    // RELOAD DATA
    await loadDashboard();

    // RESET
    setTimeout(() => {

      refreshBtn.style.transform =
        "rotate(0deg)";

    }, 500);

  }
);

// LOGOUT
logoutBtn.addEventListener(
  "click",
  () => {

    localStorage.clear();

    window.location.href =
      "login.html";

});

monthFilter.addEventListener(
  "change",
  applyFilters
);

// LOAD
loadDashboard();
const API_URL =
  "https://script.google.com/macros/s/AKfycbwfFbB7lTOTFDaTva6OZTbj6HvOH9FQEjgr5vUYKL8PI01ePir1TE1zNZhcn_-cg8BDog/exec";

const loginBtn =
  document.getElementById(
    "loginBtn"
  );

const agentInput =
  document.getElementById(
    "agentName"
  );

const pinInput =
  document.getElementById(
    "pin"
  );

const loginError =
  document.getElementById(
    "loginError"
  );

const loadingScreen =
  document.getElementById(
    "loadingScreen"
  );

const loadingText =
  document.getElementById(
    "loadingText"
  );

// LOGIN
loginBtn.addEventListener(
  "click",
  async () => {

    const agent =
      agentInput.value
        .trim();

    const pin =
      pinInput.value
        .trim();

    // EMPTY CHECK
    if (!agent || !pin) {

      loginError.innerText =
        "Enter username and PIN";

      return;

    }

    // CLEAR ERROR
    loginError.innerText =
      "";

    // SHOW LOADER
    loadingScreen.classList.remove(
      "hidden"
    );

    loadingText.innerText =
      "Logging in...";

    try {

      const response =
        await fetch(

          `${API_URL}?type=dashboard&agent=${encodeURIComponent(agent)}&pin=${encodeURIComponent(pin)}`

        );

      const data =
        await response.json();

      // INVALID LOGIN
      if (data.error) {

        loadingScreen.classList.add(
          "hidden"
        );

        loginError.innerText =
          data.error;

        return;

      }

      // SAVE LOGIN
        localStorage.setItem(
        "agentName",
        data.agentName
        );

        localStorage.setItem(
        "username",
        agent
        );

      localStorage.setItem(
        "pin",
        pin
      );

      // REDIRECT
      window.location.href =
        "dashboard.html";

    }

    catch(error) {

      console.error(error);

      loadingScreen.classList.add(
        "hidden"
      );

      loginError.innerText =
        "Connection failed";

    }

});
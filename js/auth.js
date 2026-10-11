
const SECRET_PASSWORD = "Lovey";
const ACCESS_KEY = "flowerGardenUnlocked";

const currentPage = window.location.pathname;
const isLoginPage =
  currentPage.endsWith("/") ||
  currentPage.endsWith("/index.html") ||
  currentPage === "index.html";

// Protect all pages except the login page.
if (
  !isLoginPage &&
  sessionStorage.getItem(ACCESS_KEY) !== "true"
) {
  window.location.replace("index.html");
}

// Handle the password form.
const passwordForm = document.getElementById("passwordForm");

if (passwordForm) {
  // If already unlocked in this tab, go to the homepage.
  if (sessionStorage.getItem(ACCESS_KEY) === "true") {
    window.location.replace("home.html");
  }

  const passwordInput = document.getElementById("passwordInput");
  const passwordError = document.getElementById("passwordError");
  const togglePassword = document.getElementById("togglePassword");

  // Normalize capitalization before comparing passwords.
  const normalizeTitleCase = (text) =>
    text
      .trim()
      .toLowerCase()
      .replace(/\b\p{L}/gu, (letter) => letter.toUpperCase());

  passwordForm.addEventListener("submit", function (event) {
    event.preventDefault();

    if (
      normalizeTitleCase(passwordInput.value) ===
      normalizeTitleCase(SECRET_PASSWORD)
    ) {
      sessionStorage.setItem(ACCESS_KEY, "true");
      window.location.href = "home.html";
    } else {
      passwordError.textContent =
        "Not quite! Try again, sweetheart. ♡";

      passwordInput.value = "";
      passwordInput.focus();
    }
  });

  // Show or hide the password.
  if (togglePassword) {
    togglePassword.addEventListener("click", function () {
      const isHidden = passwordInput.type === "password";

      passwordInput.type = isHidden ? "text" : "password";
      togglePassword.textContent = isHidden ? "Hide" : "Show";

      togglePassword.setAttribute(
        "aria-label",
        isHidden ? "Hide password" : "Show password"
      );
    });
  }
}

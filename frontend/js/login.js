const loginForm = document.querySelector("#loginForm");
const feedback = document.querySelector("#loginFeedback");

if (localStorage.getItem("gamestock_user")) {
  window.location.href = "index.html";
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.querySelector("#email").value.trim();
  const password = document.querySelector("#password").value.trim();

  feedback.textContent = "Validating access...";
  feedback.classList.remove("error");

  try {
    const data = await api.login(email, password);

    localStorage.setItem("gamestock_user", JSON.stringify(data.user));
    window.location.href = "index.html";
  } catch (error) {
    feedback.textContent = error.message || "Invalid email or password.";
    feedback.classList.add("error");
  }
});

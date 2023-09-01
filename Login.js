document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");

  const spinner = document.getElementById("spinner");

  spinner.style.display = "none";

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;

    spinner.style.display = "inline-block";

    try {
      const response = await fetch(
        "https://backend.pluralcode.institute/student/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            password: password,
          }),
          redirect: "follow",
        }
      );

      const data = await response.json();

      if (response.ok && data.message === "Login Successful Done") {
        // Storing userToken in a cookie with "SameSite" attribute
        const expirationDate = new Date();
        expirationDate.setFullYear(expirationDate.getFullYear() + 1);
        document.cookie = `userToken=${
          data.token
        }; expires=${expirationDate.toUTCString()}; path=/; SameSite=Lax`;

        // Storing userData in localStorage
        localStorage.setItem("userData", JSON.stringify(data.user));

        window.location.href = "dashboard.html";
      } else {
        spinner.style.display = "none";

        alert("Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.log("error", error);
      spinner.style.display = "none";

      alert("An error occurred while trying to log in.");
    }
  });

  // Check for user token on page load
  const userToken = getCookie("userToken");
  if (userToken) {
    window.location.href = "dashboard.html"; // Redirect to dashboard if user token exists
  }
});

// Function to get the value of a specific cookie
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

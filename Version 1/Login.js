// Stop right clicks
document.addEventListener("contextmenu", function (e) {
  e.preventDefault();
});

document.addEventListener("DOMContentLoaded", function () {
  // Get references to the password input and show/hide icons
  const passwordInput = document.getElementById("password");
  const showPasswordIcon = document.getElementById("show_password");
  const hidePasswordIcon = document.getElementById("hide_password");

  // Function to toggle password visibility
  function togglePasswordVisibility() {
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      showPasswordIcon.style.display = "none";
      hidePasswordIcon.style.display = "inline-block";
    } else {
      passwordInput.type = "password";
      hidePasswordIcon.style.display = "none";
      showPasswordIcon.style.display = "inline-block";
    }
  }

  // Set the initial display property of the icons
  showPasswordIcon.style.display = "inline-block";
  hidePasswordIcon.style.display = "none";

  // Add a click event listener to the showPasswordIcon
  showPasswordIcon.addEventListener("click", togglePasswordVisibility);

  // Add a click event listener to the hidePasswordIcon
  hidePasswordIcon.addEventListener("click", togglePasswordVisibility);

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
        localStorage.setItem("userTokenLogin", JSON.stringify(data.token));

        window.location.href = "dashboard.html";
      } else {
        spinner.style.display = "none";

        const alert = document.getElementById("alert");

        alert.style.display = "block";
        alert.innerText = data.message;
      }
    } catch (error) {
      console.log("error", error);
      spinner.style.display = "none";

      const alert = document.getElementById("alert");

      alert.style.display = "block";
      alert.innerText = "Login Failed!!!, Check Your Internet Connectivity";
    }
  });
});

// Function to get the value of a specific cookie
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

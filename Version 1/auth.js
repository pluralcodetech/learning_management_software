document.addEventListener("contextmenu", function (e) {
  e.preventDefault();
});

document.addEventListener("DOMContentLoaded", () => {
  const emailInput = document.getElementById("emailInput");
  const verificationButton = document.querySelector("button");

  verificationButton.addEventListener("click", async (event) => {
    event.preventDefault();

    const originalButtonText = verificationButton.textContent; // Store the original button text
    verificationButton.textContent = "Sending..."; // Change the button text to "Sending"

    const userEmail = emailInput.value.trim(); // Get the user's email from the input
    if (!userEmail) {
      alert("Please enter your email.");
      verificationButton.textContent = originalButtonText; // Revert button text on error
      return;
    }

    const apiUrl = `https://backend.pluralcode.institute/student/otp?email=${userEmail}`;
    const requestOptions = {
      method: "GET",
      redirect: "follow",
    };

    try {
      const response = await fetch(apiUrl, requestOptions);
      const result = await response.json(); // Parse response as JSON

      if (response.ok) {
        console.log("API Response:", result);
        alert("Verification code sent to your email.");

        // Save the hashnode in sessionStorage
        localStorage.setItem("hashnode", result.encrypted_data);

        // After getting the user's email from the form
        localStorage.setItem("userEmail", userEmail);

        // Redirect to the OTP input page
        window.location.href = "./email_code.html";
      } else {
        console.error("API Error:", result.message);
        alert("An error occurred while sending the verification code.");
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      alert("An error occurred while sending the verification code.");
    }
  });
});

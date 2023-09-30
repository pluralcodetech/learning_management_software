// Stop right clicks
document.addEventListener("contextmenu", function (e) {
  e.preventDefault();
});

document.addEventListener("DOMContentLoaded", () => {
  const codeInputs = document.querySelectorAll(".code-input");
  const verifyButton = document.getElementById("verifyButton");
  const resendButton = document.getElementById("resendButton");
  const countdownSpan = document.getElementById("countdownSpan"); // Update the ID here
  const userEmailSpan = document.getElementById("userEmail");

  const userEmail = localStorage.getItem("userEmail");
  const hashnode = localStorage.getItem("hashnode"); // Retrieve saved hashnode

  if (userEmail) {
    userEmailSpan.textContent = userEmail;
  } else {
    alert("User email not found. Please start from the beginning.");
    window.location.href = "./edit_password_change.html";
  }

  let countdown = 300; // 5 minutes in seconds
  let countdownInterval; // Declare the countdown interval variable

  // Function to update the countdown span
  const updateCountdown = () => {
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;
    countdownSpan.textContent = `${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Function to start the countdown
  const startCountdown = () => {
    countdownInterval = setInterval(() => {
      if (countdown > 0) {
        countdown--;
      } else {
        clearInterval(countdownInterval);
        countdownSpan.textContent = "00:00";
        resendButton.classList.remove("disabled"); // Enable the resend button
      }
      updateCountdown(); // Call the function to update the countdown span
    }, 1000);
  };

  // Start the countdown as soon as the page loads
  updateCountdown(); // Call it once to initialize the span
  startCountdown();

  const moveToNextInput = (currentInput) => {
    const currentIndex = Array.from(codeInputs).indexOf(currentInput);
    if (currentIndex >= 0 && currentIndex < codeInputs.length - 1) {
      codeInputs[currentIndex + 1].focus();
    }
  };

  codeInputs.forEach((input, index) => {
    input.addEventListener("input", () => {
      if (input.value.length === 1) {
        moveToNextInput(input);
      }
    });
  });

  verifyButton.addEventListener("click", async (event) => {
    event.preventDefault();

    const enteredOTP = Array.from(codeInputs)
      .map((input) => input.value)
      .join("");

    const apiUrl = `https://backend.pluralcode.institute/student/otp?otp=${enteredOTP}&hashcode=${hashnode}&email=${userEmail}&type=validate`;
    const requestOptions = {
      method: "GET",
      redirect: "follow",
    };

    try {
      const response = await fetch(apiUrl, requestOptions);
      const result = await response.json();

      if (response.ok) {
        console.log("API Response:", result);
        alert(
          "OTP verification successful. Redirecting to password reset page..."
        );

        // Save the entered OTP in local storage
        localStorage.setItem("userOTP", enteredOTP);

        window.location.href = "./edit_password_change.html";
      } else {
        console.error("API Error:", result.message);
        alert("OTP verification failed. Please check the code and try again.");
        updateInputBorders(false); // Update OTP input borders to red
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      alert("An error occurred while verifying the OTP.");
    }
  });

  // Event listener for the resend button
  resendButton.addEventListener("click", async (event) => {
    event.preventDefault();

    console.log("clicked");

    if (!resendButton.classList.contains("disabled")) {
      resendButton.classList.add("disabled"); // Prevent multiple clicks

      const apiUrl = `https://backend.pluralcode.institute/student/otp?email=${userEmail}`;
      const requestOptions = {
        method: "GET",
        redirect: "follow",
      };

      try {
        const response = await fetch(apiUrl, requestOptions);
        const result = await response.json();

        if (response.ok) {
          console.log("API Response:", result);
          alert("New verification code sent to your email.");

          // Save the new hashnode in sessionStorage
          sessionStorage.setItem("hashnode", result.encrypted_data);

          // Reset the countdown and start it again
          countdown = 300;
          updateCountdown();
          startCountdown();

          // Update OTP input borders back to normal
          updateInputBorders(true);
        } else {
          console.error("API Error:", result.message);
          alert("An error occurred while sending the new verification code.");
        }
      } catch (error) {
        console.error("Fetch Error:", error);
        alert("An error occurred while sending the new verification code.");
      }
    }
  });

  // Function to update OTP input field borders
  const updateInputBorders = (isValid) => {
    codeInputs.forEach((input) => {
      input.style.borderColor = isValid ? "" : "red";
    });
  };
});

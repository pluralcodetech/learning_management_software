// Stop right clicks
document.addEventListener("contextmenu", function (e) {
  e.preventDefault();
});

document.addEventListener("DOMContentLoaded", () => {
  const newPasswordInput = document.querySelector('input[name="password"]');
  const confirmPasswordInput = document.querySelector(
    'input[name="confirm_password"]'
  );
  const resetPasswordButton = document.querySelector("button");

  resetPasswordButton.addEventListener("click", async (event) => {
    event.preventDefault();

    const newPassword = newPasswordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    if (!newPassword || !confirmPassword) {
      console.log("Missing password fields.");
      alert("Please fill in both password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match. Please enter matching passwords.");
      return;
    }

    const userEmail = localStorage.getItem("userEmail");
    const hashnode = localStorage.getItem("hashnode");
    const storedOTP = localStorage.getItem("userOTP");

    console.log("userEmail:", userEmail);
    console.log("hashnode:", hashnode);
    console.log("storedOTP:", storedOTP);

    if (!userEmail || !hashnode || !storedOTP) {
      console.log("Missing required information.");
      alert("Missing required information. Please start the process again.");
      setTimeout(() => {
        window.location.href = "./email_password_reset.html"; // Redirect to starting page
      }, 3000); // Wait for 5 seconds
      return;
    }

    const apiUrl =
      "https://backend.pluralcode.institute/student/forgot-password";
    const requestBody = JSON.stringify({
      newpassword: newPassword,
      confirmpassword: confirmPassword,
      email: userEmail,
      otp: storedOTP,
      hashcode: hashnode,
    });

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: requestBody,
      redirect: "follow",
    };

    try {
      const response = await fetch(apiUrl, requestOptions);
      const result = await response.text();

      if (response.ok) {
        console.log("Password reset successful:", result);
        alert(
          "Password reset successful! You can now log in with your new password."
        );
        localStorage.removeItem("userEmail");
        localStorage.removeItem("hashnode");
        localStorage.removeItem("otp");
        window.location.href = "./index.html"; // Redirect to login page
      } else {
        console.error("Password reset error:", result);
        alert(
          "An error occurred while resetting your password. Please try again."
        );
        console.log("Response message:", response.message);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      alert(
        "An error occurred while resetting your password. Please try again."
      );
    }
  });
});

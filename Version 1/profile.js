// Stop right clicks
document.addEventListener("contextmenu", function (e) {
  e.preventDefault();
});

// LOGOUT FUNCTIONALITY

function logoutUser() {
  // Clear cookies (if used)
  clearCookie("userData");
  clearCookie("userToken");
  clearCookie("studyMaterialsData");
  clearCookie("studyMaterialsByModule");

  sessionStorage.removeItem("userData");
  sessionStorage.removeItem("userToken");

  // Redirect to the login page
  window.location.href = "./index.html"; // Replace with the actual URL of your login page
}

// Clear a specific cookie by setting its expiration in the past
function clearCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=None“`;
}

// MAIN JS CODE
// Function to retrieve data from local storage and update the profile
function updateProfileFromLocalStorage() {
  // Retrieve userData and userToken from local storage
  const userData = JSON.parse(localStorage.getItem("userData"));
  const userToken = localStorage.getItem("userTokenLogin");
  console.log("User Data", userData);
  console.log("User Token", userToken);

  // Check if userData and userToken exist in local storage
  if (userData && userToken) {
    // Update profile information in the HTML
    const fullNameInput = document.querySelector('input[name="full-name"]');
    const studentIdInput = document.querySelector('input[name="student-id"]');
    const phoneNumberInput = document.querySelector(
      'input[name="phone-number"]'
    );
    const emailInput = document.querySelector('input[name="email"]');
    const stateInput = document.querySelector('input[name="state"]');
    const refname1 = document.querySelector('input[name="refname1"]');
    const refname2 = document.querySelector('input[name="refname2"]');
    const refphone1 = document.querySelector('input[name="refphone1"]');
    const refphone2 = document.querySelector('input[name="refphone2"]');
    const id_type = document.getElementById("id_type");
    const initials = document.querySelector(".initials span");
    const user_name = document.querySelector(".user_name");
    const student_id = document.querySelector(".student_id");

    // Update the input fields with the retrieved data
    fullNameInput.value = userData.name;
    const mainStudentId = localStorage.getItem("mainStudentId");
    studentIdInput.value = mainStudentId;
    phoneNumberInput.value = userData.phone_number;
    emailInput.value = userData.email;
    stateInput.value = userData.state;
    // Assuming userData.name contains the user's full name
    const fullName = userData.name;

    // Extract the first letter of the first name
    const firstLetter = fullName.charAt(0);

    // Set the initials text content
    initials.textContent = firstLetter;

    user_name.textContent = userData.name;
    student_id.textContent = `Student ID: ${mainStudentId}`;

    // Assuming userData.refname1 and userData.refname2 contain reference names
    refname1.value = userData.refname1
      ? userData.refname1.charAt(0).toUpperCase() + userData.refname1.slice(1)
      : "";
    refname2.value = userData.refname2
      ? userData.refname2.charAt(0).toUpperCase() + userData.refname2.slice(1)
      : "";
    id_type.value = userData.idname;
    refphone1.value = userData.refphone1;
    refphone2.value = userData.refphone2;
  }
}

// Call the function when the page loads
window.addEventListener("load", updateProfileFromLocalStorage);

// Get references to the button and the modal
const edit_password_button = document.getElementById("edit_password_button");
const passwordModal = document.getElementById("password-modal");
const modalOverlay = document.getElementById("modal-overlay");

passwordModal.style.display = "none";

// Function to show the modal and overlay
function showModal() {
  passwordModal.style.display = "block";
  modalOverlay.style.display = "block";
  document.body.classList.add("modal-open"); // Add this line
}

// Function to hide the modal and overlay
function hideModal() {
  passwordModal.style.display = "none";
  modalOverlay.style.display = "none";
  document.body.classList.remove("modal-open"); // Add this line
}

// Event listener to show the modal when the button is clicked
edit_password_button.addEventListener("click", showModal);

// Event listener to hide the modal when the "Cancel" button is clicked
const cancelButton = document.getElementById("cancel-button");
cancelButton.addEventListener("click", hideModal);

// Get references to the password input and show/hide icons
const passwordInput = document.getElementById("old-password");
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

// Set active navigation item
const currentPage = window.location.pathname.split("/").pop();
setActiveNavItem(currentPage);
setupNavItemClick();
// set active dashboard navigation
function setActiveNavItem(currentPage) {
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach((navItem) => {
    const href = navItem
      .querySelector("a")
      .getAttribute("href")
      .split("/")
      .pop();
    navItem.classList.toggle("active", currentPage === href);
  });
}
function setupNavItemClick() {
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach((navItem, index) => {
    navItem.addEventListener("click", () => {
      navItems.forEach((item) => item.classList.remove("active"));
      navItem.classList.add("active");
      localStorage.setItem("lastClickedItemIndex", index);
    });
  });
}

// Get a reference to the "Save" button element
const saveButton = document.getElementById("update-button");

// Get the values of the old, new, and confirm passwords from the form
const oldPasswordInput = document.getElementById("old-password");
const newPasswordInput = document.getElementById("new-password");
const confirmPasswordInput = document.getElementById("confirm-password");
const spinner = document.getElementById("spinner");
spinner.style.display = "none";

// Add a click event listener to the "Save" button
saveButton.addEventListener("click", function (e) {
  e.preventDefault();
  // Get the user token from local storage
  const userToken = localStorage.getItem("userTokenLogin");
  const userTokenGood = JSON.parse(userToken);

  // Get the values of the old, new, and confirm passwords from the form
  const oldPassword = oldPasswordInput.value;
  const newPassword = newPasswordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  if (
    newPassword !== confirmPassword ||
    (newPassword === "" && confirmPassword === "")
  ) {
    // Apply the border style to the input fields
    newPasswordInput.style.border = "1px solid red";
    confirmPasswordInput.style.border = "1px solid red";
  } else {
    // Remove the border style if passwords match
    newPasswordInput.style.border = "";
    confirmPasswordInput.style.border = "";
    // Create an object to hold the data you want to send to the API
    const data = {
      oldpassword: oldPassword,
      newpassword: newPassword,
      confirmpassword: confirmPassword,
    };

    // Replace 'YOUR_API_URL' with the actual URL of your API endpoint
    const apiUrl =
      "https://backend.pluralcode.institute/student/update-password";

    // Send a POST request to your API using fetch
    fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userTokenGood}`, // Include the user token in the headers
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === "updated successfully") {
          spinner.style.display = "none";

          // Handle a successful API response here
          console.log("Password updated successfully");
          passwordModal.innerHTML = "Password Updated Successfully";
          setTimeout(() => {
            hideModal()
          }, 3000);
        } else {
          // Handle API errors here
          passwordModal.innerHTML =
            "Failed to update password, contact your student advisor";
          setTimeout(() => {
            hideModal()
          }, 3000);
          console.error("Failed to update password");
        }
      })
      .catch((error) => {
        passwordModal.innerHTML =
          "Network error, check your internet connectivity";
        setTimeout(() => {
          hideModal()
        }, 3000);
        // Handle network errors here
        console.error("Network error:", error);
      });
  }
});

// Get a reference to the "Save" button element
const saveRefButton = document.getElementById("save_btn");

// Add a click event listener to the "Save" button
saveRefButton.addEventListener("click", function () {
  // Get the user token from local storage
  const userToken = localStorage.getItem("userTokenLogin");
  const userTokenGood = JSON.parse(userToken);

  // Get the values of reference information and ID information from the form
  const refname1 = document.querySelector('input[name="refname1"]').value;
  const refphone1 = document.querySelector('input[name="refphone1"]').value;
  const refname2 = document.querySelector('input[name="refname2"]').value;
  const refphone2 = document.querySelector('input[name="refphone2"]').value;
  const idType = document.getElementById("id_type").value;

  // Create a FormData object to send the data as a multipart form
  const formData = new FormData();
  formData.append("refname1", refname1);
  formData.append("refphone1", refphone1);
  formData.append("refname2", refname2);
  formData.append("refphone2", refphone2);
  formData.append("idname", idType);

  // Get the selected file from the file input
  const idImageInput = document.getElementById("id_image");
  const idImageFile = idImageInput.files[0];
  formData.append("image", idImageFile);

  // Replace 'YOUR_API_URL' with the actual URL of your API endpoint
  const apiUrl =
    "https://backend.pluralcode.institute/student/upload-reference-details";

  // Send a PUT request to your API using fetch
  fetch(apiUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${userTokenGood}`,
    },
    body: formData, // Send the FormData object containing the data
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message === "updated successfully") {
        passwordModal.style.display = "block";
        modalOverlay.style.display = "block";
        passwordModal.innerHTML = "Reference Details Updated Successfully";
        setTimeout(() => {
          passwordModal.style.display = "none";
          modalOverlay.style.display = "none";
        }, 3000);
        // Handle a successful API response here
        console.log("Reference details updated successfully");
      } else {
        // Handle API errors here
        console.error("Failed to update reference details");
        passwordModal.style.display = "block";
        modalOverlay.style.display = "block";
        passwordModal.innerHTML = `${data.message}`;
        setTimeout(() => {
          passwordModal.style.display = "none";
          modalOverlay.style.display = "none";
        }, 3000);
      }
    })
    .catch((error) => {
      passwordModal.style.display = "block";
      modalOverlay.style.display = "block";
      passwordModal.innerHTML = "Reference Details Updated Successfully";
      setTimeout(() => {
        passwordModal.style.display = "none";
        modalOverlay.style.display = "none";
      }, 3000);
      // Handle network errors here
      console.error("Network error:", error);
    });
});

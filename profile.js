document.addEventListener("DOMContentLoaded", async () => {
  const apiData = getCookieValue("apiData");
  const userToken = getCookieValue("userToken");
  console.log(apiData);

  if (!apiData || !userToken) {
    console.error("API data or user token not found in cookies.");
    return;
  }

  const userData = JSON.parse(apiData); // Assuming apiData contains the user data

  const navItems = document.querySelectorAll(".nav-item");

  function setActiveNavItem() {
    const currentPage = window.location.pathname.split("/").pop();
    navItems.forEach((navItem) => {
      const href = navItem
        .querySelector("a")
        .getAttribute("href")
        .split("/")
        .pop();
      if (currentPage === href) {
        navItem.classList.add("active");
      } else {
        navItem.classList.remove("active");
      }
    });
  }

  setActiveNavItem();

  navItems.forEach((navItem) => {
    navItem.addEventListener("click", () => {
      navItems.forEach((item) => item.classList.remove("active"));
      navItem.classList.add("active");
      localStorage.setItem("lastClickedItemIndex", index);
    });
  });

  const userNameInitials = document.querySelector(".initials span");
  const userNameElement = document.querySelector(".user_name");
  const studentIdElement = document.querySelector(".student_id");
  const fullNameInput = document.querySelector('input[name="full-name"]');
  const studentIdInput = document.querySelector('input[name="student-id"]');
  const phoneNumberInput = document.querySelector('input[name="phone-number"]');
  const emailInput = document.querySelector('input[name="email"]');
  const state = document.querySelector("input[name='state']");
  const password = document.querySelector("input[name='password']");
  const idTypeSelect = document.querySelector('select[name="id-type"]');
  const refname1 = document.querySelector("input[name='refname1']");
  const refname2 = document.querySelector("input[name='refname2']");
  const refphone1 = document.querySelector("input[name='refphone1']");
  const refphone2 = document.querySelector("input[name='refphone2']");

  try {
    if (userData.user) {
      userNameInitials.textContent = userData.user.name.charAt(0);
      userNameElement.textContent = userData.user.name;
      studentIdElement.textContent = `Student ID: ${userData.user.id}`;
      fullNameInput.value = userData.user.name || "";
      studentIdInput.value = userData.user.id || "";
      phoneNumberInput.value = userData.user.phone_number || "";
      emailInput.value = userData.user.email || "";
      state.value = userData.user.state || "";
      refname1.value = userData.user.refname1 || "";
      refname2.value = userData.user.refname2 || "";
      refphone1.value = userData.user.refphone1 || "";
      refphone2.value = userData.user.refphone2 || "";
      password.value = userData.user.password || "";

      // For the ID type select, loop through options and select the matching one
      const idTypeOptions = idTypeSelect.options;
      for (let i = 0; i < idTypeOptions.length; i++) {
        if (idTypeOptions[i].value === userData.user.idname) {
          idTypeOptions[i].selected = true;
          break;
        }
      }

      const saveButton = document.getElementById("save_btn");
      const responseModal = document.getElementById("response-modal");
      const modalMessage = document.getElementById("modal-message");

      saveButton.textContent = "Save";

      saveButton.addEventListener("click", async (e) => {
        e.preventDefault();

        console.log("clicked");
        saveButton.textContent = "Updating..."; // Set button text back to "Save"

        const formData = new FormData();
        formData.append("refname1", refname1.value);
        formData.append("refphone1", refphone1.value);
        formData.append("refname2", refname2.value);
        formData.append("refphone2", refphone2.value);
        formData.append("idname", idTypeSelect.value);

        // Add the image field
        const imageInput = document.querySelector('input[name="upload_file"]');
        if (imageInput.files.length > 0) {
          formData.append(
            "image",
            imageInput.files[0],
            imageInput.files[0].name
          );
        }

        try {
          // Get the access token from userData
          const accessToken = userToken;

          // Set up the headers with the authorization token
          const headers = new Headers();
          headers.append("Authorization", `Bearer ${accessToken}`);
          const response = await fetch(
            "https://backend.pluralcode.institute/student/upload-reference-details",
            {
              method: "PUT",
              body: formData,
              headers: headers, // Include the authorization header
              redirect: "follow",
            }
          );

          if (response.ok) {
            const result = await response.json();
            console.log("API Response:", result);
            showModal("Update Successful: " + result.message);
          } else {
            console.error("API Error:", response.status);
            showModal("Update Failed");
          }
        } catch (error) {
          console.error("API Error:", error);
          showModal("Update Failed");
        } finally {
          saveButton.textContent = "Save"; // Set button text back to "Save" after the update process
        }
      });

      // Add this block for password update functionality
      const editPasswordButton = document.getElementById(
        "edit-password-button"
      );
      const passwordModal = document.getElementById("password-modal");
      // const closeButton = document.querySelector("#password-modal .close");
      const updateButton = document.getElementById("update-button");
      const oldPasswordInput = document.getElementById("old-password");
      const newPasswordInput = document.getElementById("new-password");
      const confirmPasswordInput = document.getElementById("confirm-password");

      editPasswordButton.addEventListener("click", (e) => {
        e.preventDefault();
        passwordModal.style.display = "block";
      });

      // closeButton.addEventListener("click", () => {
      //   passwordModal.style.display = "none";
      // });

      updateButton.addEventListener("click", async (e) => {
        e.preventDefault();
        const oldPassword = oldPasswordInput.value;
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (newPassword !== confirmPassword) {
          showModal("Passwords do not match");
          return;
        }

        const accessToken = userToken;
        const headers = new Headers();
        headers.append("Content-Type", "application/json");
        headers.append("Authorization", `Bearer ${accessToken}`);

        const raw = JSON.stringify({
          oldpassword: oldPassword,
          newpassword: newPassword,
          confirmpassword: confirmPassword,
        });

        const requestOptions = {
          method: "POST",
          headers: headers,
          body: raw,
          redirect: "follow",
        };

        try {
          const response = await fetch(
            "https://backend.pluralcode.institute/student/update-password",
            requestOptions
          );

          if (response.ok) {
            const result = await response.json();
            console.log("API Response:", result);
            showModal("Password Updated Successfully");
          } else {
            console.error("API Error:", response.status);
            showModal("Password Update Failed");
          }
        } catch (error) {
          console.error("API Error:", error);
          showModal("Password Update Failed");
        } finally {
          passwordModal.style.display = "none";
        }
      });
      // Function to show modal
      function showModal(message) {
        modalMessage.textContent = message;
        responseModal.style.display = "block";
        setTimeout(() => {
          closeModal();
        }, 5000); // Close modal after 5 seconds
      }

      // Function to close modal
      function closeModal() {
        responseModal.style.display = "none";
      }
    }
  } catch (error) {
    console.error(error);
  }
});
function getCookieValue(cookieName) {
  const cookies = document.cookie.split("; ");
  for (const cookie of cookies) {
    const [name, value] = cookie.split("=");
    if (name === cookieName) {
      return value;
    }
  }
  return null;
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}
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
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}
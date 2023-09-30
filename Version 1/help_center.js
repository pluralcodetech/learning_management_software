// Stop right clicks
document.addEventListener("contextmenu", function (e) {
  e.preventDefault();
});

document.addEventListener("DOMContentLoaded", async () => {
  const logoutButton = document.getElementById("logout_button"); // Replace with the actual ID of your logout button/link
  const loader = document.getElementById("loader"); // Get the loader element

  // function to call logout helper function
  logoutButton.addEventListener("click", () => {
    logoutUser();
  });

  // Function to show/hide the loader
  const showLoader = (visible) => {
    loader.style.display = visible ? "flex" : "none";
  };

  // Function to hide the loader after a delay
  const hideLoaderWithDelay = () => {
    showLoader(false);
  };

  try {
    const profileNameElement = document.querySelector(".user_name");
    const studentIdElement = document.querySelector(".student_id");
    const initialsElement = document.querySelector(".initials span"); // Assuming there's an element with class "initials"

    const makeAPICall = async () => {
      showLoader(true); // Show the loader before making the API call

      console.log("API recalled");

      // Retrieve userToken from cookies
      const userToken = getCookie("userToken");

      // Retrieve userData from local storage
      const userData = localStorage.getItem("userData");
      const userDataString = JSON.parse(userData);

      if (userDataString && userToken) {
        const requestOptions = {
          method: "GET",
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
          redirect: "follow",
        };

        const response = await fetch(
          "https://backend.pluralcode.institute/student/dashboard-api",
          requestOptions
        );
        const result = await response.json();
        console.log("API Result:", result);

        // Hide the loader when the API call is successful
        hideLoaderWithDelay(); // Hide the loader after a delay

        // Set active navigation item
        const currentPage = window.location.pathname.split("/").pop();
        setActiveNavItem(currentPage);
        setupNavItemClick();

        // Update profile name
        profileNameElement.textContent = result.user.name;

        const mainStudentId = result.user.student_id_number;

        localStorage.setItem("mainStudentId", mainStudentId);

        // Update student ID
        studentIdElement.textContent = `Student ID: ${mainStudentId}`;

        // Update initials
        if (result.user.name) {
          const initials = result.user.name.charAt(0).toUpperCase();
          initialsElement.textContent = initials;
        }
      } else {
        console.log("User data or token not found in session storage.");
        // Hide the loader when the API call is successful
        hideLoaderWithDelay(); // Hide the loader after a delay
      }
    };

    makeAPICall();

    // Set an interval to refresh the API call every 1 hour (60 minutes)
    setInterval(() => {
      makeAPICall();
      // Refresh the page
      window.location.reload();
    }, 60 * 60 * 1000);
  } catch (error) {
    console.error("An error occurred:", error);
  }
});

// function to get cookie from the cookie storage
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

// fucntion to logout user
function logoutUser() {
  // Clear cookies (if used)
  clearCookie("userData");
  clearCookie("userToken");
  clearCookie("studyMaterialsData");
  clearCookie("studyMaterialsByModule");
  clearCookie("apiData");

  sessionStorage.removeItem("userData");
  sessionStorage.removeItem("userToken");

  // Redirect to the login page
  window.location.href = "./index.html"; // Replace with the actual URL of your login page
}

// Clear a specific cookie by setting its expiration in the past
function clearCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

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

// set navigation click effect
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

// Stop right clicks
document.addEventListener("contextmenu", function (e) {
  e.preventDefault();
});

document.addEventListener("DOMContentLoaded", async () => {
  const logoutButton = document.getElementById("logout_button"); // Replace with the actual ID of your logout button/link
  const loader = document.getElementById("loader"); // Get the loader element
  const profileNameElement = document.querySelector(".user_name");
  const studentIdElement = document.querySelector(".student_id");
  const initialsElement = document.querySelector(".initials span"); // Assuming there's an element with class "initials"
  const courseCardsContainer = document.getElementById("course_cards");
  const certificateCardsContainer =
    document.getElementById("certificate_cards");
  const certificatesButton = document.getElementById("certificates_button");
  const myCoursesButton = document.getElementById("my_courses_button");
  const certificateModal = document.getElementById("certificate_modal");
  const modalOverlay = document.getElementById("modal-overlay");
  const closeButton = certificateModal.querySelector(".bx-x");

  // If no certificates available, show a message
  const noCertificatesMessage = document.createElement("p");
  noCertificatesMessage.classList.add("noCertTooltip");

  // Function to call logout helper function
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

  // Function to show the certificate container with a message
  const showCertificateContainerWithMessage = (message) => {
    courseCardsContainer.innerHTML = ""; // Clear certificate cards
    const noCertificatesMessage = document.createElement("p");
    noCertificatesMessage.classList.add("noCertTooltip");
    noCertificatesMessage.textContent = message;
    courseCardsContainer.appendChild(noCertificatesMessage);
    certificateCardsContainer.style.display = "block";
    certificateCardsContainer.classList.add("course_certificate_container");
    certificateModal.style.display = "none";
    certificatesButton.classList.add("active"); // Remove active class from certificates button
    myCoursesButton.classList.remove("active"); // Add active class to my courses button
  };

  // Function to handle the API call
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

      try {
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
          // Update the number of enrolled courses
          const registeredCoursesElement =
            document.getElementById("registeredCourses");
          const numberOfCourses = result.enrolledcourses.length;
          const courseText = numberOfCourses === 1 ? "course" : "courses";
          registeredCoursesElement.textContent = `${numberOfCourses} Registered ${courseText}`;

          // Loop through enrolled courses and create cards
          result.enrolledcourses.forEach((course) => {
            const card = document.createElement("div");
            card.classList.add("course_card");
            // Create and set course image
            const courseImageContainer = document.createElement("div");
            const courseImage = document.createElement("img");
            courseImage.setAttribute("src", course.course_image_url);

            courseImageContainer.appendChild(courseImage);

            card.appendChild(courseImageContainer);

            // Create and set course name
            const courseName = document.createElement("h4");
            courseName.textContent = `${course.course_name} (${
              course.course_type === "diploma" ? "Diploma" : "Entry Level"
            })`;
            courseName.classList.add("course_card_course_title");
            card.appendChild(courseName);

            // Create and set course type
            const courseType = document.createElement("p");
            courseType.textContent =
              course.enrollment_source === "admission_form"
                ? "Instructor Led"
                : "Self Paced";
            courseType.classList.add("enrollment_type");
            if (course.enrollment_source === "loop_form") {
              courseType.classList.add("loop"); // Add the "loop" class for loop_form courses
            }
            card.appendChild(courseType);

            // Create and set course description based on type
            const courseDescription = document.createElement("p");
            courseDescription.classList.add("course_card_course_description");
            if (course.enrollment_source === "admission_form") {
              courseDescription.textContent =
                "Instructor-led programs are designed so that the modules are unlocked weekly in accordance with the progress of the class.";
            } else if (course.enrollment_source === "loop_form") {
              courseDescription.textContent =
                "Self-Paced (LooP) courses allow you to progress through the modules at your own time and pace.";
            }
            card.appendChild(courseDescription);

            // Create button
            const detailsButton = document.createElement("button");
            detailsButton.innerHTML = `<span>Continue Learning <span><i class='bx bx-right-arrow-alt'></i></span></span>`;
            detailsButton.addEventListener("click", () => {
              console.log(course.teachable_course_id);

              // Redirect to course details page with course ID
              window.location.href = `my-courses.html?courseid=${course.id}&teachableid=${course.teachable_course_id}`;
            });
            card.appendChild(detailsButton);

            // Append card to container
            courseCardsContainer.appendChild(card);
          });

          // Initialize by showing course cards
          showCourseCards();
        }
      } catch (error) {
        console.error("An error occurred:", error);
        // Hide the loader on error
        hideLoaderWithDelay();
        // Show the certificate container with an error message
        showCertificateContainerWithMessage("An error occurred.");
      }
    } else {
      console.log("User data or token not found in session storage.");
      // Hide the loader when the API call
      // Hide the loader when the API call is successful
      hideLoaderWithDelay(); // Hide the loader after a delay
    }
  };

  // Function to fetch certificates and display them
  const fetchCertificatesAndStoreInLocalStorage = () => {
    // Show the loader when the API call starts
    showLoader(true);
    const studentId = localStorage.getItem("mainStudentId");
    console.log(studentId);
    const apiUrl = `https://pluralcode.net/apis/v1/list_certificates.php?student_id=${studentId}`;
    const requestOptions = {
      method: "GET",
      redirect: "follow",
    };

    fetch(apiUrl, requestOptions)
      .then((response) => response.json())
      .then((data) => {
        // Log the API result to the console
        console.log(data);

        if (data.certificates && data.certificates.length > 0) {
          // Extract and store the certificate_ids in an array
          const certificateIds = data.certificates.map(
            (certificate) => certificate.certificate_id
          );

          // Save the certificateIds array in local storage for later use
          localStorage.setItem(
            "certificateIds",
            JSON.stringify(certificateIds)
          );

          // Save the certificates data in local storage for later use
          localStorage.setItem(
            "certificatesData",
            JSON.stringify(data.certificates)
          );

          // Call the function to show certificate cards with the fetched data
          showCertificateCards(data.certificates);
        } else {
          // No certificates found
          showCertificateContainerWithMessage("No certificates found.");
        }

        // Hide the loader on success or no certificates found
        showLoader(false);
      })
      .catch((error) => {
        console.log("error", error);
        // Hide the loader on error
        showLoader(false);
        // Show the certificate container with an error message
        showCertificateContainerWithMessage("An error occurred.");
      });
  };

  // Function to show certificate cards content
  const showCertificateCards = (certificates) => {
    const courseCardsContainer = document.getElementById("course_cards");
    const certificateCardsContainer =
      document.getElementById("certificate_cards");
    const certificateModal = document.getElementById("certificate_modal");
    const accordion = document.querySelector(".accordion");

    accordion.style.display = "none";

    // Clear any existing cards
    certificateCardsContainer.innerHTML = "";

    // Check if there are certificates available
    if (certificates && certificates.length > 0) {
      // Loop through certificates and create certificate cards
      certificates.forEach((certificate) => {
        const card = document.createElement("div");
        card.classList.add("certificate_card");

        // Create a container for the image and details (two columns)
        const cardContainer = document.createElement("div");
        cardContainer.classList.add("card_container");

        // Create the left column for the image
        const leftColumn = document.createElement("div");
        leftColumn.classList.add("left_column");

        const cert_img_ph = document.createElement("img");

        // Check if the course_level is "Diploma"
        if (certificate.course_level === "Diploma") {
          cert_img_ph.setAttribute("src", "./Pluralcode Diploma.png");
        } else if (certificate.course_level === "Entrylevel") {
          cert_img_ph.setAttribute("src", "./Pluralcode Entry Level.png");
        } else {
          // Handle any other cases or errors
          cert_img_ph.setAttribute("src", "./Pluralcoe Certificate-1.png");
        }

        leftColumn.appendChild(cert_img_ph);

        // Create the right column for details
        const rightColumn = document.createElement("div");
        rightColumn.classList.add("right_column");

        // Create and set course name
        const courseName = document.createElement("h4");
        courseName.textContent = certificate.course_name;
        courseName.classList.add("certificate_card_course_title");
        rightColumn.appendChild(courseName);

        // Extract the date part from the given date string
        const dateIssued = new Date(certificate.date_issued);
        const day = dateIssued.getDate();
        const month = new Intl.DateTimeFormat("en-US", {
          month: "long",
        }).format(dateIssued);
        const year = dateIssued.getFullYear();

        // Format the date as "11th of September, 2023"
        const formattedDate = `${day}${daySuffix(day)} of ${month}, ${year}`;

        // Create and set text for formatted date
        const dateIssuedText = document.createElement("p");
        dateIssuedText.textContent = `Date Issued: ${formattedDate}`;
        rightColumn.appendChild(dateIssuedText);

        // Function to add the appropriate suffix to the day
        function daySuffix(day) {
          if (day >= 11 && day <= 13) {
            return "th";
          }
          switch (day % 10) {
            case 1:
              return "st";
            case 2:
              return "nd";
            case 3:
              return "rd";
            default:
              return "th";
          }
        }

        // Create button
        const viewButton = document.createElement("button");
        viewButton.classList.add("view");
        viewButton.textContent = "View";
        viewButton.addEventListener("click", () => {
          // Get the certificate data associated with this card
          const certificateId = certificate.certificate_id; // Assuming you have a unique identifier for each certificate

          // Construct the URL with the query parameter
          const url = `https://certtest.netlify.app/?cert_id=${certificateId}`;

          // Redirect the user to the new tab
          window.open(url, "_blank");
        });

        rightColumn.appendChild(viewButton);

        // Append the left and right columns to the card container
        cardContainer.appendChild(leftColumn);
        cardContainer.appendChild(rightColumn);

        // Append the card container to the card
        card.appendChild(cardContainer);

        // Append card to container
        certificateCardsContainer.appendChild(card);
      });
    } else {
      noCertificatesMessage.textContent =
        "No certificates available at the moment.";
      certificateCardsContainer.appendChild(noCertificatesMessage);
    }

    certificateCardsContainer.style.display = "block";
    certificateCardsContainer.classList.add("course_certificate_container");
    certificateModal.style.display = "none";
    courseCardsContainer.style.display = "none";

    // Add active class to "Certificates" button
    const certificatesButton = document.getElementById("certificates_button");
    certificatesButton.classList.add("active");

    // Remove active class from "My Courses" button
    const myCoursesButton = document.getElementById("my_courses_button");
    myCoursesButton.classList.remove("active");
  };

// Function to show course cards
const showCourseCards = () => {
  // Hide the certificate container
  certificateCardsContainer.style.display = "none"; // Hide certificate cards
  courseCardsContainer.style.display = "flex"; // Show course cards
  certificatesButton.classList.remove("active"); // Remove active class from certificates button
  myCoursesButton.classList.add("active"); // Add active class to my courses button

  // Check if the noCertificatesMessage is displayed and hide it
  const noCertificatesMessage = document.querySelector(".noCertTooltip");
  if (noCertificatesMessage && noCertificatesMessage.style.display !== "none") {
    noCertificatesMessage.style.display = "none";
  }
};


  // Add event listener to "Certificates" button
  certificatesButton.addEventListener(
    "click",
    fetchCertificatesAndStoreInLocalStorage
  );

  // Add event listener to "My Courses" button
  myCoursesButton.addEventListener("click", () => {
    console.log("Clicked");
    makeAPICall(); // Trigger the API call when "My Courses" button is clicked
    showCourseCards();
  });

  // Add event listener to close the modal
  closeButton.addEventListener("click", () => {
    certificateModal.style.display = "none";
    modalOverlay.style.display = "none";
    document.body.classList.remove("modal-open");
  });

  // Initialize by making the initial API call
  makeAPICall();

  // Set an interval to refresh the API call every 1 hour (60 minutes)
  setInterval(() => {
    makeAPICall();
    // Refresh the page
    window.location.reload();
  }, 60 * 60 * 1000);
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

// create accordion
document.addEventListener("DOMContentLoaded", () => {
  const accordionSections = document.querySelectorAll(".accordion-section");

  accordionSections.forEach((section) => {
    const header = section.querySelector(".accordion-header");
    const content = section.querySelector(".accordion-content");
    const toggleIcon = section.querySelector(".accordion_toggle_icon");
    const chevronRightIcon = toggleIcon.querySelector(".bxs-chevron-right");
    const chevronDownIcon = toggleIcon.querySelector(".bxs-chevron-down");

    header.addEventListener("click", () => {
      content.classList.toggle("active");

      // Toggle the chevron icons based on the active state of the content
      if (content.classList.contains("active")) {
        chevronRightIcon.style.display = "none";
        chevronDownIcon.style.display = "block";
      } else {
        chevronRightIcon.style.display = "block";
        chevronDownIcon.style.display = "none";
      }

      // Close other open accordion sections
      accordionSections.forEach((otherSection) => {
        if (otherSection !== section) {
          otherSection
            .querySelector(".accordion-content")
            .classList.remove("active");
          const otherChevronRightIcon =
            otherSection.querySelector(".bxs-chevron-right");
          const otherChevronDownIcon =
            otherSection.querySelector(".bxs-chevron-down");
          otherChevronRightIcon.style.display = "block";
          otherChevronDownIcon.style.display = "none";
        }
      });
    });
  });
});

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

function findCertificateById(certificateId) {
  // Retrieve the certificate data from local storage
  const storedCertificateData = JSON.parse(
    localStorage.getItem("certificatesData")
  );

  // Find the certificate with the matching ID
  const selectedCertificate = storedCertificateData.find(
    (certificate) => certificate.certificate_id === certificateId
  );

  return selectedCertificate;
}

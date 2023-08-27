document.addEventListener("DOMContentLoaded", async () => {
  const logoutButton = document.getElementById("logout_button"); // Replace with the actual ID of your logout button/link

  logoutButton.addEventListener("click", () => {
    logoutUser();
  });
  try {
    const profileNameElement = document.querySelector(".user_name");
    const studentIdElement = document.querySelector(".student_id");
    const initialsElement = document.querySelector(".initials span"); // Assuming there's an element with class "initials"

    const makeAPICall = async () => {
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

        // Set active navigation item
        const currentPage = window.location.pathname.split("/").pop();
        setActiveNavItem(currentPage);
        setupNavItemClick();

        // Update profile name
        profileNameElement.textContent = result.user.name;

        // Update student ID
        studentIdElement.textContent = `Student ID: ${result.user.id}`;

        // Update initials
        if (result.user.name) {
          const initials = result.user.name.charAt(0).toUpperCase();
          initialsElement.textContent = initials;

          // Update the outstanding balance
          const totalBalanceElement = document.getElementById("totalBalance");
          totalBalanceElement.textContent = `${result.totalbalance}`;

          // Update the number of enrolled courses
          const registeredCoursesElement =
            document.getElementById("registeredCourses");
          const numberOfCourses = result.enrolledcourses.length;
          const courseText = numberOfCourses === 1 ? "course" : "courses";
          registeredCoursesElement.textContent = `${numberOfCourses} Registered ${courseText}`;

          // Select the course_cards container
          const courseCardsContainer = document.getElementById("course_cards");
          courseCardsContainer.classList.add("course_cards");

          // Loop through enrolled courses and create cards
          result.enrolledcourses.forEach((course) => {
            const card = document.createElement("div");
            card.classList.add("course_card");

            // Create and set course image
            const courseImage = document.createElement("img");
            courseImage.src = course.course_image_url;
            card.appendChild(courseImage);

            // Create and set course name
            const courseName = document.createElement("h4");
            courseName.textContent = course.course_name;
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
                "Instructor-led programs are designed so that the modules are unlocked often weekly in accordance with the progress of the class in general.";
            } else if (course.enrollment_source === "loop_form") {
              courseDescription.textContent =
                "Self-Paced (LooP) courses allow you to progress through the modules at your own time and pace.";
            }
            card.appendChild(courseDescription);

            // Create button
            const detailsButton = document.createElement("button");
            detailsButton.innerHTML = `<span>Continue Learning <span><i class='bx bx-right-arrow-alt'></i></span></span>`;
            detailsButton.addEventListener("click", () => {
              // Redirect to course details page with course ID
              window.location.href = `my-courses.html?courseid=${course.id}`;
            });
            card.appendChild(detailsButton);

            // Append card to container
            courseCardsContainer.appendChild(card);
          });

          // Function to show course cards content
          const showCourseCards = () => {
            const courseCardsContainer =
              document.getElementById("course_cards");
            const certificateCards =
              document.getElementById("certificate_cards");

            courseCardsContainer.style.display = "flex";
            certificateCards.style.display = "none";

            // Add active class to "My Courses" button
            const myCoursesButton =
              document.getElementById("my_courses_button");
            myCoursesButton.classList.add("active");

            // Remove active class from "Certificates" button
            const certificatesButton = document.getElementById(
              "certificates_button"
            );
            certificatesButton.classList.remove("active");
          };

          // Function to show certificate cards content
          const showCertificateCards = () => {
            const courseCardsContainer =
              document.getElementById("course_cards");
            const certificateCardsContainer =
              document.getElementById("certificate_cards");
            const certificateModal =
              document.getElementById("certificate_modal");
            const accordion = document.querySelector(".accordion");

            accordion.style.display = "none";

            // Clear any existing cards
            certificateCardsContainer.innerHTML = "";

            // Loop through enrolled courses and create certificate cards
            result.enrolledcourses.forEach((course) => {
              const card = document.createElement("div");
              card.classList.add("certificate_card");

              // Create and set course image
              const courseImage = document.createElement("img");
              courseImage.src = course.course_image_url;
              card.appendChild(courseImage);

              // Create and set course name
              const courseName = document.createElement("h4");
              courseName.textContent = course.course_name;
              courseName.classList.add("certificate_card_course_title");
              // card.appendChild(courseName);

              // Create and set text for successfully completed
              const completedText = document.createElement("p");
              completedText.textContent = "Successfully Completed";
              // card.appendChild(completedText);

              const course_cert_details = document.createElement("div");
              course_cert_details.appendChild(courseName);
              course_cert_details.appendChild(completedText);

              // Create button
              const viewButton = document.createElement("button");
              viewButton.classList.add("view");
              viewButton.textContent = "View";
              viewButton.addEventListener("click", () => {
                // Show certificate modal with course details
                showCertificateModal(course);
              });

              const course_cert_details_container =
                document.createElement("div");
              course_cert_details_container.classList.add(
                "course_cert_details_container"
              );
              course_cert_details_container.appendChild(course_cert_details);
              course_cert_details_container.appendChild(viewButton);
              card.appendChild(course_cert_details_container);

              // Append card to container
              certificateCardsContainer.appendChild(card);
            });

            certificateCardsContainer.style.display = "block";
            certificateCardsContainer.classList.add(
              "course_certificate_container"
            );
            certificateModal.style.display = "none";
            courseCardsContainer.style.display = "none";

            // Add active class to "Certificates" button
            const certificatesButton = document.getElementById(
              "certificates_button"
            );
            certificatesButton.classList.add("active");

            // Remove active class from "My Courses" button
            const myCoursesButton =
              document.getElementById("my_courses_button");
            myCoursesButton.classList.remove("active");
          };

          // Add event listener to "My Courses" button
          const myCoursesButton = document.getElementById("my_courses_button");
          myCoursesButton.addEventListener("click", showCourseCards);

          // Add event listener to "Certificates" button
          const certificatesButton = document.getElementById(
            "certificates_button"
          );
          certificatesButton.addEventListener("click", showCertificateCards);

          const showCertificateModal = (course) => {
            const certificateModal =
              document.getElementById("certificate_modal");
            const closeButton = certificateModal.querySelector(".bx-x");
            const certificateContainer = certificateModal.querySelector(
              ".view_certificate_modal_container"
            );
            const certificateImage = certificateContainer.querySelector("img");
            const certificateCompletedBy =
              certificateContainer.querySelector("span");
            const certificateDate = certificateContainer.querySelector("small");
            const certificateText = certificateContainer.querySelector("p");

            // Set certificate details
            certificateImage.src = course.course_image_url;
            certificateCompletedBy.textContent = `Completed by ${result.user.name}`;
            certificateDate.textContent = new Date().toLocaleDateString(
              "en-US",
              {
                year: "numeric",
                month: "long",
                day: "numeric",
              }
            );
            certificateText.textContent = `PluralCode certifies their successful completion of ${course.course_name}`;

            // Show the certificate modal
            certificateModal.style.display = "block";

            // Close the modal when the "x" icon is clicked
            closeButton.addEventListener("click", () => {
              certificateModal.style.display = "none";
            });
          };

          // Initialize by showing course cards
          showCourseCards();
        }
      } else {
        console.log("User data or token not found in session storage.");
      }
    };

    makeAPICall();

    // Set an interval to refresh the API call every 30 minutes
    setInterval(makeAPICall, 30 * 60 * 1000);
  } catch (error) {
    console.error("An error occurred:", error);
  }
});

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

// Stop right clicks
document.addEventListener("contextmenu", function (e) {
  e.preventDefault();
});

// main page body rendering and dashboard API backend data usage logic
document.addEventListener("DOMContentLoaded", async () => {
  // Get goBack Button
  const goBackLink = document.getElementById("goBackLink");

  // Get page loader
  const loader = document.getElementById("loader"); // Get the loader element

  // go back funtion that mimics website back history button
  goBackLink.addEventListener("click", (event) => {
    event.preventDefault(); // Prevents the default link behavior (navigating to a new page)
    window.history.back(); // Mimics the browser's back button action
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
    // Check if the "quiz completed" flag is present in local storage
    const quizCompletedFlag = localStorage.getItem("quizCompleted");

    if (!quizCompletedFlag) {
      // Show the initial loader if the flag is not present
      showLoader(true);
    }
    // Retrieve userToken from cookies
    const userToken = getCookie("userToken");

    // Retrieve userData from local storage
    const userData = localStorage.getItem("userData");
    const userDataString = userData;
    console.log(userData);

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

      // Store the API result as "checkForCert" in local storage
      localStorage.setItem("checkForCert", JSON.stringify(result));

      // Hide the loader when the API call is successful
      hideLoaderWithDelay(); // Hide the loader after a delay

      const expirationDate = new Date();
      expirationDate.setFullYear(expirationDate.getFullYear() + 1);

      // Store the result data in local storage
      localStorage.setItem("apiData", JSON.stringify(result));

      // Also store the expiration date in local storage
      localStorage.setItem("apiDataExpiration", expirationDate.getTime());

      console.log("User Data:", userData);
      console.log("User Token:", userToken);

      const profileNameElement = document.querySelector(".user_name");
      const studentIdElement = document.querySelector(".student_id");
      const initialsElement = document.querySelector(".initials span");

      const mainStudentId = localStorage.getItem("mainStudentId");

      profileNameElement.textContent = result.user.name;
      studentIdElement.textContent = `Student ID: ${mainStudentId}`;

      if (result.user.name) {
        const firstName = result.user.name.split(" ")[0];
        const firstInitial = firstName.charAt(0).toUpperCase();
        initialsElement.textContent = firstInitial;
      }

      const urlParams = new URLSearchParams(window.location.search);
      const courseId = urlParams.get("courseid");

      const targetCourse = result.enrolledcourses.find(
        (course) => course.id === parseInt(courseId)
      );

      const modulesContainer = document.querySelector(".module_containers");

      // Get the elements
      const showMoreButton = document.getElementById("seeMore");
      const hiddenText = document.getElementById("hiddenText");

      // Initialize the state of the hidden content
      let isHidden = true;

      // Add click event listener to the "Show More" button
      showMoreButton.addEventListener("click", () => {
        isHidden = !isHidden; // Toggle the state

        // Toggle the display of the hidden text
        hiddenText.style.display = isHidden ? "none" : "block";

        // Change the text of the "Show More" button
        showMoreButton.textContent = isHidden ? "Show More" : "Show Less";
      });

      // Get the filter buttons
      const moduleFilterButton = document.querySelector(
        '[data-filter="modules"]'
      );
      const paymentFilterButton = document.querySelector(
        '[data-filter="payment"]'
      );

      // Check if the target course exists and its enrollment_source is "loop_form"
      if (targetCourse && targetCourse.enrollment_source === "loop_form") {
        paymentFilterButton.style.display = "none"; // Hide the "Payment Status" filter button
        const capstones__ = document.getElementById("capstones__");
        const hide_capstone = document.getElementById("hide_capstone");
        capstones__.style.display = "block";
        hide_capstone.style.display = "block";
        const payCertificationFeeButton = document.getElementById(
          "payCertificationFeeButton"
        );
        let currency; // Declare the currency variable

        if (targetCourse.currency === "USD") {
          currency = "$";
        } else {
          currency = "₦";
        }

        payCertificationFeeButton.innerHTML = `Pay Certification (${currency}${targetCourse.loopcertificatiofee}) <i style="margin-left: 8px" id="spinner" class="fa fa-circle-o-notch fa-spin"></i>`;

        const spinner = document.getElementById("spinner");
        spinner.style.display = "none";
      }

      const paymentContainer = document.querySelector(".payment_container");

      const outstandingPaymentElement =
        paymentContainer.querySelector("p span");
      paymentContainer.style.textAlign = "center";
      const payment_warning = document.getElementById("payment_warning");
      const show_payment_button = document.getElementById(
        "show_payment_button"
      );
      const course_name = document.getElementById("course_name");

      const instructor_led_message = document.getElementById(
        "instructor_led_message"
      );

      if (targetCourse && targetCourse.enrollment_source === "admission_form") {
        // add the isntructor led information visibility
        instructor_led_message.style.display = "flex";
        // Code to hide the divs
        const hide_capstone = document.getElementById("hide_capstone");
        hide_capstone.style.display = "none";
        const capstoneDivs = document.querySelectorAll(
          ".course_page_search.capstones__"
        );
        capstoneDivs.forEach((div) => {
          div.style.display = "none";
        });

        const outstandingPayment = targetCourse.balance;

        if (outstandingPayment === 0) {
          course_name.textContent = `${targetCourse.course_name}`;
          outstandingPaymentElement.textContent = `No outstanding payment for ${targetCourse.course_name}`;
          outstandingPaymentElement.style.fontSize = "18px";
          outstandingPaymentElement.style.lineHeight = "1.2";
          payment_warning.style.display = "none";
          show_payment_button.style.display = "none";
        } else {
          outstandingPaymentElement.textContent = `${targetCourse.currency}: ${outstandingPayment}`;
        }
      }
      // Get the module containers and payment div
      const moduleContainers = document.querySelector(".module_containers");
      const paymentDiv = document.querySelector(".payment");

      // Add click event listeners to the filter buttons
      moduleFilterButton.addEventListener("click", () => {
        moduleContainers.style.display = "block";
        paymentDiv.style.display = "none";
        moduleFilterButton.classList.add("active");
        paymentFilterButton.classList.remove("active");
      });

      paymentFilterButton.addEventListener("click", () => {
        moduleContainers.style.display = "none";
        paymentDiv.style.display = "block";
        paymentFilterButton.classList.add("active");
        moduleFilterButton.classList.remove("active");
      });

      // Get the "Complete Payment" button element
      const completePaymentButton = document.getElementById(
        "show_payment_button"
      );

      completePaymentButton.addEventListener("click", () => {
        function generateRandomHexWithHyphens(length) {
          const characters = "0123456789ABCDEF";
          let result = "";

          for (let i = 0; i < length; i++) {
            if (i > 0 && i % 4 === 0) {
              // Add a hyphen every 4 characters
              result += "-";
            }
            const randomIndex = Math.floor(Math.random() * characters.length);
            result += characters.charAt(randomIndex);
          }

          return result;
        }
        // Generate a random hexadecimal code with 8 groups of 4 characters separated by hyphens
        const tx_ref = generateRandomHexWithHyphens(32);
        console.log(tx_ref);
        // Extract the course ID from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const courseId = urlParams.get("courseid");
        const teachable = urlParams.get("teachableid");

        // Check if courseId is available
        if (!courseId) {
          console.error("Course ID not found in URL.");
          return;
        }

        // Retrieve the data from local storage
        const apiData = JSON.parse(localStorage.getItem("apiData"));
        console.log("API Data:", apiData); // Log the retrieved data for debugging

        // Check if apiData is available
        if (!apiData) {
          console.error("API data not found in local storage.");
          return;
        }

        // Find the course information based on courseId
        const courseInfo = apiData.enrolledcourses.find(
          (course) => course.id === Number(courseId)
        );

        console.log(courseInfo);

        console.log("Course Info:", courseInfo); // Log the courseInfo for debugging

        // Check if courseInfo is available
        if (!courseInfo) {
          console.error("Course information not found.");
          return;
        }

        const amount = courseInfo.balance;
        const email = apiData.email;

        // Construct the redirect URL with additional parameters
        const redirect_url = `https://pluralcode.academy/portal/my-courses.html?courseid=${courseId}&teachableid=${teachable}&amount=${amount}`;

        console.log("teachbale:", teachable);
        console.log("amount:", amount);
        console.log("TX:", tx_ref);

        // Define the API request parameters with dynamic values
        const requestBody = {
          tx_ref: tx_ref,
          amount: amount,
          currency: courseInfo.currency,
          title: courseInfo.name,
          redirect_url: redirect_url,
          email: apiData.user.email,
          phonenumber: apiData.user.phone_number,
          name: apiData.user.name,
        };

        console.log(requestBody);

        // Define the API request options
        const requestOptions = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
          redirect: "follow",
        };

        // Make the API request
        fetch(
          "https://backend.pluralcode.institute/initialise-payment",
          requestOptions
        )
          .then((response) => response.json())
          .then((data) => {
            // Check if the API response contains the expected data
            if (data && data.status === "success" && data.data.link) {
              // Open a new tab or window with the payment link
              const paymentLink = data.data.link;
              window.open(paymentLink, "_blank");
            } else {
              // Handle API response with missing data or errors
              console.error("API response is missing data or contains errors.");
            }
          })
          .catch((error) => {
            // Handle API request error
            console.error("Error making API request:", error);
          });
      });

      // Store the original content of the payment container
      const originalContent = paymentContainer.innerHTML;

      // Get the course name placeholder element
      const courseNamePlaceholder = document.getElementById(
        "course_name_placeholder"
      );

      if (targetCourse) {
        // Set the course name in the placeholder element
        courseNamePlaceholder.textContent = targetCourse.course_name;

        const modulesContainer = document.querySelector(".module_containers");
        const moduleCreationDelay = 100; // Adjust this value as needed (milliseconds)

        // Check if the module cards are cached in local storage
        const cachedModuleCards = [];
        for (const [index, module] of targetCourse.course_module.entries()) {
          const cachedModuleCard = localStorage.getItem(
            `moduleCard_${module.id}`
          );
          if (cachedModuleCard) {
            // If cached, add it to the array
            cachedModuleCards.push(cachedModuleCard);
          }
        }

        if (cachedModuleCards.length > 0) {
          // Remove cached module cards from local storage
          for (const [index, module] of targetCourse.course_module.entries()) {
            localStorage.removeItem(`moduleCard_${module.id}`);
          }
          // If cached module cards exist, append them to the container
          modulesContainer.innerHTML = cachedModuleCards.join("");
        } else {
          for (const [index, module] of targetCourse.course_module.entries()) {
            const numContents = module.lectures.length;
            const moduleCard = document.createElement("div");
            moduleCard.setAttribute("data-module-id", module.id); // Add this line
            moduleCard.classList.add("module_card");

            // Check if the module is locked or unlocked
            const isUnlocked = module.unlockedstatus === true;

            if (!isUnlocked) {
              moduleCard.classList.add("locked"); // Add a class to style locked modules
            }

            // Calculate the width of the progress bar
            const progressBarWidth =
              module.percentage >= 99 ? "100%" : `${module.percentage}%`;

            // Check if the module.percentage is greater than zero
            const showProgressBar = module.percentage > 0;

            console.log(index);

            moduleCard.innerHTML = `
                <div class="module_container">
                  <div class="module_details">
                     
                      <div class="module_details_text">
                          <h4 class="module_title">Course | ${
                            targetCourse.course_name
                          }</h4>
                          <h3 class="module_course_title">Module ${
                            index + 1
                          }  - ${module.name}</h3>
                          <h5><i class='bx bx-book-content'></i> ${numContents} Milestone${
              numContents !== 1 ? "s" : ""
            }</h5>
             <!-- Check if the module.percentage is greater than zero -->
          ${
            showProgressBar
              ? `
          <!-- Add the progress bar element -->
          <div class="progress_bar">
            <div class="progress_bar_fill" style="width: ${progressBarWidth}"></div>
          </div>`
              : ""
          }
            
                      </div>
        
                  </div>
                  <div class="module_nextup">
                      <span>Next up</span>
  
                      <div>
                        Module ${index + 1} | ${numContents} content${
              numContents !== 1 ? "s" : ""
            }
                      </div>
        <button onclick="redirectToVideoCourse('${courseId}', '${
              module.id
            }')">Continue Module</button>
                  </div>
                </div>
              `;

            setTimeout(() => {
              modulesContainer.appendChild(moduleCard);

              // Store the module card HTML in local storage
              localStorage.setItem(
                `moduleCard_${module.id}`,
                moduleCard.outerHTML
              );
            }, index * moduleCreationDelay);

            try {
              const studyMaterialsData = await fetchStudyMaterialsData(
                targetCourse.teachable_course_id,
                module.lectures,
                userData // Pass the userData object
              );

              // Store studyMaterialsData in session storage
              sessionStorage.setItem(
                "studyMaterialsData",
                JSON.stringify(studyMaterialsData)
              );

              console.log("Study Materials Data:", studyMaterialsData);

              modulesContainer.appendChild(moduleCard);

              // Check if quizCompleted flag is set in localStorage
              const quizCompletedFlag = localStorage.getItem("quizCompleted");

              if (quizCompletedFlag === "true") {
                // Remove the quizCompleted flag
                localStorage.removeItem("quizCompleted");

                // Check the enrollment source
                if (
                  targetCourse &&
                  targetCourse.enrollment_source !== "admission_form"
                ) {
                  // Find the next locked module
                  const nextLockedModule = targetCourse.course_module.find(
                    (module) => !module.unlockedstatus
                  );

                  if (nextLockedModule) {
                    const unlockModuleAPIUrl =
                      "https://backend.pluralcode.institute/student/unlock-loop-module";
                    const userScore = JSON.parse(
                      localStorage.getItem("userScore")
                    );
                    const nextModuleId = nextLockedModule.id;
                    const teachableCourseId = targetCourse.teachable_course_id; // Use teachable_course_id from the API result
                    const userToken = getCookie("userToken"); // Get userToken from cookies

                    // Create the request body
                    const requestBody = {
                      course_id: teachableCourseId,
                      module_id: nextModuleId,
                      quizscore: userScore,
                    };

                    // Prepare headers and options for the fetch request
                    const headers = new Headers();
                    headers.append("Content-Type", "application/json");
                    headers.append("Authorization", `Bearer ${userToken}`); // Add the userToken to headers

                    const requestOptions = {
                      method: "POST",
                      headers: headers,
                      body: JSON.stringify(requestBody),
                      redirect: "follow",
                    };

                    // Make the API call to unlock the next module
                    fetch(unlockModuleAPIUrl, requestOptions)
                      .then((response) => response.json())
                      .then((result) => {
                        if (
                          result.message ===
                          "congratulations next module unlocked"
                        ) {
                          console.log("Next module unlocked successfully!");
                          // You can update UI or perform any other actions here
                          window.location.reload();
                          hideLoaderWithDelay();
                          // Get the next module card by its ID and remove the "locked" class
                          const nextModuleCard = document.querySelector(
                            `[data-module-id="${nextModuleId}"]`
                          );
                          if (nextModuleCard) {
                            nextModuleCard.classList.remove("locked");
                          }
                        }
                      })
                      .catch((error) =>
                        console.error("Error unlocking next module:", error)
                      );

                    // Remove the userScore from localStorage after it's been used
                    localStorage.removeItem("userScore");
                  }
                } else {
                  // Display completion message or handle other cases as needed
                  const completionMessage = document.createElement("div");
                  completionMessage.textContent =
                    "You have completed all the modules in this course.";
                  completionMessage.classList.add("completionMessage");
                  modulesContainer.appendChild(completionMessage);

                  // Remove the completion message after 10 seconds
                  setTimeout(() => {
                    if (completionMessage.parentNode) {
                      completionMessage.parentNode.removeChild(
                        completionMessage
                      );
                    }
                  }, 10000); // 10 seconds
                }
              }
            } catch (error) {
              console.error(
                "An error occurred while fetching study materials:",
                error
              );
            }
          }
        }
      }
    } else {
      console.log("User data or token not found in cookies.");
      // Hide the loader when the API call is successful
      hideLoaderWithDelay(); // Hide the loader after a delay
    }
  } catch (error) {
    console.error("An error occurred:", error);
    // Hide the loader when the API call is successful
    hideLoaderWithDelay(); // Hide the loader after a delay
  }
});

// Fetching study material data for each module in a course...
async function fetchStudyMaterialsData(teachableCourseId, lectures, userData) {
  const lectureIds = lectures.map((lecture) => lecture.id);

  const requestBody = {
    course_id: teachableCourseId,
    lectures: lectureIds.map((lectureId) => ({ id: lectureId })),
  };

  const userToken = getCookie("userToken");

  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userToken}`, // Include the bearer token
    },
    body: JSON.stringify(requestBody),
    redirect: "follow",
  };

  try {
    const response = await fetch(
      "https://backend.pluralcode.institute/student/study-materials",
      requestOptions
    );
    const responseData = await response.json();
    return responseData; // Return the entire study materials data
  } catch (error) {
    console.error("Error fetching study materials data:", error);
    throw error;
  }
}

//Fucntion that gets cookie
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

const urlParams = new URLSearchParams(window.location.search);
const teachable_course_id = urlParams.get("teachableid");

// function that redirects to the video course
function redirectToVideoCourse(courseId, moduleId) {
  window.location.href = `video-course.html?courseid=${courseId}&moduleid=${moduleId}&teachableid=${teachable_course_id}`;
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
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=None`;
}

// Function for payment initialization
document.addEventListener("DOMContentLoaded", () => {
  // Find the button by its ID
  const payCertificationFeeButton = document.getElementById(
    "payCertificationFeeButton"
  );

  payCertificationFeeButton.style.display = "block";
  // Add a click event listener to the button
  payCertificationFeeButton.addEventListener("click", () => {
    spinner.style.display = "inline-block";
    function generateRandomHexWithHyphens(length) {
      const characters = "0123456789ABCDEF";
      let result = "";

      for (let i = 0; i < length; i++) {
        if (i > 0 && i % 4 === 0) {
          // Add a hyphen every 4 characters
          result += "-";
        }
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
      }

      return result;
    }

    // Generate a random hexadecimal code with 8 groups of 4 characters separated by hyphens
    const tx_ref = generateRandomHexWithHyphens(32);
    console.log(tx_ref);
    // Extract the course ID from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get("courseid");
    const teachable = urlParams.get("teachableid");

    // Check if courseId is available
    if (!courseId) {
      console.error("Course ID not found in URL.");
      return;
    }

    // Retrieve the data from local storage
    const apiData = JSON.parse(localStorage.getItem("apiData"));
    console.log("API Data:", apiData); // Log the retrieved data for debugging

    // Check if apiData is available
    if (!apiData) {
      console.error("API data not found in local storage.");
      return;
    }

    // Find the course information based on courseId
    const courseInfo = apiData.enrolledcourses.find(
      (course) => course.id === Number(courseId)
    );

    console.log(courseInfo);

    console.log("Course Info:", courseInfo); // Log the courseInfo for debugging

    // Check if courseInfo is available
    if (!courseInfo) {
      console.error("Course information not found.");
      return;
    }

    const amount = courseInfo.loopcertificatiofee;

    // Construct the redirect URL with additional parameters
    const redirect_url = `https://pluralcode.academy/portal/my-courses.html?courseid=${courseId}&teachableid=${teachable}&amount=${amount}`;

    console.log("teachbale:", teachable);
    console.log("amount:", amount);
    console.log("TX:", tx_ref);

    // Define the API request parameters with dynamic values
    const requestBody = {
      tx_ref: tx_ref,
      amount: amount,
      currency: courseInfo.currency,
      title: courseInfo.name,
      redirect_url: redirect_url,
      email: apiData.user.email,
      phonenumber: apiData.user.phone_number,
      name: apiData.user.name,
    };

    // Define the API request options
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      redirect: "follow",
    };

    console.log(requestBody, requestOptions);
    // Make the API request
    fetch(
      "https://backend.pluralcode.institute/initialise-payment",
      requestOptions
    )
      .then((response) => response.json())
      .then((data) => {
        console.log("API Response Data:", data);

        // Check if the API response contains the expected data
        if (data && data.status === "success" && data.data.link) {
          spinner.style.display = "none";
          // Open a new tab or window with the payment link
          const paymentLink = data.data.link;
          window.open(paymentLink, "_blank");
          console.log(requestOptions);
        } else {
          spinner.style.display = "none";
          // Handle API response with missing data or errors
          console.error("API response is missing data or contains errors.");
        }
      })
      .catch((error) => {
        spinner.style.display = "none";

        // Handle API request error
        console.error("Error making API request:", error);
      });
  });
});

// confirm certPaymentStatus
document.addEventListener("DOMContentLoaded", async () => {
  // Check if URL parameters contain payment status, tx_ref, and transaction_id
  const urlParams = new URLSearchParams(window.location.search);
  const paymentStatus = urlParams.get("status");
  const txRef = urlParams.get("tx_ref");
  const transactionId = urlParams.get("transaction_id");
  const amount = urlParams.get("amount");
  const courseid = urlParams.get("courseid");

  // Fetch the "certpayment_status" for the current course (You need to implement this)
  const certPaymentStatus = fetchCertPaymentStatus(courseid);
  console.log(certPaymentStatus);

  // Check if the payment status is "successful" and txRef and transactionId are present,
  // OR if the "certpayment_status" is true
  if (
    (paymentStatus === "successful" && txRef && transactionId) ||
    certPaymentStatus === true
  ) {
    // Activate your buttons here
    activateButtons();

    // Retrieve the userToken from the cookie
    const userToken = getCookie("userToken");

    // Make an API call to verify the payment (if needed)
    if (paymentStatus === "successful" && txRef && transactionId) {
      const verifyPaymentUrl =
        "https://backend.pluralcode.institute/student/certificate-payment";
      const requestBody = {
        course_id: courseid,
        amount_paid: amount,
        flutterwave_reference_id: txRef,
      };

      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify(requestBody),
      };

      try {
        const response = await fetch(verifyPaymentUrl, requestOptions);
        const result = await response.text();

        // Handle the result as needed
        console.log("Payment Verification Result:", result);

        // Check if the payment verification was successful
        if (result === "Payment successful") {
          console.log("Payment Successful");
        }

        // You can update the UI or take actions based on the verification result
      } catch (error) {
        console.error("Error verifying payment:", error);
      }
    }
  }
});

// Function to fetch "certpayment_status" from local storage
function fetchCertPaymentStatus(courseId) {
  try {
    // Get the "checkForCert" data from local storage
    const checkForCertDataString = localStorage.getItem("checkForCert");

    if (checkForCertDataString) {
      // Parse the data as JSON
      const checkForCertData = JSON.parse(checkForCertDataString);

      // Find the target course using the courseId
      const targetCourse = checkForCertData.enrolledcourses.find(
        (course) => course.id === parseInt(courseId)
      );

      if (targetCourse && targetCourse.certpayment_status) {
        // "certpayment_status" is true for the target course
        return true;
      }
    }
  } catch (error) {
    console.error("Error fetching certpayment_status:", error);
  }

  // Return false if "certpayment_status" is not found or there's an error
  return false;
}

// Function to activate your buttons
function activateButtons() {
  // Remove the 'disabled' attribute from the buttons
  const payCertificationFeeButton = document.getElementById(
    "payCertificationFeeButton"
  );

  const beginCapstoneProjectButton = document.querySelector(
    ".course_page_search button:last-child"
  );

  if (payCertificationFeeButton) {
    payCertificationFeeButton.style.display = "none";
  }

  if (beginCapstoneProjectButton) {
    beginCapstoneProjectButton.removeAttribute("disabled");

    // Add a click event listener to the "Begin Capstone Project" button

    beginCapstoneProjectButton.addEventListener("click", () => {
      // Fetch the "checkForCert" data from local storage
      const checkForCertDataString = localStorage.getItem("checkForCert");

      // Get the course ID from the URL
      const urlParams = new URLSearchParams(window.location.search);
      const courseId = urlParams.get("courseid");

      if (checkForCertDataString) {
        try {
          // Parse the "checkForCert" data as JSON
          const checkForCertData = JSON.parse(checkForCertDataString);

          // Find the target course using the courseId
          const targetCourse = checkForCertData.enrolledcourses.find(
            (course) => course.id === parseInt(courseId)
          );

          if (targetCourse && targetCourse.capstone_project_instruction_link) {
            // Get the capstone_project_instruction_link for the course
            const instructionLink =
              targetCourse.capstone_project_instruction_link;

            // Open the instructionLink in a new tab
            window.open(instructionLink, "_blank");
          } else {
            console.log("Capstone project instruction link not found.");
          }
        } catch (error) {
          console.error("Error parsing checkForCert data:", error);
        }
      } else {
        console.log("checkForCert data not found in local storage.");
      }
    });
  }
}

// Check for student balance payment
// Extract tx_ref, courseid, and other parameters from URL
const txRef = urlParams.get("tx_ref");
const courseId = urlParams.get("courseid");
const transactionId = urlParams.get("transaction_id");
const paymentStatus = urlParams.get("status");

// Check if all required parameters are present
if (!txRef || !courseId || !transactionId || !paymentStatus) {
  // Missing one or more required parameters in the URL
  console.error("Required parameters are missing in the URL.");
} else {
  // All required parameters are present, proceed with the payment completion process

  // Retrieve apiData from local storage
  const apiData = JSON.parse(localStorage.getItem("apiData"));

  // Check if apiData is available
  if (!apiData) {
    console.error("apiData not found in local storage.");
  } else {
    // Find the corresponding course_name based on courseid
    const courseInfo = apiData.enrolledcourses.find(
      (course) => course.id === Number(courseId)
    );

    // Check if courseInfo is available
    if (!courseInfo) {
      console.error("Course information not found.");
    } else {
      // Retrieve user email from apiData
      const userEmail = apiData.user.email;

      // Get userToken from cookies
      const userToken = getCookie("userToken");

      // Construct the API request payload
      const apiPayload = {
        course_name: courseInfo.course_name,
        email: userEmail,
        flutterwave_reference_id: txRef,
      };

      // Define API request options
      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify(apiPayload),
        redirect: "follow",
      };

      // Make the API call
      fetch(
        "https://backend.pluralcode.institute/student/balance-payment",
        requestOptions
      )
        .then((response) => response.json())
        .then((data) => {
          // Handle the API response
          if (data && data.message === "Payment completed") {
            // Payment completed successfully
            console.log("Payment completed successfully.");

            const urlParams = new URLSearchParams(window.location.search);
            const courseId = urlParams.get("courseid");

            const targetCourse = result.enrolledcourses.find(
              (course) => course.id === parseInt(courseId)
            );

            const paymentContainer =
              document.querySelector(".payment_container");

            const outstandingPaymentElement =
              paymentContainer.querySelector("p span");
            const payment_warning = document.getElementById("payment_warning");
            const show_payment_button = document.getElementById(
              "show_payment_button"
            );

            outstandingPaymentElement.textContent = `Payment Completed for ${
              targetCourse.course_name
            } (${
              targetCourse.course_type === "diploma" ? "Diploma" : "Entry Level"
            })`;
            outstandingPaymentElement.style.fontSize = "18px";
            outstandingPaymentElement.style.lineHeight = "1.2";
            payment_warning.style.display = "none";
            show_payment_button.style.display = "none";
            // You can perform further actions here.
          } else {
            // Handle API response with missing data or errors
            console.error("API response is missing data or contains errors.");
          }
        })
        .catch((error) => {
          // Handle API request error
          console.error("Error making API request:", error);
        });
    }
  }
}

//community button
// Get the "cumminity" button element
const communityButton = document.getElementById("communityBtn");

// Add a click event listener to the "communityBtn" button
communityButton.addEventListener("click", () => {
  // Extract the course ID from the URL
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get("courseid");

  // Retrieve the API data from local storage
  const apiData = JSON.parse(localStorage.getItem("apiData"));

  // Check if the API data is available
  if (apiData) {
    // Find the target course using the courseId
    const targetCourse = apiData.enrolledcourses.find(
      (course) => course.id === parseInt(courseId)
    );

    console.log(targetCourse.course_community_link);

    // Check if the target course exists and has a community link
    if (targetCourse && targetCourse.course_community_link) {
      // Open the community link in a new tab
      window.open(targetCourse.course_community_link, "_blank");
    } else {
      // Handle the case where the community link is not available
      console.log("Community link not found for this course.");
    }
  } else {
    // Handle the case where the API data is not available
    console.log("API data not found in local storage.");
  }
});

document.addEventListener("contextmenu", function (e) {
  e.preventDefault();
});

// Wait for the document to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Extract the certificate ID from the URL query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const certificateId = urlParams.get("cert_id");

  // Get the error message element
  const errorMessageElement = document.getElementById("error_message");

  // Get the content container element
  const certificateContent = document.querySelector(".certificate_page");

  if (certificateId) {
    // Certificate ID is found in the URL

    // Hide the error message
    errorMessageElement.style.display = "none";

    // Construct the API URL with the certificate ID from the URL
    const apiUrl = `https://pluralcode.net/apis/v1/verify_certificate.php?cert_id=${certificateId}`;

    // Make an API call to the constructed URL
    fetch(apiUrl)
      .then((response) => response.json())
      .then((result) => {
        // Print the resulting data to the console
        console.log("API Response:", result);

        // Set the formatted date in the <span> element
        const currentDate = new Date();
        const formattedDate = `${currentDate.toLocaleString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}`;
        const dayElement = document.getElementById("day");
        dayElement.textContent = formattedDate;

        const studentNameElement = document.getElementById("student_name");
        studentNameElement.textContent = result.full_name;

        const course_name = document.getElementById("course_name");
        course_name.textContent = result.course_name;

        const cert_id = document.getElementById("cert_id");
        cert_id.textContent = result.certificate_id;

        // Get the course name from the API response
        const courseName = result.course_name.toLowerCase(); // Convert to lowercase for case-insensitive comparison

        // Define the mapping of keywords to school names
        const keywordToSchoolMap = {
          "product design": "Product School Diploma",
          "product management": "Product School Diploma",
          "agile project mgt": "Product School Diploma",
          "data analytics": "Data School Diploma",
          "business analytics": "Data School Diploma",
          "backend development": "Programming School Diploma",
          "frontend development": "Programming School Diploma",
          "cloud computing": "Cloud School Diploma",
          "cyber security": "Cloud School Diploma",
        };

        // Initialize the default school name
        let schoolName = "---";

        // Iterate over the keywords and check if any keyword is present in the course name
        for (const keyword in keywordToSchoolMap) {
          if (courseName.includes(keyword)) {
            schoolName = keywordToSchoolMap[keyword];
            break; // Exit the loop once a match is found
          }
        }

        const school_b = document.getElementById("school_b");
        school_b.textContent = schoolName;

        // Get the span element
        const schoolSpan = document.querySelector(".school");

        // Set the text content of the span based on the matched school name
        schoolSpan.textContent = schoolName;

        // Check if course_level is "Diploma" (case-insensitive)
        const courseLevel = result.course_level.toLowerCase();
        if (courseLevel !== "diploma") {
          // Certificate ID is not found in the URL

          // Display the error message
          errorMessageElement.textContent = "Certificate ID not found";
          errorMessageElement.style.display = "block";

          certificateContent.innerHTML = "";

          // Append the error message element to certificateContent
          certificateContent.appendChild(errorMessageElement);
        }
        // You can further process the API response as needed
      })
      .catch((error) => {
        console.error("API Error:", error);

        // Certificate ID is not found in the URL

        // Display the error message
        errorMessageElement.textContent = "Certificate ID not found";
        errorMessageElement.style.display = "block";

        certificateContent.innerHTML = "";

        // Append the error message element to certificateContent
        certificateContent.appendChild(errorMessageElement);
      });
  } else {
    // Certificate ID is not found in the URL

    // Display the error message
    errorMessageElement.textContent = "Certificate ID not found";
    errorMessageElement.style.display = "block";

    certificateContent.innerHTML = "";

    // Append the error message element to certificateContent
    certificateContent.appendChild(errorMessageElement);
  }
});

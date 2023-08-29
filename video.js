// Retrieve the "Go Back" link element
const goBackLink = document.querySelector(".community__ a");

// Attach a click event listener to the "Go Back" link
goBackLink.addEventListener("click", (event) => {
  event.preventDefault(); // Prevent the default link behavior
  history.back(); // Simulate the back button behavior
});

// Function to retrieve a cookie by name
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

// Function to clear a specific cookie
function clearCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

// Function to log out the user and clear cookies
function logoutUser() {
  clearCookie("userData");
  clearCookie("userToken");
  clearCookie("studyMaterialsData");
  clearCookie("studyMaterialsByModule");
  clearCookie("apiData");

  sessionStorage.removeItem("userData");
  sessionStorage.removeItem("userToken");

  window.location.href = "./index.html"; // Redirect to the login page
}

document.addEventListener("DOMContentLoaded", async () => {
  const videoPlayer = document.getElementById("videoPlayer");
  const pdfContainer = document.getElementById("pdf_container");

  videoPlayer.style.display = "none";
  pdfContainer.style.display = "none";

  try {
    // Retrieve userToken from cookies
    const userToken = getCookie("userToken");

    // Retrieve userData from local storage
    const userDataString = localStorage.getItem("userData");

    if (userDataString && userToken) {
      const userData = JSON.parse(userDataString);

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

      const expirationDate = new Date();
      expirationDate.setFullYear(expirationDate.getFullYear() + 1);
      document.cookie = `apiData=${JSON.stringify(
        result
      )}; expires=${expirationDate.toUTCString()}; path=/; SameSite=None; Secure`;

      console.log("User Data:", userData);
      console.log("User Token:", userToken);

      const profileNameElement = document.querySelector(".user_name");
      const studentIdElement = document.querySelector(".student_id");
      const initialsElement = document.querySelector(".initials span");

      profileNameElement.textContent = result.user.name;
      studentIdElement.textContent = `Student ID: ${result.user.id}`;

      if (result.user.name) {
        const firstName = result.user.name.split(" ")[0];
        const firstInitial = firstName.charAt(0).toUpperCase();
        initialsElement.textContent = firstInitial;
      }

      const milestoneHeader = document.querySelector(".milestone_header h3");
      const moduleMilestoneName = document.getElementById(
        "moduleMilestoneName"
      );
      const moduleNumberSpan = document.querySelector(
        ".milestone_header .module_number"
      );

      const urlParams = new URLSearchParams(window.location.search);
      const courseId = urlParams.get("courseid");
      const moduleId = urlParams.get("moduleid");
      const teachable_course_id = urlParams.get("teachableid");

      const targetCourse = result.enrolledcourses.find(
        (course) => course.id === parseInt(courseId)
      );

      if (targetCourse) {
        const targetModule = targetCourse.course_module.find(
          (module) => module.id === parseInt(moduleId)
        );

        if (targetModule) {
          milestoneHeader.textContent = targetModule.name;
          moduleMilestoneName.textContent = targetModule.name;
          moduleNumberSpan.textContent = `Module ${targetModule.position}`; // Set the module number

          console.log("Current Module:", targetModule);

          const studyMaterials = await fetchStudyMaterialsData(
            targetCourse.teachable_course_id,
            targetModule.lectures,
            userData
          );

          // Save study materials in local storage with expiration date one year from now
          const expirationDate = new Date();
          expirationDate.setFullYear(expirationDate.getFullYear() + 1);

          const studyMaterialsData = {
            studyMaterials,
            expiration: expirationDate.getTime(), // Save expiration date as timestamp
          };

          localStorage.setItem(
            "studyMaterialsForCurrentModule",
            JSON.stringify(studyMaterialsData)
          );

          console.log("Study Materials for Current Module:", studyMaterials);

          const sortedMilestones = studyMaterials.finalResult.sort(
            (a, b) => a.lecture.position - b.lecture.position
          );

          const milestonesContainer = document.querySelector(
            ".milestones_container"
          );

          const tooltip = document.getElementById("tooltip");

          const urlParams = new URLSearchParams(window.location.search);
          const moduleId = urlParams.get("moduleid");

          // // Function to calculate progress percentage
          // function calculateProgress(openedMilestones, totalMilestones) {
          //   return (openedMilestones / totalMilestones) * 100;
          // }

          let clickedMilestones = 0; // Define the clickedMilestones variable
          const totalMilestones = sortedMilestones.length; // Define the totalMilestones variable

          sortedMilestones.forEach((milestone, index) => {
            const milestoneElement = document.createElement("div");
            milestoneElement.classList.add("milestone_navigation");

            const lecture = milestone.lecture;

            const moduleKey = `module_${moduleId}`;

            if (lecture.attachments && lecture.attachments.length > 0) {
              lecture.attachments.forEach((attachment) => {
                const attachmentInfo = document.createElement("div");
                attachmentInfo.classList.add("attachment_info");

                let label = "";
                let icon = "";

                const attachmentStateKey = `${moduleKey}_${attachment.id}`; // Define attachmentStateKey

                if (attachment.kind === "quiz") {
                  label = "Practice Questions";
                  icon = "<i class='bx bx-book'></i>";

                  // Check if the attachment is marked as "opened" in local storage
                  const savedAttachmentState =
                    localStorage.getItem(attachmentStateKey);

                  if (savedAttachmentState === "opened") {
                    icon = "<i class='bx bx-check-circle'></i>";
                  }

                  attachmentInfo.addEventListener("click", () => {
                    const courseId = urlParams.get("courseid");
                    const moduleId = urlParams.get("moduleid");
                    const teachable_course_id = urlParams.get("teachableid");
                    const quizId = attachment.id; // Assuming the attachment has an ID property

                    // Check if the milestone is clicked for the first time
                    if (!savedAttachmentState) {
                      localStorage.setItem(attachmentStateKey, "opened");

                      // Calculate the expiration date (one year from now)
                      const expirationDate = new Date();
                      expirationDate.setFullYear(
                        expirationDate.getFullYear() + 1
                      );

                      // Save the expiration date in the local storage
                      localStorage.setItem(
                        `${attachmentStateKey}_expiration`,
                        expirationDate.getTime()
                      );

                      // Increment the clickedMilestones count
                      clickedMilestones++;

                      // Calculate the progress percentage based on clickedMilestones and totalMilestones
                      const progressPercentage =
                        (clickedMilestones / totalMilestones) * 100;

                      // Update the progress using the API
                      updateProgressToAPI(
                        progressPercentage,
                        moduleId,
                        teachable_course_id,
                        targetCourse.enrollment_source,
                        userToken
                      );
                    }

                    attachmentInfo.innerHTML = `
                      <i class='bx bx-check-circle'></i>
                      <div>
                        <span><b>${label}: ${capitalizedLectureName}</b></span>
                        <p>Module Content: ${lecturePosition}</p>
                      </div>
                    `;

                    const quizUrl = `quiz.html?courseid=${courseId}&teachableid=${teachable_course_id}&moduleid=${moduleId}&quizid=${quizId}`;

                    // Delay the redirection by 10 seconds
                    setTimeout(() => {
                      window.location.href = quizUrl; // Navigate to the constructed quiz URL
                    }, 10000); // 10000 milliseconds (10 seconds)
                  });
                } else if (attachment.kind === "video") {
                  label = "Video";
                  icon = "<i class='bx bx-play'></i>";

                  // Load attachment state from localStorage
                  const attachmentStateKey = `${moduleKey}_${attachment.id}`;
                  const savedAttachmentState =
                    localStorage.getItem(attachmentStateKey);

                  if (savedAttachmentState === "opened") {
                    icon = "<i class='bx bx-check-circle'></i>";
                  }

                  // Add click event listener for video attachment
                  attachmentInfo.addEventListener("click", async () => {
                    pdfContainer.style.display = "none";
                    videoPlayer.style.display = "block";
                    tooltip.style.display = "none";

                    const videoUrl = attachment.url;

                    const sourceMp4 = videoPlayer.querySelector(
                      "source[type='video/mp4']"
                    );
                    const sourceWebm = videoPlayer.querySelector(
                      "source[type='video/webm']"
                    );
                    sourceMp4.setAttribute("src", videoUrl);
                    sourceWebm.setAttribute("src", videoUrl);

                    videoPlayer.load();

                    // Change the icon to a checkmark
                    attachmentInfo.innerHTML = `
                      <i class='bx bx-check-circle'></i>
                      <div>
                        <span><b>${label}: ${capitalizedLectureName}</b></span>
                        <p>Module Content: ${lecturePosition}</p>
                      </div>
                    `;

                    // Save the attachment state as "opened" in local storage
                    localStorage.setItem(attachmentStateKey, "opened");

                    // Automatically start playing the video if there's saved progress
                    const savedProgressKey = `video_progress_${courseId}_${moduleId}_${lecture.position}`;
                    const savedProgress =
                      localStorage.getItem(savedProgressKey);

                    if (savedProgress) {
                      videoPlayer.currentTime = parseFloat(savedProgress);
                      videoPlayer.play(); // Automatically start playing
                    }

                    // Listen for time updates while the video is playing
                    videoPlayer.addEventListener("timeupdate", () => {
                      // Save the current progress in local storage
                      localStorage.setItem(
                        savedProgressKey,
                        videoPlayer.currentTime
                      );
                    });

                    // Check if the milestone is clicked for the first time
                    if (!savedAttachmentState) {
                      // Mark the attachment as opened
                      localStorage.setItem(attachmentStateKey, "opened");

                      // Increment the clickedMilestones count
                      clickedMilestones++;

                      // Calculate the progress percentage based on clickedMilestones and totalMilestones
                      const progressPercentage =
                        (clickedMilestones / totalMilestones) * 100;

                      // Update the progress using the API after a delay

                      await updateProgressToAPI(
                        progressPercentage,
                        moduleId,
                        teachable_course_id,
                        targetCourse.enrollment_source,
                        userToken
                      );
                    }
                  });

                  // Automatically start playing the video if there's saved progress
                  if (
                    savedAttachmentState === "opened" &&
                    videoPlayer.currentTime > 0
                  ) {
                    videoPlayer.load();
                    videoPlayer.play();
                  } else {
                    // If no saved progress, but the video was opened before, load the video
                    if (savedAttachmentState === "opened") {
                      videoPlayer.load();
                    }
                  }
                } else if (attachment.kind === "pdf_embed") {
                  label = "PDF";
                  icon = "<i class='bx bx-file'></i>";

                  // Check if the attachment is marked as "opened" in local storage
                  const savedAttachmentState =
                    localStorage.getItem(attachmentStateKey);

                  if (savedAttachmentState === "opened") {
                    icon = "<i class='bx bx-check-circle'></i>";
                  }

                  attachmentInfo.addEventListener("click", () => {
                    videoPlayer.style.display = "none";
                    videoPlayer.pause();
                    pdfContainer.style.display = "block";
                    tooltip.style.display = "none";

                    const pdfUrl = attachment.url;

                    const objectTag = pdfContainer.querySelector("object");
                    const iframeTag = pdfContainer.querySelector("iframe");
                    objectTag.setAttribute("data", pdfUrl);
                    iframeTag.setAttribute("src", pdfUrl);

                    // Check if the milestone is clicked for the first time
                    if (!savedAttachmentState) {
                      // Mark the attachment as opened
                      localStorage.setItem(attachmentStateKey, "opened");

                      // Increment the clickedMilestones count
                      clickedMilestones++;

                      // Calculate the progress percentage based on clickedMilestones and totalMilestones
                      const progressPercentage =
                        (clickedMilestones / totalMilestones) * 100;

                      // Update the progress using the API
                      updateProgressToAPI(
                        progressPercentage,
                        moduleId,
                        teachable_course_id,
                        userToken,
                        (course_type = targetCourse.enrollment_source)
                      );
                    }

                    attachmentInfo.innerHTML = `
                      <i class='bx bx-check-circle'></i>
                      <div>
                        <span><b>${label}: ${capitalizedLectureName}</b></span>
                        <p>Module Content: ${lecturePosition}</p>
                      </div>
                    `;
                  });
                }

                // Capitalize the first letter of each word in lecture name
                const lectureNameWords = lecture.name.split(" ");
                const lecturePosition = lecture.position;
                const capitalizedLectureName = lectureNameWords
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ");

                attachmentInfo.innerHTML = `
                  ${icon}
                  <div>
                    <span><b>${label}: ${capitalizedLectureName}</b></span>
                    <p>Module Content: ${lecturePosition}</p>
                  </div>
                `;

                milestoneElement.appendChild(attachmentInfo);
              });
            } else {
              const noAttachmentsInfo = document.createElement("p");
              noAttachmentsInfo.textContent =
                "No attachments available for this lecture.";
              milestoneElement.appendChild(noAttachmentsInfo);
            }
            milestonesContainer.appendChild(milestoneElement);
          });
        } else {
          console.log("Module not found for moduleId:", moduleId);
        }
      } else {
        console.log("Course not found for courseId:", courseId);
      }
    } else {
      console.log("User data or token not found in cookies.");
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
});

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

// Function to update progress to the API
async function updateProgressToAPI(
  percentage,
  moduleId,
  teachableCourseId,
  course_type = "loop_form"
) {
  const apiEndpoint =
    "https://backend.pluralcode.institute/student/track-module-progress";
  const userToken = getCookie("userToken"); // Get the userToken from the cookie

  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Authorization", `Bearer ${userToken}`); // Include the bearer token

  const requestBody = JSON.stringify({
    percentage: percentage.toFixed(2),
    module_id: moduleId,
    teachable_course_id: teachableCourseId,
    course_type: "loop_form",
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: requestBody,
    redirect: "follow",
  };

  try {
    const response = await fetch(apiEndpoint, requestOptions);
    const result = await response.json();
    console.log("API Result:", result.message);
  } catch (error) {
    console.error("Error updating progress:", error);
  }
}

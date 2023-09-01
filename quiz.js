document.addEventListener("DOMContentLoaded", async () => {
  // Logout
  const logoutButton = document.getElementById("logout_button"); // Replace with the actual ID of your logout button/link

  logoutButton.addEventListener("click", () => {
    logoutUser();
  });
  //setting the goback button to mimic the browser history button
  const goBackLink = document.getElementById("goBackLink");

  goBackLink.addEventListener("click", (event) => {
    event.preventDefault();
    window.history.back();
  });

  // getting the button element
  const submitButton = document.getElementById("submitQuiz");
  submitButton.classList.add("locked"); // Initially lock the button
  submitButton.style.color = "#f5f6fa";
  submitButton.style.backgroundColor = "#f8991d";

  try {
    // getting the teachable_course_id from the url
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get("courseid");
    const moduleId = urlParams.get("moduleid");
    const quizId = urlParams.get("quizid");
    const teachable_course_id = urlParams.get("teachableid");
    console.log("Course ID", courseId);
    console.log("Module ID", moduleId);
    console.log("Quiz ID", quizId);
    console.log("Teachable ID", teachable_course_id);

    // getting user token , data and main dashboard data
    const userToken = getCookie("userToken");
    console.log(userToken);

    const userData = JSON.parse(localStorage.getItem("userData"));
    console.log(userData);

    const mainData = JSON.parse(localStorage.getItem("apiData"));
    console.log(mainData);

    if (userData && userToken) {
      // if user toekn and data is present populate the user profile in the dashboard header
      const profileName = document.querySelector(".user_name");
      const studentId = document.querySelector(".student_id");
      const initials = document.querySelector(".initials span");

      profileName.textContent = userData.name;
      studentId.textContent = `Student ID: ${userData.id}`;

      if (userData.name) {
        const firstName = userData.name.split(" ")[0];
        const firstInitial = firstName.charAt(0).toUpperCase();
        initials.textContent = firstInitial;
      }

      const studyMaterialsDataLocalStorage = JSON.parse(
        localStorage.getItem("studyMaterialsForCurrentModule")
      );
      console.log(
        "Study Materials Data For Current Module (LocalStorage):",
        studyMaterialsDataLocalStorage
      );

      const quizData =
        studyMaterialsDataLocalStorage.studyMaterials.finalResult.find(
          (item) => item.lecture.name === "Quiz"
        );

      if (quizData && quizData.lecture.attachments) {
        const quizAttachment = quizData.lecture.attachments.find(
          (attachment) => attachment.kind === "quiz"
        );

        const quizQuestions = quizAttachment.quiz.questions;

        if (quizAttachment && quizQuestions) {
          const quizContainer = document.getElementById("quiz_container");
          const quizResult = document.getElementById("quiz_results");

          // loop through the questions attachment and render the questions
          quizQuestions.forEach((question, index) => {
            const questionElement = document.createElement("div");
            questionElement.classList.add("quiz_main_question");
            questionElement.innerHTML = `<h4>${index + 1}: ${
              question.question
            }</h4>`;

            const answersElement = document.createElement("ul");
            answersElement.classList.add("answers");

            question.answers.forEach((answer, answerIndex) => {
              const answerItem = document.createElement("li");

              const radioInput = document.createElement("input");
              radioInput.type = "radio";
              radioInput.name = `question_${index}`;
              radioInput.value = answerIndex; // Store the index of the selected answer

              radioInput.addEventListener("change", () => {
                storeUserAnswer(quizId, index, answerIndex);

                // Check if all questions have been answered
                const allQuestionsAnswered = quizQuestions.every(
                  (question, idx) => {
                    const stored = getUserAnswers(quizId);
                    return stored && stored[idx] !== undefined;
                  }
                );

                // Enable or disable the submit button based on answers
                if (allQuestionsAnswered) {
                  submitButton.classList.remove("locked");
                } else {
                  submitButton.classList.add("locked");
                }
              });

              // Retrieve user's answer selection from localStorage
              const storedAnswers = getUserAnswers(quizId);
              if (storedAnswers && storedAnswers[index] !== answerIndex) {
                radioInput.checked = true; // Set the radio button as selected
              }

              const answerLabel = document.createElement("label");
              answerLabel.textContent = answer;

              // Check if all questions have been answered
              const allQuestionsAnswered = quizQuestions.every(
                (question, idx) => {
                  const stored = getUserAnswers(quizId);
                  return stored && stored[idx] !== undefined;
                }
              );

              // Enable or disable the submit button based on answers
              if (allQuestionsAnswered) {
                submitButton.classList.remove("locked");
              } else {
                submitButton.classList.add("locked");
              }

              console.log("all Questions answered", allQuestionsAnswered);

              answerItem.appendChild(radioInput);
              answerItem.appendChild(answerLabel);
              answersElement.appendChild(answerItem);
            });

            questionElement.appendChild(answersElement);
            quizContainer.appendChild(questionElement);

            // Print correct answers to console
            console.log(
              `Correct Answer for Question ${
                index + 1
              }: ${question.correct_answers.join(", ")}`
            );

            const nextModule = document.getElementById("next_module");
            const tryAgain = document.getElementById("try_again");

            //Submit button
            submitButton.addEventListener("click", () => {
              quizResult.classList.add("show");

              quizContainer.style.display = "none";

              const scoreElement = document.getElementById("score");
              const congratsText = document.getElementById("congrats");
              const failedText = document.getElementById("failed");

              nextModule.style.display = "none";
              tryAgain.style.display = "none";
              congratsText.style.display = "none";
              failedText.style.display = "none";

              let userScore = 0;
              const totalQuestions = quizQuestions.length;

              quizQuestions.forEach((question, index) => {
                const storedAnswers = getUserAnswers(quizId);
                const userAnswerIndex = storedAnswers
                  ? storedAnswers[index]
                  : undefined;

                const correctAnswerIndices = question.answers.reduce(
                  (indices, answer, answerIndex) => {
                    if (question.correct_answers.includes(answer)) {
                      indices.push(answerIndex);
                    }
                    return indices;
                  },
                  []
                );

                if (
                  userAnswerIndex !== undefined &&
                  correctAnswerIndices.includes(userAnswerIndex)
                ) {
                  userScore += 1;
                }
              });

              const percentageScore = (userScore / totalQuestions) * 100;

              if (percentageScore >= 70) {
                congratsText.style.display = "block";
                nextModule.style.display = "block";
              } else {
                tryAgain.style.display = "block";
                failedText.style.display = "block";
              }

              if (percentageScore < 70) {
                scoreElement.style.color = "red";
              }

              scoreElement.textContent = `${Math.floor(percentageScore)}%`;
              scoreElement.style.color = "green";
            });
            // Try AGain Button
            tryAgain.addEventListener("click", (e) => {
              e.preventDefault();

              // Hide the results and show the quiz
              quizResult.classList.remove("show");
              quizContainer.style.display = "block";

              // Iterate through user selections and adjust styles
              question.answers.forEach((answer, answerIndex) => {
                const answerItem = answersElement.querySelector(
                  `li:nth-child(${answerIndex + 1})`
                );
                const storedAnswers = getUserAnswers(quizId);
                const userAnswerIndex = storedAnswers
                  ? storedAnswers[index]
                  : undefined;
                const answerLabel = answerItem.querySelector("label");

                if (userAnswerIndex === answerIndex) {
                  if (question.correct_answers.includes(answer)) {
                    answerLabel.classList.add("correct-answer");
                    answerLabel.classList.remove("incorrect-answer");
                  } else {
                    answerLabel.classList.add("incorrect-answer");
                    answerLabel.classList.remove("correct-answer");
                  }
                } else {
                  answerItem.classList.remove(
                    "correct-answer",
                    "incorrect-answer"
                  );
                  answerLabel.classList.remove(
                    "correct-text",
                    "incorrect-text"
                  );
                }
              });
            });
            //Next Module
            const nextModuleButton = document.getElementById("next_module");

            nextModuleButton.addEventListener("click", () => {
              try {
                // Calculate the user's score
                const userScore = calculateUserScore(quizQuestions, quizId);

                // Set the flag indicating quiz completion
                localStorage.setItem("quizCompleted", "true");

                // Get the current timestamp and add one year in milliseconds
                const expirationDate = new Date();
                expirationDate.setFullYear(expirationDate.getFullYear() + 1);

                const urlParams = new URLSearchParams(window.location.search);
                const courseId = urlParams.get("courseid"); // Use the course ID

                // Create a unique key using the course ID and quiz ID
                const storageKey = `userScore_${courseId}_${quizId}`;

                // Save the user's score and expiration date in local storage
                const scoreData = {
                  userScore: userScore,
                  quizId: quizId,
                  expirationDate: expirationDate.getTime(),
                };
                localStorage.setItem(storageKey, JSON.stringify(scoreData));

                console.log(userScore, quizId);

                // Redirect the user to the my-courses.html page with the current course ID
                window.location.href = `my-courses.html?courseid=${courseId}`;
              } catch (error) {
                console.error("Error:", error);
              }
            });
          });
        }
      }
    }
  } catch (error) {
    console.error("Error:", error);
  }
});

// GEt Cookie
function getCookie(cookieName) {
  const cookies = document.cookie.split("; ");
  for (const cookie of cookies) {
    const [name, value] = cookie.split("=");
    if (name === cookieName) {
      return value;
    }
  }
  return null;
}

//Store USer Answer
function storeUserAnswer(quizId, questionIndex, answerIndex) {
  const storageKey = `userAnswers_${quizId}`;
  let userAnswers = JSON.parse(localStorage.getItem(storageKey)) || {};

  userAnswers[questionIndex] = answerIndex;
  localStorage.setItem(storageKey, JSON.stringify(userAnswers));
}

//Get user answers
function getUserAnswers(quizId) {
  const storageKey = `userAnswers_${quizId}`;
  return JSON.parse(localStorage.getItem(storageKey));
}

// Function to unlock the next module using the API
async function unlockNextModule(payload) {
  const apiUrl =
    "https://backend.pluralcode.institute/student/unlock-loop-module";
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  // Retrieve user token from cookies or wherever you store it
  const userToken = getCookie("userToken");
  if (!userToken) {
    alert("User Credentials Not Found");
    return;
  }

  myHeaders.append("Authorization", `Bearer ${userToken}`);

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify(payload),
    redirect: "follow",
  };

  const response = await fetch(apiUrl, requestOptions);
  const result = await response.json();
  return result;
}

function calculateUserScore(quizQuestions, quizId) {
  let userScore = 0;
  const totalQuestions = quizQuestions.length;

  quizQuestions.forEach((question, index) => {
    const storedAnswers = getUserAnswers(quizId);
    const userAnswerIndex = storedAnswers ? storedAnswers[index] : undefined;

    const correctAnswerIndices = question.answers.reduce(
      (indices, answer, answerIndex) => {
        if (question.correct_answers.includes(answer)) {
          indices.push(answerIndex);
        }
        return indices;
      },
      []
    );

    if (
      userAnswerIndex !== undefined &&
      correctAnswerIndices.includes(userAnswerIndex)
    ) {
      userScore += 1;
    }
  });

  const percentageScore = (userScore / totalQuestions) * 100;
  return Math.floor(percentageScore);
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

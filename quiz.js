document.addEventListener("DOMContentLoaded", async () => {
  const goBackLink = document.getElementById("goBackLink");

  goBackLink.addEventListener("click", (event) => {
    event.preventDefault();
    window.history.back();
  });

  const submitButton = document.getElementById("submitQuiz");
  submitButton.classList.add("locked"); // Initially lock the button
  submitButton.style.color = "#f5f6fa";
  submitButton.style.backgroundColor = "#f8991d";

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get("courseid");
    const moduleId = urlParams.get("moduleid");
    const quizId = urlParams.get("quizid");
    const teachable_course_id = urlParams.get("teachableid");
    console.log("Course ID", courseId);
    console.log("Module ID", moduleId);
    console.log("Quiz ID", quizId);
    console.log("Teachable ID", quizId);

    const userToken = getCookie("userToken");
    console.log(userToken);

    const userData = JSON.parse(localStorage.getItem("userData"));
    console.log(userData);

    const mainData = JSON.parse(localStorage.getItem("apiData"));
    console.log(mainData);

    if (userData && userToken) {
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
        "Study Materials Data (LocalStorage):",
        studyMaterialsDataLocalStorage
      );

      const quizData =
        studyMaterialsDataLocalStorage.studyMaterials.finalResult.find(
          (item) => item.lecture.name === "Quiz"
        );

      if (quizData && quizData.lecture.attachments) {
        const quizContainer = document.querySelector(".quiz_container");

        const quizAttachment = quizData.lecture.attachments.find(
          (attachment) => attachment.kind === "quiz"
        );

        const quizQuestions = quizAttachment.quiz.questions;

        if (quizAttachment && quizQuestions) {
          const quizContainer = document.getElementById("quiz_container");
          const quizResult = document.getElementById("quiz_results");
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
                // Store the user's answer selection in localStorage
                storeUserAnswer(quizId, index, answerIndex);
              });

              // Retrieve user's answer selection from localStorage
              const storedAnswers = getUserAnswers(quizId);
              if (storedAnswers && storedAnswers[index] === answerIndex) {
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

              console.log(allQuestionsAnswered);

              // Enable or disable the submit button based on answers
              if (allQuestionsAnswered) {
                submitButton.classList.remove("locked");
              } else {
                submitButton.classList.add("locked");
              }

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

            nextModuleButton.addEventListener("click", async () => {
              try {
                const urlParams = new URLSearchParams(window.location.search);
                const quizId = urlParams.get("quizid");
                const userScore = calculateUserScore(quizQuestions, quizId);

                if (userScore >= 70) {
                  // Unlock the next module using the API
                  const unlockResult = await unlockNextModule(
                    courseId,
                    moduleId,
                    userScore
                  );
                  console.log(moduleId)

                  // After successfully unlocking the next module
                  if (
                    unlockResult.message ===
                    "congratulations next module unlocked"
                  ) {
                    // Handle the successful unlocking of the next module
                    console.log("Next module unlocked successfully!");

                    // Store the unlocked module ID in localStorage
                    localStorage.setItem("unlockedModuleId", moduleId);

                    // Find the index of the unlocked module in the course_module array
                    const unlockedModuleIndex =
                      mainData.enrolledcourses[0].course_module.findIndex(
                        (module) => module.id === parseInt(moduleId)
                      );

                    if (
                      unlockedModuleIndex !== -1 &&
                      unlockedModuleIndex <
                        mainData.enrolledcourses[0].course_module.length - 1
                    ) {
                      // Get the next module
                      const nextModule =
                        mainData.enrolledcourses[0].course_module[
                          unlockedModuleIndex + 1
                        ];

                      // Store the ID of the next module in localStorage
                      localStorage.setItem("nextModule", nextModule.id);

                      // Redirect the user back to the my-courses.html page with the updated courseid parameter
                      setTimeout(() => {
                        // Save the next module ID to local storage
                        // localStorage.setItem("nextModuleId", nextModule.id);

                        // window.location.href = `my-courses.html?courseid=${courseId}`;
                        console.log("Done");
                        console.log(nextModule.id);
                        console.log(teachable_course_id);
                        console.log(userScore);
                      }, 10000);
                    } else {
                      console.log("No next module available.");
                    }
                  }
                } else {
                  console.log(
                    "User's score is below 70. Cannot unlock the next module."
                  );
                }
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
async function unlockNextModule(userScore) {
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

  // Retrieve course and module IDs from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get("teachableid");

  // Retrieve moduleId from local storage
  const moduleId = localStorage.getItem("nextModule");

  const requestBody = JSON.stringify({
    course_id: courseId,
    module_id: moduleId,
    quizscore: userScore,
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: requestBody,
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

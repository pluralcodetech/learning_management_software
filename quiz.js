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

    const userDataString = JSON.parse(getCookie("userData"));
    const mainData = JSON.parse(getCookie("apiData"));
    const userToken = getCookie("userToken");

    console.log("userData:", userDataString);
    console.log("userToken:", userToken);
    console.log("Main Data:", mainData);

    if (userDataString && userToken) {
      const profileNameElement = document.querySelector(".user_name");
      const studentIdElement = document.querySelector(".student_id");
      const initialsElement = document.querySelector(".initials span");

      profileNameElement.textContent = userDataString.name;
      studentIdElement.textContent = `Student ID: ${userDataString.id}`;

      if (userDataString.name) {
        const firstName = userDataString.name.split(" ")[0];
        const firstInitial = firstName.charAt(0).toUpperCase();
        initialsElement.textContent = firstInitial;
      }

      console.log("Course ID", courseId);
      console.log("Module ID", moduleId);
      console.log("Quiz ID", quizId);

      // Retrieve study material data from local storage
      const studyMaterialsDataLocalStorage = JSON.parse(
        localStorage.getItem("studyMaterialsData")
      );
      console.log(
        "Study Materials Data (LocalStorage):",
        studyMaterialsDataLocalStorage
      );

      if (
        studyMaterialsDataLocalStorage &&
        studyMaterialsDataLocalStorage.finalResult
      ) {
        const lecture = studyMaterialsDataLocalStorage.finalResult[0].lecture;

        if (lecture.attachments && lecture.attachments[0].quiz) {
          const quizData = lecture.attachments[0].quiz;
          const quizQuestions = quizData.questions;

          const quizContainer = document.getElementById("quiz_container");

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
          });
        }
      }


    } else {
      // Handle the case when user data or token is not available
    }
  } catch (error) {
    console.error("Error:", error);
  }
});

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

function storeUserAnswer(quizId, questionIndex, answerIndex) {
  const storageKey = `userAnswers_${quizId}`;
  let userAnswers = JSON.parse(localStorage.getItem(storageKey)) || {};

  userAnswers[questionIndex] = answerIndex;
  localStorage.setItem(storageKey, JSON.stringify(userAnswers));
}

function getUserAnswers(quizId) {
  const storageKey = `userAnswers_${quizId}`;
  return JSON.parse(localStorage.getItem(storageKey));
}

function calculateScores(quizId, questions) {
  const storedAnswers = getUserAnswers(quizId);
  let score = 0;

  questions.forEach((question, index) => {
    if (
      storedAnswers &&
      storedAnswers[index] !== undefined &&
      storedAnswers[index] === question.correct_answers[0]
    ) {
      score++;
    }
  });

  console.log("User Score:", score);
}

function highlightAnswers(quizId, questions) {
  const storedAnswers = getUserAnswers(quizId);

  questions.forEach((question, index) => {
    const answerIndex = storedAnswers ? storedAnswers[index] : undefined;

    const questionElement = document.querySelector(
      `.quiz_main_question:nth-child(${index + 1})`
    );

    if (questionElement) {
      const answersElement = questionElement.querySelector(".answers");
      const answerItems = answersElement.querySelectorAll("li");

      answerItems.forEach((answerItem, answerItemIndex) => {
        if (answerItemIndex === answerIndex) {
          answerItem.classList.add("selected-answer");
          if (answerItemIndex === question.correct_answers[0]) {
            answerItem.classList.add("correct-answer");
          } else {
            answerItem.classList.add("incorrect-answer");
          }
        } else {
          answerItem.classList.remove("selected-answer");
        }
      });
    }
  });
}

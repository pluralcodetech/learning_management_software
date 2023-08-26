// Get the current URL
const currentUrl = window.location.href;

// Create a URL object from the current URL
const url = new URL(currentUrl);

// Get the moduleid, courseid, and quizid parameters from the URL
const moduleId = url.searchParams.get("moduleid");
const courseId = url.searchParams.get("courseid");
const quizId = url.searchParams.get("quizid");

// Now you have the module ID, course ID, and quiz ID from the URL
console.log("Module ID:", moduleId);
console.log("Course ID:", courseId);
console.log("Quiz ID:", quizId);

// Retrieve the studyMaterial data from session storage
const studyMaterialData = sessionStorage.getItem("studyMaterialsData");

// Parse the JSON data if needed
const parsedStudyMaterial = JSON.parse(studyMaterialData);

// Now you have the studyMaterial data
console.log("Study Material Data:", parsedStudyMaterial);

// Assuming parsedStudyMaterial contains studyMaterialsData
const quizData = parsedStudyMaterial.finalResult[0].lecture.attachments.find(
  (attachment) => attachment.kind === "quiz"
);

if (quizData && quizData.quiz) {
  const quizQuestions = quizData.quiz.questions;

  // Get a reference to the quiz container in your HTML
  const quizContainer = document.querySelector(".quiz_container");
  const submitButton = document.getElementById("submitQuiz");

  // Create an array to keep track of answered questions
  const answeredQuestions = new Array(quizQuestions.length).fill(false);

  // Function to check if all questions are answered
  const checkAllQuestionsAnswered = () => {
    const allAnswered = answeredQuestions.every((answered) => answered);
    if (allAnswered) {
      submitButton.classList.remove("clickable");
      submitButton.style.backgroundColor = "#f8991d";
      submitButton.style.color = "#f5f6fa";
    } else {
      submitButton.classList.add("clickable");
    }
  };

  // Loop through the quiz questions and options
  quizQuestions.forEach((question, questionIndex) => {
    const questionElement = document.createElement("div");
    questionElement.classList.add("quiz_main_question");

    const questionText = document.createElement("p");
    questionText.textContent = question.question;
    questionElement.appendChild(questionText);

    const optionsList = document.createElement("ul");
    question.answers.forEach((option, optionIndex) => {
      const optionItem = document.createElement("li");
      const radioInput = document.createElement("input");
      radioInput.type = "radio";
      radioInput.name = `question_${questionIndex}`;
      radioInput.value = option;
      optionItem.appendChild(radioInput);

      const optionLabel = document.createElement("label");
      optionLabel.textContent = option;
      optionItem.appendChild(optionLabel);

      // Add event listener to radio input
      radioInput.addEventListener("change", () => {
        answeredQuestions[questionIndex] = true;
        checkAllQuestionsAnswered();
      });

      // Assuming the rest of your code remains the same

      // Get a reference to the submit button in your HTML
      const submitButton = document.getElementById("submitQuiz");

      // Add event listener to the submit button
      submitButton.addEventListener("click", () => {
        // Compare user's answers with correct answers
        const results = [];
        quizQuestions.forEach((question, questionIndex) => {
          const userAnswerIndex = document.querySelector(
            `input[name="question_${questionIndex}"]:checked`
          );
          if (userAnswerIndex !== null) {
            const userAnswer = question.answers[userAnswerIndex.value];
            const correctAnswers = question.correct_answers;

            const isCorrect = correctAnswers.includes(userAnswer);
            results.push({ question: question.question, isCorrect });
          }
        });

        // Display results using a tooltip or other method
        console.log(results); // For demonstration purposes

        // You can also update the tooltip content dynamically
        const tooltip = document.createElement("div");
        tooltip.className = "quiz-results-tooltip";
        results.forEach((result) => {
          const resultElement = document.createElement("p");
          resultElement.textContent =
            result.question +
            ": " +
            (result.isCorrect ? "Correct" : "Incorrect");
          tooltip.appendChild(resultElement);
        });

        // Append the tooltip to a suitable location in your HTML
        document.body.appendChild(tooltip);
      });

      optionsList.appendChild(optionItem);
    });
    questionElement.appendChild(optionsList);

    // Append the question element to the quiz container
    quizContainer.appendChild(questionElement);
  });
  // Initially check if all questions are answered
  checkAllQuestionsAnswered();
} else {
  console.error("Quiz data not found in studyMaterialsData.");
}

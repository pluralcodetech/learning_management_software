// Get the current URL
const currentUrl = window.location.href;

// Create a URL object from the current URL
const url = new URL(currentUrl);

// Get the moduleid, courseid, and quizid parameters from the URL
const moduleId = url.searchParams.get("moduleid");
const courseId = url.searchParams.get("courseid");
const quizId = url.searchParams.get("quizid");

// Retrieve the studyMaterial data from session storage
const studyMaterialData = sessionStorage.getItem("studyMaterialsData");
console.log(studyMaterialData);

// Parse the study material data
const parsedStudyMaterial = JSON.parse(studyMaterialData);

// Access the quiz questions
const questions =
  parsedStudyMaterial.finalResult[0].lecture.attachments[0].quiz.questions;

// Get the quiz container element by ID
const quizContainer = document.getElementById("quiz_container");

// Create a string to store the HTML content
let htmlContent = "";

// Iterate through the questions
questions.forEach((question, index) => {
  // Build the HTML for each question
  htmlContent += `<div class="quiz_main_question">
    <p><strong>${index + 1}:</strong> ${question.question}</p>
    <ul class="answer-options">`;

  // Add answer options to the HTML content
  question.answers.forEach((answer, ansIndex) => {
    htmlContent += `<li>
      <input type="radio" name="question_${index}" value="${ansIndex}">
      ${String.fromCharCode(97 + ansIndex)}. ${answer}
    </li>`;
  });

  // Close the answer options list
  htmlContent += "</ul>";

  // Add correct answer(s) to the HTML content
  htmlContent += `<p><strong>Correct Answer:</strong> ${question.correct_answers.join(
    ", "
  )}</p></div>`;
});

// Set the generated HTML content to the quiz container
quizContainer.innerHTML = htmlContent;

// Create a Submit Quiz button
const submitButton = document.createElement("button");
submitButton.textContent = "Submit Quiz";
submitButton.id = "submitQuiz";

// Append the button to the quiz container
quizContainer.appendChild(submitButton);

// Add "clickable" class to the button initially
submitButton.classList.add("clickable");
submitButton.style.backgroundColor = "#f8991d";
submitButton.style.color = "#f5f6fa";

// Function to check if all questions are answered
function checkAllQuestionsAnswered() {
  const radioGroups = document.querySelectorAll(".answer-options");
  for (let i = 0; i < radioGroups.length; i++) {
    const selectedRadio = radioGroups[i].querySelector(
      'input[type="radio"]:checked'
    );
    if (!selectedRadio) {
      return false; // Return false if any question is not answered
    }
  }
  return true; // All questions are answered
}

// Function to toggle "clickable" class on the button
function toggleClickableClass() {
  if (checkAllQuestionsAnswered()) {
    submitButton.classList.remove("clickable");
  } else {
    submitButton.classList.add("clickable");
  }
}

// Function to update local storage with user selections
function updateLocalStorage() {
  const selections = {};
  radioButtons.forEach((radio) => {
    if (radio.checked) {
      const questionIndex = parseInt(radio.name.split("_")[1]);
      selections[questionIndex] = parseInt(radio.value);
    }
  });
  localStorage.setItem("userSelections", JSON.stringify(selections));
}

// Add change event listeners to all radio buttons
const radioButtons = document.querySelectorAll('input[type="radio"]');
radioButtons.forEach((radio) => {
  radio.addEventListener("change", toggleClickableClass);
});

// Initial check of all questions answered
toggleClickableClass();

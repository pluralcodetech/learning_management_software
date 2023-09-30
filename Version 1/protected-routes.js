(function () {
  // Check if the user is authorized (userToken exists in cookies)
  const userToken = getCookie("userToken");
  if (!userToken) {
    // Delayed redirection to the error page after 2 seconds
    setTimeout(function () {
      window.location.href = "index.html"; // Replace with the actual URL of your error page
    }, 3000); // 3000 milliseconds = 3 seconds
  }
})();

// Function to get the value of a specific cookie
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

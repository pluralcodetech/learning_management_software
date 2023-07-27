//Nav item toggle logic
document.addEventListener("DOMContentLoaded", () => {
  const navItems = document.querySelectorAll(".nav-item");

  function setActiveNavItem() {
    const currentPage = window.location.pathname.split("/").pop();
    navItems.forEach((navItem) => {
      const href = navItem
        .querySelector("a")
        .getAttribute("href")
        .split("/")
        .pop();
      if (currentPage === href) {
        navItem.classList.add("active");
      } else {
        navItem.classList.remove("active");
      }
    });
  }

  setActiveNavItem();

  navItems.forEach((navItem) => {
    navItem.addEventListener("click", () => {
      navItems.forEach((item) => item.classList.remove("active"));

      navItem.classList.add("active");

      localStorage.setItem("lastClickedItemIndex", index);
    });
  });
});

// Function to toggle active filter button and show corresponding cards
function showCards(filter) {
  const buttons = document.querySelectorAll(".filter_buttons button");
  buttons.forEach((button) => {
    button.classList.toggle("active", button.id === filter + "_button");
  });

  const courseCards = document.getElementById("course_cards");
  courseCards.innerHTML = "";
  if (filter === "my_courses") {
    courseCards.innerHTML = `
        <div class="course_card">
          <img src="./assets/prodcut.png" alt="" />
          <div>
            <span>Product Design</span>
            <p>
              Learn Ui/Ux from scratch without writing a single code.
              Master how to design high fidelity interface with FIGMA,
              design journey mapping and empathize with users.
            </p>
          </div>
          <a href="./my-courses.html">Course Details <span>&rarr;</span></a>
        </div>
        <div class="course_card">
          <img src="./assets/mgt.png" alt="" />
          <div>
            <span>Product Management</span>
            <p>
            Become a professional product manager in 8 weeks. Learn how to gather users data, identify their needs and how it benefits them.
            </p>
          </div>
          <a href="./my-courses.html">Course Details <span>&rarr;</span></a>
        </div>
        <!-- Add other course cards for "My Courses" here -->
      `;
  } else if (filter === "certificates") {
    courseCards.innerHTML = `
    <div class="course_certificate_container">
    <div class="course_card_certificate">
      <img src="./assets/cert.png" alt="" />
      <div>
        <h3>Product Management</h3>
        <p>Successfully Completed</p>
        <button><i class="bx bx-download"></i>Download</button>
      </div>
      <button class="view" id="view_certificate">View</button>
    </div>
</div>
        <!-- Add other course cards for "Certificates" here -->
      `;
    // Update the variable names to certificate_modal and close_certificate here
    const certificate_modal = document.getElementById("certificate_modal");

    // Certificate modal pop-up
    const view_certificate = document.getElementById("view_certificate");

    view_certificate.addEventListener("click", () => {
      certificate_modal.style.display = "block"; // Show the modal

      // Wait for the next frame, then add the "visible" class to initiate the transition
      requestAnimationFrame(() => {
        certificate_modal.classList.add("visible");
      });
    });
  }
}

document
  .getElementById("my_courses_button")
  .addEventListener("click", function () {
    showCards("my_courses");
  });

document
  .getElementById("certificates_button")
  .addEventListener("click", function () {
    showCards("certificates");
  });

showCards("my_courses");

const close_cert = document.getElementById("close_cert");
const certificate_modal = document.getElementById("certificate_modal");

close_cert.addEventListener("click", () => {
  // Remove the "visible" class to initiate the transition
  certificate_modal.style.display = "none";
});

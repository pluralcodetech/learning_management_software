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

// JavaScript to handle filter button clicks and div visibility
const buttons = document.querySelectorAll(".course_page_filters button");
const divs = document.querySelectorAll(".course_page_cards > div");

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.getAttribute("data-filter");

    buttons.forEach((btn) => {
      if (btn === button) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    divs.forEach((div) => {
      if (div.classList.contains(target)) {
        div.style.display = "block";
      } else {
        div.style.display = "none";
      }
    });
  });
});

// Set the initial active state for the "Course Modules" button and div
const initialActiveButton = document.querySelector(
  ".course_page_filters button.active"
);
const initialTarget = initialActiveButton.getAttribute("data-filter");
const initialActiveDiv = document.querySelector(`.${initialTarget}`);
if (initialActiveDiv) {
  initialActiveDiv.style.display = "block";
}

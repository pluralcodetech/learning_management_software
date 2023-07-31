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
const buttonsToHide = document.querySelectorAll(
  ".hide_community_button, .hide_search_bar"
);

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

    // Hide specific buttons when the "Payment Status" filter is clicked
    if (target === "payment") {
      buttonsToHide.forEach((btn) => {
        btn.style.display = "none";
      });
    } else {
      buttonsToHide.forEach((btn) => {
        btn.style.display = "inline-block"; // or "block" depending on your buttons' display style
      });
    }
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

// copy bank details
const copy_bank_details = document.getElementById("copy_bank_details");

copy_bank_details.addEventListener("click", copyDetails);

function copyDetails() {
  let account_number_input = document.getElementById("account_number");
  let account_number_tooltip = document.getElementById(
    "account_number_tooltip"
  );

  account_number_input.select();
  document.execCommand("copy");

  account_number_tooltip.innerHTML = "Account Number Copied";

  // Show the tooltip
  account_number_tooltip.style.display = "flex";

  // Hide the tooltip after 3 seconds
  setTimeout(function () {
    account_number_tooltip.innerHTML = "";
    account_number_tooltip.style.display = "none";
  }, 3000);
}

// Payment section popup
const showPaymentButton = document.getElementById("show_payment_button");
const paymentCCSection = document.querySelector(".payment_CC");

showPaymentButton.addEventListener("click", function () {
  paymentCCSection.style.display = "block";
});

const closePaymentCCButton = document.getElementById("close_payment_CC");

closePaymentCCButton.addEventListener("click", function () {
  paymentCCSection.style.display = "none";
});

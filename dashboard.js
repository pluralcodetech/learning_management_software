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

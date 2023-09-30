const menu_toggle = document.getElementById("menu_toggle");
const menu_toggle2 = document.getElementById("menu_toggle2");
const nav_list = document.getElementById("nav_list");

menu_toggle2.style.display = "none";

menu_toggle.addEventListener("click", () => {
  nav_list.classList.add("active");
  menu_toggle.style.display="none"
  menu_toggle2.style.display="block"
});
menu_toggle2.addEventListener("click", () => {
  nav_list.classList.remove("active");
  menu_toggle.style.display="block"
  menu_toggle2.style.display="none"
});

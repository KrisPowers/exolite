lucide.createIcons();

const sidebar = document.getElementById("sidebar");
const toggleBtn = document.getElementById("toggleSidebar");
const navItems = document.querySelectorAll(".nav-item");
const pageTitle = document.getElementById("pageTitle");

toggleBtn.addEventListener("click", () => {
  sidebar.classList.toggle("collapsed");

  toggleBtn.innerHTML = sidebar.classList.contains("collapsed")
    ? '<i data-lucide="chevron-right"></i>'
    : '<i data-lucide="chevron-left"></i>';

  lucide.createIcons();
});

navItems.forEach(item => {
  item.addEventListener("click", e => {
    e.preventDefault();

    navItems.forEach(i => i.classList.remove("active"));
    item.classList.add("active");

    pageTitle.textContent = item.querySelector("span")?.textContent || "";
  });
});

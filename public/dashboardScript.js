// dashboard script begins here
document.addEventListener("DOMContentLoaded", async function () {
  try {
    const response = await fetch("/api/dashboard", {
      method: "GET",
      credentials: "include", // Include session cookie
    });

    if (response.status === 200) {
      const patient = await response.json();
      document.getElementById(
        "user-name"
      ).textContent = `${patient.first_name} ${patient.last_name}`;
    } else {
      window.location.href = "/"; // Redirect to login if unauthorized
    }
  } catch (error) {
    console.error("Error fetching user details:", error);
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const logoutButton = document.getElementById("logout-button");

  logoutButton.addEventListener("click", async function () {
    try {
      const response = await fetch("/logout", {
        method: "POST",
        credentials: "include", // Include session cookie in the request
      });

      if (response.status === 200) {
        alert("Logout successful!");
        window.location.href = "/"; // Redirect to login page
      } else {
        const result = await response.json();
        alert(result.message || "Logout failed.");
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  });
});

// Navbar side menu open & close toggler begins here

var sideMenu = document.getElementById("sidemenu");

function openMenu() {
  sideMenu.style.left = "0";
}

function closeMenu() {
  sideMenu.style.left = "-200px";
}

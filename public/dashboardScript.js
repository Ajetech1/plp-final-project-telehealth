// dashboard script begins here
document.addEventListener("DOMContentLoaded", async function () {
  try {
    const response = await fetch("/api/dashboard", {
      method: "GET",
      credentials: "include", // Include session cookie
    });

    if (response.status === 200) {
      const patient = await response.json();
      const fullName = `${patient.first_name} ${patient.last_name}`;
      const phoneNumber = patient.phone;

      // Check the current page and apply the appropriate logic
      if (window.location.pathname.includes("/dashboard")) {
        // For dashboard.html, update textContent
        const patientNameElement = document.getElementById(
          "patient-name-display"
        );
        if (patientNameElement) {
          patientNameElement.textContent = fullName;
        }
      } else if (window.location.pathname.includes("profilesettings.html")) {
        // For profilesetting.html, update the value of the input field
        const patientNameInput = document.getElementById("patient-name");
        const phoneNumberInput = document.getElementById("phone");
        if (patientNameInput) {
          patientNameInput.value = fullName;
        }
        if (phoneNumberInput) {
          phoneNumberInput.value = phoneNumber;
        }
      }
    } else {
      const data = await response.json();
      throw new Error(data.message || "Unauthorized");
    }
  } catch (error) {
    console.error("Error fetching user details:", error);
    alert(error.message);
    window.location.href = "/patient/login";
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

// Avatar Profile begins here

function toggleDropdown() {
  const dropdown = document.getElementById("dropdownMenu");
  dropdown.classList.toggle("active");
}

document.addEventListener("click", function (e) {
  const dropdown = document.getElementById("dropdownMenu");
  const profileAvatar = document.querySelector(".user-icon");
  if (!profileAvatar.contains(e.target) && !dropdown.contains(e.target)) {
    dropdown.classList.remove("active");
  }
});

// Profile settings page begins here
function loadImage(event) {
  const image = document.getElementById("profile-image");
  image.src = URL.createObjectURL(event.target.files[0]);
}

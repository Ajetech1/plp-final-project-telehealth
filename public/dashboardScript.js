// dashboard script begins here
document.addEventListener("DOMContentLoaded", async function () {
  const loadingIndicator = document.getElementById("loading-indicator");

  try {
    if (loadingIndicator) {
      loadingIndicator.style.display = "block";
    }

    const response = await fetch("/api/dashboard", {
      method: "GET",
      credentials: "include", // Include session cookie
    });

    if (response.status === 200) {
      const patient = await response.json();

      const fullName = `${patient.first_name || ""} ${
        patient.last_name || ""
      }`.trim();
      const phoneNumber = patient.phone || "";
      const profileImage = patient.image || "/public/icons/profileIcon.png"; // Default profile image
      const about = patient.about || "";

      const currentPath = window.location.pathname;
      // Update the navigation bar profile picture
      const patientIconImage = document.querySelector(".patient-icon img");
      if (patientIconImage) {
        patientIconImage.src = profileImage; // Update the user icon image in the navigation bar
      }

      // Handle different pages
      if (currentPath === "/dashboard") {
        const patientNameElement = document.getElementById(
          "patient-name-display"
        );
        if (patientNameElement) {
          patientNameElement.textContent = fullName;
        }
      } else if (
        currentPath === "/dashboard/setting" ||
        currentPath.includes("profilesettings")
      ) {
        const patientNameInput = document.getElementById("patient-name");
        const phoneNumberInput = document.getElementById("phone");
        const profileImageElement = document.getElementById("profile-image");
        const aboutInput = document.getElementById("about");

        if (patientNameInput) {
          patientNameInput.value = fullName;
        }
        if (phoneNumberInput) {
          phoneNumberInput.value = phoneNumber;
        }
        if (profileImageElement) {
          profileImageElement.src = profileImage; // Correctly set the Cloudinary URL
        }
        if (aboutInput) {
          aboutInput.value = about;
        }
      }
    } else if (response.status === 401) {
      window.location.href = "/patient/login";
    } else {
      const data = await response.json();
      throw new Error(data.message || "Failed to fetch user details");
    }
  } catch (error) {
    console.error("Error fetching user details:", error);
    alert(error.message || "An unexpected error occurred.");
  } finally {
    if (loadingIndicator) {
      loadingIndicator.style.display = "none";
    }
  }
});

// Logout JavaScript begins here
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
  const profileAvatar = document.querySelector(".patient-icon");
  if (!profileAvatar.contains(e.target) && !dropdown.contains(e.target)) {
    dropdown.classList.remove("active");
  }
});

// Profile settings page begins here
function loadImage(event) {
  const image = document.getElementById("profile-image");
  image.src = URL.createObjectURL(event.target.files[0]);
}

// Patient Profile update setting JavaScript
const form = document.querySelector("form[action='/auth/api/profile']");
const submitButton = form.querySelector("button[type='submit']"); // Find the submit button

form.addEventListener("submit", async function (event) {
  event.preventDefault(); // Prevent default form submission behavior

  // Disable the button and change text to indicate the ongoing operation
  submitButton.disabled = true;
  const originalText = submitButton.textContent;
  submitButton.textContent = "Updating, Please wait...";

  const formData = new FormData(form);

  try {
    const response = await fetch(form.action, {
      method: form.method,
      body: formData,
      credentials: "include", // Include cookies for authentication
    });

    if (response.ok) {
      const data = await response.json();
      alert(data.message); // Show success message
      window.location.reload(); // Reload the page
    } else {
      const errorData = await response.json();
      alert(errorData.message || "Failed to update profile");
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    alert("An unexpected error occurred. Please try again.");
  } finally {
    // Re-enable the button and restore the original text
    submitButton.disabled = false;
    submitButton.textContent = originalText;
  }
});

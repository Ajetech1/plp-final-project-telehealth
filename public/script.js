document.addEventListener("DOMContentLoaded", function () {
  const registrationForm = document.getElementById("frm-register");

  if (!registrationForm) {
    console.error("Registration form not found!");
    return;
  }

  registrationForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    try {
      // Get form inputs
      const first_name = document.getElementById("first_name");
      const last_name = document.getElementById("last_name");
      const email = document.getElementById("email");
      const password = document.getElementById("password");
      const confirm_password = document.getElementById("confirm_password");
      const phone = document.getElementById("phone");
      const address = document.getElementById("address");

      // Validate gender selection
      const genderInput = document.querySelector(
        'input[name="gender"]:checked'
      );
      if (!genderInput) {
        alert("Please select a gender");
        return;
      }
      const gender = genderInput.value;

      // Validate month, day, year
      const month = document.getElementById("dob_month").value;
      const day = document.getElementById("dob_day").value;
      const year = document.getElementById("dob_year").value;

      if (!month || !day || !year) {
        alert("Please provide a complete date of birth");
        return;
      }

      // Combine into a single date (format: YYYY-MM-DD)
      const dateOfBirth = `${year}-${month}-${day}`;

      // Get input values and trim whitespace
      const firstValue = first_name.value.trim();
      const lastValue = last_name.value.trim();
      const emailValue = email.value.trim();
      const passwordValue = password.value;
      const confirmpasswordValue = confirm_password.value;
      const phoneValue = phone.value;
      const addressValue = address.value;

      // Check if all fields are filled
      if (
        !firstValue ||
        !lastValue ||
        !emailValue ||
        !passwordValue ||
        !confirmpasswordValue ||
        !phoneValue ||
        !addressValue
      ) {
        alert("All fields are required");
        return;
      }

      // Validate password comfirmation
      if (passwordValue !== confirmpasswordValue) {
        alert("Passwords do not match. Please try again.");
        return; // Ensure the form submission is stopped
      }

      if (passwordValue.length < 6) {
        alert("Password must be at least 6 characters long");
        return;
      }

      // Send the request to the server
      const response = await fetch("/auth/patient/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: firstValue,
          last_name: lastValue,
          email: emailValue,
          password: passwordValue,
          phone: phoneValue,
          date_of_birth: dateOfBirth,
          gender: gender,
          address: addressValue,
        }),
      });

      if (!response.ok) {
        // If response is not OK, try to read it as text
        const errorText = await response.text();
        console.error("Server error response:", errorText);
        alert("Registration failed. Please try again.");
        return;
      }

      // Try to parse JSON if the response is OK
      const data = await response.json();
      alert(data.message);
      registrationForm.reset(); // Clear the form on success
    } catch (error) {
      console.error("Registration error:", error);
      alert(`An error occurred during registration. Details: ${error.message}`);
    }
  });
});

//Login begins here
document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("frm-login");

  if (!loginForm) {
    // console.error("Login form not found!");
    return;
  }

  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    try {
      // Get form inputs
      const email = document.getElementById("email");
      const password = document.getElementById("password");

      // Validate that all elements exist
      if (!email || !password) {
        throw new Error("Required form elements are missing");
      }

      // Get input values and trim whitespace
      const emailValue = email.value.trim();
      const passwordValue = password.value;

      // Validation
      if (!emailValue || !passwordValue) {
        alert("All fields are required");
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
        alert("Please enter a valid email address.");
        return;
      }

      // Disable the submit button to prevent double submission
      const submitButton = loginForm.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      submitButton.textContent = "Signing in...";

      try {
        // Send the request to the server
        const response = await fetch("/auth/patient/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: emailValue,
            password: passwordValue,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          alert(
            `${data.message} Welcome ${data.name} of email address: ${data.email}`
          );
          loginForm.reset(); // Clear the form on success

          // Store user data in localStorage
          localStorage.setItem("patient", JSON.stringify(data));

          // Optional: Redirect to dashboard or home page
          window.location.href = "/dashboard";
        } else {
          alert(
            data.message ||
              "Login failed. Please check your credentials and try again."
          );
        }
      } catch (error) {
        console.error("Network error:", error);
        alert(
          "A network error occurred. Please check your connection and try again."
        );
      } finally {
        // Re-enable the submit button regardless of outcome
        submitButton.disabled = false;
        submitButton.textContent = "Login";
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("An error occurred during login. Please try again.");
    }
  });

  // Optional: Add real-time email validation
  const emailInput = document.getElementById("email");
  if (emailInput) {
    emailInput.addEventListener("blur", function () {
      const email = this.value.trim();
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        this.setCustomValidity("Please enter a valid email address");
        this.reportValidity();
      } else {
        this.setCustomValidity("");
      }
    });
  }
});

// Navbar side menu open & close toggler begins here

var sideMenu = document.getElementById("sidemenu");

function openMenu() {
  sideMenu.style.right = "0";
}

function closeMenu() {
  sideMenu.style.right = "-200px";
}

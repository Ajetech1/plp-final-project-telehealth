const bcrypt = require("bcryptjs");
const db = require("../config/db");

exports.registerPatient = async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    password,
    phone,
    date_of_birth,
    gender,
    address,
  } = req.body;

  try {
    //check if user exists
    const [rows] = await db.execute("SELECT * FROM patients WHERE email = ?", [
      email,
    ]);
    if (rows.length > 0) {
      return response.status(400).json({ message: "Patient already exists!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const sql =
      "INSERT INTO patients (first_name, last_name, email, password_hash, phone, date_of_birth, gender, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    db.execute(sql, [
      first_name,
      last_name,
      email,
      hashedPassword,
      phone,
      date_of_birth,
      gender,
      address,
    ]);

    res.status(201).json({ message: "Patient registered successfully!" });
  } catch (error) {
    res.status(500).json({ message: "An error occured!", error });
  }
};

//user login function
exports.loginPatient = async (request, response) => {
  const { email, password } = request.body;
  try {
    //check if patient exists
    const [rows] = await db.execute("SELECT * FROM patients WHERE email = ?", [
      email,
    ]);
    if (rows.length === 0) {
      return response
        .status(400)
        .json({ message: "User not found! Please register." });
    }
    const patient = rows[0];

    //compare the password
    const isMatch = await bcrypt.compare(password, patient.password_hash);
    if (!isMatch) {
      return response.status(400).json({ message: "Invalid credentials!" });
    }
    // Set session
    request.session.patient = {
      id: patient.id,
      first_name: patient.first_name,
      last_name: patient.last_name,
      email: patient.email,
      phone: patient.phone,
      about: patient.about,
      image: patient.image,
    };

    response.status(200).json({
      message: "Login successful!",
      name: `${patient.first_name} ${patient.last_name}`,
      email: patient.email,
      phone: patient.phone,
      about: patient.about,
      image: patient.image,
    });
  } catch (error) {
    response.status(500).json({ message: "An error occured!", error });
  }
};

// Get patient profile by ID
exports.getPatientProfile = (req, res) => {
  const patientId = req.params.id;
  const query = "SELECT * FROM patients WHERE id = ?";
  db.query(query, [patientId], (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error retrieving profile", error: err });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Patient not found" });
    }
    res.json(results[0]);
  });
};

// Patient can Update their profile picture and About field (authenticated session required)
exports.updatePatientProfile = async (req, res) => {
  if (!req.session.patient) {
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }

  const { about } = req.body;
  const profilePicture = req.file ? req.file.path : null; // Cloudinary's URL is available in req.file.path

  try {
    const sql = "UPDATE patients SET image = ?, about = ? WHERE id = ?";
    const [result] = await db.execute(sql, [
      profilePicture,
      about,
      req.session.patient.id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};

// Get appointment history for a patient
exports.getAppointmentHistory = (req, res) => {
  const patientId = req.params.id;
  const query = "SELECT * FROM appointments WHERE patient_id = ?";
  db.query(query, [patientId], (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error retrieving appointment history", error: err });
    }
    res.json(results);
  });
};

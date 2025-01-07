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

// exports.loginPatient = async (req, res) => {
//   const { email, password } = req.body;
//   const [rows] = await db.execute("SELECT * FROM Patients WHERE email = ?", [
//     email,
//   ]);
//   const patient = rows[0];
//   if (patient && (await bcrypt.compare(password, patient.password_hash))) {
//     req.session.patientId = patient.id;
//     res.send("Login successful");
//   } else {
//     res.status(401).send("Invalid credentials");
//   }
// };

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
    };

    response.status(200).json({
      message: "Login successful!",
      name: `${patient.first_name} ${patient.last_name}`,
      email: patient.email,
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

// Update patient profile
exports.updatePatientProfile = (req, res) => {
  const patientId = req.params.id;
  const { name, email, phone, address } = req.body;
  const query =
    "UPDATE patients SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?";
  db.query(query, [name, email, phone, address, patientId], (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error updating profile", error: err });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Patient not found" });
    }
    res.json({ message: "Profile updated successfully" });
  });
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

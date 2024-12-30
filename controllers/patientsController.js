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

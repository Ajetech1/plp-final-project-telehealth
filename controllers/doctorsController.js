const db = require("../config/db"); // Importing the database connection

// Add a new doctor - Admin only
exports.addDoctor = async (req, res) => {
  const { first_name, last_name, specialization, email, phone, schedule } =
    req.body;
  try {
    const sql =
      "INSERT INTO Doctors (first_name, last_name, specialization, email, phone, schedule) VALUES (?, ?, ?, ?, ?, ?)";
    await db.execute(sql, [
      first_name,
      last_name,
      specialization,
      email,
      phone,
      schedule,
    ]);
    res.status(201).json({ message: "Doctor added successfully" });
  } catch (error) {
    console.error("Error adding doctor:", error.message);
    res.status(500).json({ message: "Failed to add doctor" });
  }
};

// Get list of doctors - Available for all users
exports.getAllDoctors = async (req, res) => {
  try {
    const [doctors] = await db.execute("SELECT * FROM Doctors");
    res.json(doctors);
  } catch (error) {
    console.error("Error fetching doctors:", error.message);
    res.status(500).json({ message: "Failed to retrieve doctors" });
  }
};

// Get a doctor by ID
exports.getDoctorById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.execute("SELECT * FROM Doctors WHERE id = ?", [id]);
    const doctor = rows[0];
    if (doctor) {
      res.json(doctor);
    } else {
      res.status(404).json({ message: "Doctor not found" });
    }
  } catch (error) {
    console.error("Error fetching doctor by ID:", error.message);
    res.status(500).json({ message: "Failed to retrieve doctor" });
  }
};

// Update a doctor's profile - Admin only
exports.updateDoctor = async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, specialization, email, phone, schedule } =
    req.body;
  try {
    const sql =
      "UPDATE Doctors SET first_name = ?, last_name = ?, specialization = ?, email = ?, phone = ?, schedule = ? WHERE id = ?";
    await db.execute(sql, [
      first_name,
      last_name,
      specialization,
      email,
      phone,
      schedule,
      id,
    ]);
    res.json({ message: "Doctor profile updated successfully" });
  } catch (error) {
    console.error("Error updating doctor profile:", error.message);
    res.status(500).json({ message: "Failed to update doctor profile" });
  }
};

// Delete a doctor - Admin only (deactivate instead of permanent delete)
exports.deleteDoctor = async (req, res) => {
  const { id } = req.params;
  try {
    const sql = "DELETE FROM Doctors WHERE id = ?";
    await db.execute(sql, [id]);
    res.json({ message: "Doctor profile deleted successfully" });
  } catch (error) {
    console.error("Error deleting doctor profile:", error.message);
    res.status(500).json({ message: "Failed to delete doctor profile" });
  }
};

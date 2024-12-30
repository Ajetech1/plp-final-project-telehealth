exports.addDoctor = (req, res) => {
  const { first_name, last_name, specialization, email, phone, schedule } =
    req.body;
  const sql =
    "INSERT INTO Doctors (first_name, last_name, specialization, email, phone, schedule) VALUES (?, ?, ?, ?, ?, ?)";
  db.execute(sql, [
    first_name,
    last_name,
    specialization,
    email,
    phone,
    schedule,
  ])
    .then(() => res.send("Doctor added successfully"))
    .catch((err) => res.status(500).send(err.message));
};

exports.viewAppointments = (req, res) => {
  const sql = "SELECT * FROM Appointments";
  db.execute(sql)
    .then(([rows]) => res.json(rows))
    .catch((err) => res.status(500).send(err.message));
};

exports.bookAppointment = (req, res) => {
  const { patient_id, doctor_id, appointment_date, appointment_time } =
    req.body;
  const sql =
    'INSERT INTO Appointments (patient_id, doctor_id, appointment_date, appointment_time, status) VALUES (?, ?, ?, ?, "scheduled")';
  db.execute(sql, [patient_id, doctor_id, appointment_date, appointment_time])
    .then(() => res.send("Appointment booked successfully"))
    .catch((err) => res.status(500).send(err.message));
};

exports.cancelAppointment = (req, res) => {
  const { id } = req.params;
  const sql = 'UPDATE Appointments SET status = "canceled" WHERE id = ?';
  db.execute(sql, [id])
    .then(() => res.send("Appointment canceled"))
    .catch((err) => res.status(500).send(err.message));
};

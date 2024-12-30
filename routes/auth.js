const express = require("express");
const router = express.Router();
const patientsController = require("../controllers/patientsController");
// const doctorsController = require("../controllers/doctorsController");
// const appointmentsController = require("../controllers/appointmentsController");
// const adminController = require("../controllers/adminController");

router.post("/patient/register", patientsController.registerPatient);
router.post("/patient/login", patientsController.loginPatient);
// router.post("/appointment/book", appointmentsController.bookAppointment);
// router.put("/appointment/cancel/:id", appointmentsController.cancelAppointment);
// router.post("/admin/add-doctor", adminController.addDoctor);
// router.get("/admin/appointments", adminController.viewAppointments);

module.exports = router;

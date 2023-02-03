const express = require("express");
const router = express.Router();

//Importing the controller to manage all the jobs
const {
  getJobs,
  getJob,
  newJob,
  getJobsInRadius,
  updateJob,
  deleteJob,
  getStats,
} = require("../controllers/jobsController");

//Setting up the routes
router.route("/jobs").get(getJobs);
router.route("/job/:id/:slug").get(getJob);
router.route("/jobs/:zipcode/:distance").get(getJobsInRadius);
router.route("/job/new").post(newJob);
router.route("/job/:id").put(updateJob).delete(deleteJob);
router.route("/stats/:topic").get(getStats);
module.exports = router;

const Job = require("../models/jobs");
const geoCoder = require("../utils/geocoder");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

//Getting all the jobs => /api/v1/jobs
exports.getJobs = catchAsyncErrors(async (req, res) => {
  const jobs = await Job.find();
  res.status(200).json({
    success: true,
    message: jobs.length,
    data: jobs,
  });
});

//Getting a job by ID and slug => /api/v1/job/:id/:slug
exports.getJob = catchAsyncErrors(async (req, res) => {
  console.log("Inside getJob");
  const job = await Job.find({
    $and: [{ _id: req.params.id }, { slug: req.params.slug }],
  });

  if (!job || job.length === 0) {
    return next(new ErrorHandler("Job not found", 404));
  }
  res.status(200).json({
    success: true,
    message: job.length,
    data: job,
  });
});

// Create a new Job   =>  /api/v1/job/new
exports.newJob = catchAsyncErrors(async (req, res, next) => {
  console.log("Inside new Job");

  const job = await Job.create(req.body);

  res.status(200).json({
    success: true,
    message: "Job Posted",
    data: job,
  });
});

//Updating the job => /api/v1/job/:id
exports.updateJob = catchAsyncErrors(async (req, res, next) => {
  let job = await Job.findById(req.params.id);
  if (!job) {
    return next(new ErrorHandler("Job not found", 404));
  }

  job = await Job.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: "Job Updated",
    data: job,
  });
});

//Deleting the job => /api/v1/job/:id
exports.deleteJob = catchAsyncErrors(async (req, res, next) => {
  let job = await Job.findById(req.params.id);
  if (!job) {
    return next(new ErrorHandler("Job not found", 404));
  }

  job = await Job.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Job deleted successfully",
  });
});

//Search for jobs within the radious => /api/v1/jobs/:zipcode/:distance
exports.getJobsInRadius = catchAsyncErrors(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  const location = await geoCoder.geocode(zipcode);
  const latitude = location[0].latitude;
  const longitude = location[0].longitude;

  const radius = distance / 3963;

  const jobs = await Job.find({
    location: {
      $geoWithin: { $centerSphere: [[longitude, latitude], radius] },
    },
  });
  res.status(200).json({
    success: true,
    message: jobs.length,
    data: jobs,
  });
});

//Aggregate and calculate the summary statistics => /api/v1/stats/:topic
exports.getStats = catchAsyncErrors(async (req, res, next) => {
  const stats = await Job.aggregate([
    {
      $match: { $text: { $search: '"' + req.params.topic + '"' } },
    },
    {
      $group: {
        _id: { $toUpper: "$experience" },
        totalJobs: { $sum: 1 },
        avgPosition: { $avg: "$positions" },
        avgSalary: { $avg: "$salary" },
        minSalary: { $min: "$salary" },
        maxSalary: { $max: "$salary" },
      },
    },
  ]);

  if (stats.length === 0) {
    return next(
      new ErrorHandler(`No stats found for - ${req.params.topic}`, 200)
    );
  }

  res.status(200).json({
    success: true,
    data: stats,
  });
});

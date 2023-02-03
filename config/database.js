const mongoose = require("mongoose");

const connectDatabase = () => {
  mongoose
    .connect(process.env.MONGOOSE_DEV_DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((con) => {
      console.log(
        `Mongoose Cloud DB connected with the host:  ${con.connection.host}`
      );
    });
};

module.exports = connectDatabase;

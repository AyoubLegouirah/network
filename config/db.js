const mongoose = require("mongoose");

mongoose
  .connect(
    "mongodb+srv://" + process.env.DB_USER_PASS + "@cluster0.r27rfr4.mongodb.net/mern-project",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("Failed to connect to MongoDB", err));
const express = require("express");
const db = require("./db");
const routesCategories = require("./routes/categories");
const routesUser = require("./routes/users");
const routesFinances = require("./routes/finances");
const app = express();
app.use(express.json());
const port = 3000;

app.get("/", (req, res) => {
  res.send("Sarve!");
});

app.use("/categories", routesCategories);
app.use("/users", routesUser);
app.use("/finances", routesFinances);

app.listen(port, () => {
  db.connect()
    .then(() => {
      console.log("Connected to database");
    })
    .catch((error) => {
      throw new Error(error);
    });
  console.log(`Listening on port ${port}`);
});

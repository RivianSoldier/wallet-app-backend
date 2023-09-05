const express = require("express");
const router = express.Router();
const db = require("../db");
const categoriesQueries = require("../queries/categories");
const usersQueries = require("../queries/users");

router.post("/", async (req, res) => {
  try {
    const { email } = req.headers;
    const { category_id, title, date, value } = req.body;

    if (email.length < 5 || !email.includes("@")) {
      return res.status(400).json({ error: "The e-mail is invalid." });
    }

    if (!category_id) {
      return res.status(400).json({ error: "Category ID is required." });
    }

    if (!title || title.length < 3) {
      return res.status(400).json({
        error: "Title is required and should have more than 3 characters.",
      });
    }

    if (!date || date.length != 10) {
      return res.status(400).json({
        error: "Date is required and should have the format YYYY-MM-DD.",
      });
    }

    if (!value) {
      return res.status(400).json({ error: "Value is required." });
    }

    const userQuery = await db.query(usersQueries.findByEmail(email));
    if (!userQuery.rows[0]) {
      return res.status(404).json({ error: "User does not exist." });
    }

    const category = await db.query(categoriesQueries.findById(category_id));
    if (!category.rows[0]) {
      return res.status(404).json({ error: "Category not found." });
    }

    const text =
      "INSERT INTO finances (user_id, category_id, date, title, value) VALUES ($1, $2, $3, $4, $5) RETURNING *";
    const values = [userQuery.rows[0].id, category_id, date, title, value];
    const createResponse = await db.query(text, values);
    if (!createResponse.rows[0]) {
      return res.status(400).json({ error: "Could not create finance." });
    }
    return res.status(200).json(createResponse.rows[0]);
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.headers;

    if (email.length < 5 || !email.includes("@")) {
      return res.status(400).json({ error: "The e-mail is invalid." });
    }

    if (!id) {
      return res.status(400).json({ error: "ID is required." });
    }

    const userQuery = await db.query(usersQueries.findByEmail(email));
    if (!userQuery.rows[0]) {
      return res.status(404).json({ error: "User does not exist." });
    }

    const findFinanceText = "SELECT * FROM finances WHERE id = $1";
    const findFinanceValues = [Number(id)];
    const financeItemQuery = await db.query(findFinanceText, findFinanceValues);

    if (!financeItemQuery.rows[0]) {
      return res.status(400).json({ error: "Finance item not found." });
    }

    if (financeItemQuery.rows[0].user_id !== userQuery.rows[0].id) {
      return res.status(401).json({ error: "User not allowed." });
    }

    const text = "DELETE FROM finances WHERE id = $1 RETURNING *";
    const values = [Number(id)];
    const deleteResponse = await db.query(text, values);

    if (!deleteResponse.rows[0]) {
      return res.status(400).json({ error: "Finance item not deleted." });
    }

    return res.status(200).json(deleteResponse.rows[0]);

  } catch (error) {
    return res.status(500).json(error);
  }
});

module.exports = router;

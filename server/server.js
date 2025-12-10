const express = require("express");
const path = require("path");

const logger = require("./middleware/logger");
const wordRoutes = require("./routes/wordRoutes");

const app = express();
const PORT = process.env.PORT || 3000;


app.use(logger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(express.static(path.join(__dirname, "..", "public")));

app.use("/api/words", wordRoutes);


app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
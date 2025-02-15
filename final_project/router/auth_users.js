const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js"); // Assuming books data exists
const regd_users = express.Router();

const secretKey = "access"; // Secret key for JWT
let users = []; // Temporary storage (replace with DB in production)

// ✅ Check if username exists
const isValid = (username) => {
    return users.some(user => user.username === username);
};

// ✅ Authenticate user credentials
const authenticatedUser = (username, password) => {
    const user = users.find(user => user.username === username);
    return user && user.password === password;
};

// ✅ User Login Route
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    if (authenticatedUser(username, password)) {
        const token = jwt.sign({ username }, secretKey, { expiresIn: "1h" });

        // ✅ Store token and username in session
        req.session.authorization = { accessToken: token, username };

        return res.status(200).json({ message: "Login successful!", token });
    } else {
        return res.status(401).json({ message: "Invalid username or password." });
    }
});

// ✅ Middleware to Check Authentication Before Review
const authenticateUser = (req, res, next) => {
    if (!req.session.authorization) {
        return res.status(401).json({ message: "Unauthorized. Please log in first." });
    }

    const token = req.session.authorization.accessToken;

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Invalid or expired token." });
        }
        req.username = decoded.username; // Store decoded username in request
        next();
    });
};

// ✅ Add or Modify a Book Review
regd_users.put("/auth/review/:isbn", authenticateUser, (req, res) => {
    const { isbn } = req.params;
    const { review } = req.body;
    const username = req.username; // Retrieve username from decoded JWT

    if (!review) {
        return res.status(400).json({ message: "Review cannot be empty." });
    }

    // ✅ Check if book exists
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found." });
    }

    // ✅ Initialize book reviews if not present
    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }

    // ✅ Add or modify review
    books[isbn].reviews[username] = review;

    return res.status(200).json({ message: "Review added/updated successfully.", reviews: books[isbn].reviews });
});
// ✅ DELETE a Book Review
regd_users.delete("/auth/review/:isbn", authenticateUser, (req, res) => {
    const { isbn } = req.params;
    const username = req.username; // Retrieve username from JWT session

    // ✅ Check if book exists
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found." });
    }

    // ✅ Check if book has reviews
    if (!books[isbn].reviews || !books[isbn].reviews[username]) {
        return res.status(404).json({ message: "No review found for this user." });
    }

    // ✅ Delete user's review
    delete books[isbn].reviews[username];

    return res.status(200).json({ message: "Review deleted successfully.", reviews: books[isbn].reviews });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

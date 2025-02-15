const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register new users
// Register a new user
public_users.post('/register', (req, res) => {
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    // Check if the username already exists
    const existingUser = users.find(user => user.username === username);
    if (existingUser) {
        return res.status(409).json({ message: "Username already exists. Choose a different one." });
    }

    // Register the new user
    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully!" });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  res.status(200).json(books); // ✅ No need to stringify manually
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    let isbn = req.params.isbn;
    if (books[isbn]) {
      return res.status(200).json(books[isbn]);
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  });
  

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const authorName = req.params.author; // Get author from request parameters
    let booksByAuthor = [];
  
    // Iterate through books and find matches
    Object.keys(books).forEach((key) => {
      if (books[key].author.toLowerCase() === authorName.toLowerCase()) {
        booksByAuthor.push(books[key]); // Add matching book to the array
      }
    });
  
    if (booksByAuthor.length > 0) {
      res.status(200).json(booksByAuthor); // Return matching books
    } else {
      res.status(404).json({ message: "No books found for this author" });
    }
  });
  

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const bookTitle = req.params.title; // Get title from request parameters
    let booksByTitle = [];
  
    // Iterate through books and find matches
    Object.keys(books).forEach((key) => {
      if (books[key].title.toLowerCase() === bookTitle.toLowerCase()) {
        booksByTitle.push(books[key]); // Add matching book to the array
      }
    });
  
    if (booksByTitle.length > 0) {
      res.status(200).json(booksByTitle); // Return matching books
    } else {
      res.status(404).json({ message: "No books found with this title" });
    }
  });
  

// Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn; // Get ISBN from request parameters
  
    // Check if the book with given ISBN exists
    if (books[isbn]) {
      res.status(200).json(books[isbn].reviews); // Return the reviews for the book
    } else {
      res.status(404).json({ message: "Book not found" }); // If ISBN does not exist
    }
  });

  
  
  

module.exports.general = public_users;

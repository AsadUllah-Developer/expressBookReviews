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


// Get book details based on Author using Async-Await
// Get all books using Async-Await
public_users.get('/books', async (req, res) => {
    try {
        const response = await new Promise((resolve) => setTimeout(() => resolve(books), 500));
        return res.status(200).json({ books: response });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching books.", error: error.message });
    }
});

public_users.get('/isbn/:isbn', async (req, res) => {
    try {
        const isbn = req.params.isbn;

        // Fetch book data from local books object (if stored in-memory)
        const book = books[isbn]; // Assuming `books` is an object storing books

        if (book) {
            return res.status(200).json(book);
        } else {
            throw new Error("Book not found");
        }
    } catch (error) {
        return res.status(404).json({ message: "Book not found", error: error.message });
    }
});


  

// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
    try {
        const authorName = req.params.author.toLowerCase();
        const response = await axios.get(`https://asadenginear-5000.theianext-0-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/books?author=${authorName}`); // Replace with actual API URL
        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(404).json({ message: "No books found for this author", error: error.message });
    }
});
  

const axios = require('axios');  // ✅ Import Axios

public_users.get('/title/:title', async (req, res) => {
    try {
        const bookTitle = req.params.title.toLowerCase();
        
        // Fetch all books
        const response = await axios.get(`https://asadenginear-5000.theianext-0-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/books`);
        const books = response.data.books;

        // Filter books by title
        const filteredBooks = Object.values(books).filter(book => book.title.toLowerCase() === bookTitle);

        if (filteredBooks.length > 0) {
            return res.status(200).json(filteredBooks);
        } else {
            return res.status(404).json({ message: "No book found with this title" });
        }
    } catch (error) {
        return res.status(500).json({ message: "Error fetching books", error: error.message });
    }
});


  
  
  

module.exports.general = public_users;

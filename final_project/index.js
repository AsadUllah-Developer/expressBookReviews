const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();
app.use(express.json());

// ✅ Session setup for customer authentication
app.use("/customer", session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true
}));

// ✅ Authentication Middleware for Protected Routes
app.use("/customer/auth/*", function auth(req, res, next) {
    if (req.session && req.session.authorization) {
        const token = req.session.authorization.accessToken;

        jwt.verify(token, "access", (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: "Unauthorized access. Invalid token." });
            }
            req.user = decoded; // Store user data in request
            next();
        });
    } else {
        return res.status(401).json({ message: "Unauthorized. Please log in first." });
    }
});

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running on port", PORT));

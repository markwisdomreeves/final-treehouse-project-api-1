
"use strict";

const bcryptjs = require("bcryptjs");
const auth = require("basic-auth");
const User = require("../../database").User;


// Authenticate User Middleware
const authenticateUser =  async (req, res, next) => {

    let message = null;

    // Parse the user's credentials from the Authorization header.
    const credentials = auth(req);

    // We are checking tf the user's credentials are available...
    if (credentials) {

        // Attempt to retrieve the user from the data store
        const user = await User.findOne({
            where: {emailAddress: credentials.name}
        });

        // We are checking if the user is successfully retrieved
        if (user) {
            // Use the bcryptjs npm package to compare the user's password
            const authenticated = bcryptjs
                .compareSync(credentials.pass, user.password);

            // If the passwords match...
            if (authenticated) {
                console.log(`Email Address is authenticated: ${user.emailAddress}`);

                // store the retrieved user object on the request object
                req.currentUser = user;
            } else {
                message = `Email Address is authentication has failed: ${user.emailAddress}`;
            }
        } else {
            message = `User not found for username: ${credentials.name}`;
        }
    } else {
        message = 'Authentication header is not found';
    }

    // We are checking if Authentication has failed than we notify the user with an error message
    if (message) {
        console.warn(message);

        // Than return a 401 Unauthorized HTTP status code.
        res.status(401).json({ message: 'Access to this route has failed, please log in' });
    } else {
        // Or allow the  user Authentication and the process with the next() method
        next();
    }
};


module.exports = authenticateUser;
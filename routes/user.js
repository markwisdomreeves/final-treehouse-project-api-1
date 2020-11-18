'use strict';

const express = require('express');
const bcryptjs = require('bcryptjs');
const authenticateUser = require('./globalMiddleware/global-auth-middleware');
const globalErrorsHandler = require('./globalMiddleware/global-error-handlers');
const { check, validationResult } = require('express-validator');
const User = require('../database').User;
const router = express.Router();


//GET ROUTE: GET api/users shows the current authenticate user with status code 200
router.get('/users', authenticateUser, globalErrorsHandler(async(req,res)=>{
    const user = req.currentUser;
    res.json({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        emailAddress: user.emailAddress
    }).status(200);
}));


// POST ROUTER: POST api/users creates new user, sets the Location header to / and returns no content, status 201
    router.post('/users', [
        check("firstName")
            .exists({ checkNull: true, checkFalsy: true })
            .withMessage("First Name is required"),
        check("lastName")
            .exists({ checkNull: true, checkFalsy: true })
            .withMessage("Last Name is required"),
        check("emailAddress")
            .exists({ checkNull: true, checkFalsy: true })
            .withMessage("Email address is required"),
        check("password")
            .exists({ checkNull: true, checkFalsy: true })
            .withMessage("Password is required"),
    ], globalErrorsHandler (async(req, res) => {
        // get validation result from the Request object.
        const errors = validationResult(req);
    try{
        // checking if validation error exists
        if (!errors.isEmpty()) {
            // If errors exists, then we use the "map" array method on the list of errrors"
            const errorMessages = errors.array().map(error => error.msg);
            // And return it to the client as a validation message.
            return res.status(400).json({ errors: errorMessages });
        }
        // Get user req body
        const user = await req.body;

        // We hash the new user password
        user.password = bcryptjs.hashSync(user.password);

        // Add the user to the `users` array.
        await User.create(user);
        // And this create a 201 status code
        return res.location(`/`).status(201).end();
    } catch(error){
        if(error.name === "SequelizeUniqueConstraintError"){
            return res.status(422).json({message: 'Email address must be unique'});
        }else{
            throw error;
        }
    }
}));


module.exports = router;

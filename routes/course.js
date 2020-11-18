'use strict';

const express = require('express');
const authenticateUser = require('./globalMiddleware/global-auth-middleware');
const globalErrorsHandler = require('./globalMiddleware/global-error-handlers');
const { check, validationResult } = require('express-validator');
const Course = require('../database').Course;
const User = require('../database').User;
const router = express.Router();


// GET api/courses method get all courses from the /courses route
router.get('/courses', globalErrorsHandler(async(req, res)=>{
    const courses = await Course.findAll({
        attributes: ['id', 'title', 'description', 'estimatedTime', 'materialsNeeded', 'userId'],
        include: [{
            attributes: ['id', 'firstName', 'lastName', 'emailAddress'],
            model: User,
        }],
    });
    res.status(200).json(courses);
}));


// GET api/courses/:id get a single course with status code of 200
router.get('/courses/:id', globalErrorsHandler(async(req, res, next)=>{
    const course = await Course.findByPk(req.params.id, {
        attributes: ['id', 'title', 'description', 'estimatedTime', 'materialsNeeded', 'userId'],
        include: [{
            attributes: ['id', 'firstName', 'lastName', 'emailAddress'],
            model: User,
        }],
    }); 
    if (course) {
        res.status(200).json(course);
    } else {
        res.status(400).json({ message: "We are sorry, Course does not exist"})
    }

}));


/* POST api/courses creates a new course and sets the Location header 
to the URI for the course, returns no content, status 201 */
router.post('/courses',[
    check("title")
        .exists({ checkNull: true, checkFalsy: true })
        .withMessage("Please provide a value for the title field"),
    check("description")
        .exists({ checkNull: true, checkFalsy: true })
        .withMessage("Please provide a value for the description input"),
] ,authenticateUser, globalErrorsHandler(async(req,res)=>{
    // get validation result from the Request object.
    const user = req.currentUser;
    const errors = validationResult(req);
    try{
        // checking if validation errors exists
        if (!errors.isEmpty()) {
            // If errors exists, then we use the "map" array method on the list of errrors"
            const errorMessages = errors.array().map(error => error.msg);
            // And return it to the client as a validation message.
            return res.status(400).json({ errors: errorMessages });
        }

        let course;
        course = await Course.create(req.body); 
        const id = course.id;
        res.location(`/courses/${id}`).status(201).end();
    } catch(error){
        throw error;
    }

}));


/* PUT api/courses/id route - update a course and returns no content, status 201 */
router.put('/courses/:id',[
    check('title')
        .exists({ checkNull: true, checkFalsy: true })
        .withMessage("Please provide a value for the title field."),
    check('description')
        .exists({ checkNull: true, checkFalsy: true })
        .withMessage("Please provide a value for the description input."),

] , authenticateUser, globalErrorsHandler(async(req,res,next)=>{
    const errors = validationResult(req);
    try{
        // Checking for validation errors in the errors array
        if (!errors.isEmpty()) {
            // We are using the "map array method" loop over all errors and display it
            const errorMessages = errors.array().map(error => error.msg);

            // Returning the error messages to the user
            return res.status(400).json({ errors: errorMessages });
        }

        let course;
        const user = req.currentUser;
        // We are finding the course by it's id
        course = await Course.findByPk(req.params.id);
        if(course){
            if(course.userId === user.id){
                // And then We updates course with given id
                await course.update(req.body);
                res.status(204).end();
            }else{
                return res.status(403).json({message: "We are sorry, You are not permitted to edit other user's course"});
            }
        }else{
            res.status(404).json({message: "We are sorry, Course not found"});
        }
    } catch(error){
        throw error;
    }
}));


// DELETE api/courses/:id deletes a single course and returns no content, status 204
router.delete('/courses/:id', authenticateUser, globalErrorsHandler(async(req,res)=>{
    const course = await Course.findByPk(req.params.id);
    if (course.userId === req.currentUser.id) {
        await Course.destroy({
            where: {
                id: req.params.id
            }
        });
        res.status(200).end();
    } else {
        res.status(403).json({
            message: "Sorry, something went with the sever.",
            errors: ["We are sorry, You are not permitted to delete other user's course."]
        })
    }
}));


module.exports = router;

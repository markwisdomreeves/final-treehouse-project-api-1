const Sequelize = require("sequelize");


// Book model with validation
module.exports = (sequelize) => {
    class User extends Sequelize.Model { }
    User.init({
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        firstName: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "First Name is required"
                },
                notEmpty: {
                    msg: "Please enter your first name"
                }
            }
        },
        lastName: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Last Name is required"
                },
                notEmpty: {
                    msg: "Please enter your last name"
                }
            }
        },
        emailAddress: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "Please provide an email"
                },
                notNull: {
                    msg: "Email is not valid"
                },
                isEmail: {
                    msg: "We need a valid email address"
                },
            },  
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Please enter a password"
                },
                notEmpty: {
                    message: "Please enter a password"
                }
            }
        }
    }, { sequelize });

    User.associate = (models) => {
        User.hasMany(models.Course, {
            foreignKey: {
                fieldName: "userId",
                allowNull: false,
            },
        });
    }

    return User;
};
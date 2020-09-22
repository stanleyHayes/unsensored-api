const mongoose = require('mongoose');
const validator = require('validator');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: [true, 'name required'],
        trim: true
    },
    username: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true,
        required: [true, 'username required']
    },
    email: {
        type: String,
        required: [true, 'email required'],
        lowercase: true,
        validate: function (value){
            if(!validator.isEmail(value)){
                return throw new Error('invalid email');
            }
        }
    },
    avatar: {
        type: Buffer
    },
    password: {
        type: String,
        trim: true,
        validate: function (value){
            if(value.length < 6){
                return throw new Error('password too short');
            }
        }
    },
    subscriptions: {
        type: [String]
    }
}, {timestamps: true});
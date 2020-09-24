const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const rateLimiter = require('express-rate-limit');
const useragent = require("express-useragent");

dotenv.config({path: './config/config.env'});

const app = express();

mongoose.connect(process.env.MONGODB_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true
}, (error) => {
    if (error) {
        return console.log(`Error: ${error.message}`);
    }
    console.log(`Server connect to mongodb`);
});

const limiter = rateLimiter({
    max: 100,
    windowMs: 15 * 1000 * 60
});

app.use(useragent.express());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(helmet());
app.use(cors());
app.use(limiter);

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}


app.use('/api/v1/auth', require('./routes/authentication'));
app.use('/api/v1/articles', require('./routes/articles'));
app.use('/api/v1/comments', require('./routes/comments'));
app.use('/api/v1/replies', require('./routes/replies'));
app.use('/api/v1/users', require('./routes/users'));
app.use('/api/v1/views', require('./routes/views'));


app.listen(process.env.PORT || 8000, () => {
    console.log(`Server connected in ${process.env.NODE_ENV} on port ${process.env.PORT}`)
})
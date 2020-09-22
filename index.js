const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const rateLimiter = require('express-rate-limit');

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

app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(limiter);

if (process.env.NODE_ENV === 'development') {
    app.use(morgan.format('dev'));
}

app.listen(process.env.PORT || 8000, () => {
    console.log(`Server connected in ${process.env.NODE_ENV} on port ${process.env.PORT}`)
})
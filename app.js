const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');

dotenv.config();
const app = express();
const router = express.Router();

router.get('/', (req, res) => {
    res.send('hi!');
});

app.use(morgan('dev'));
app.use(express.json());
app.use('/api', express.urlencoded({ extended: false }), router);
app.listen(3000, () => {
    console.log('서버가 요청을 받을 준비가 됐어요');
});

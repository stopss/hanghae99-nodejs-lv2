const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');
const { User } = require('./models');
const authMiddleware = require('./middlewares/auth-middleware');

dotenv.config();
const app = express();
const router = express.Router();

router.get('/', (req, res) => {
    res.send('hi!');
});

// 회원 가입 api
router.post('/register', async (req, res) => {
    console.log("회원 가입 api");
    const { nickname, email, password, passwordCheck } = req.body;
    const admin = false;

    // 닉네임 형식 확인(최소 3자 이상, 알파벳 대소문자, 숫자로 구성)
    const regExpNickName = /^[A-Za-z0-9]{3,}$/.test(nickname);
    if (!regExpNickName) {
        res.status(400).send({
            errorMessage: '닉네임 형식이 잘못 되었습니다.',
        });
        return;
    }

    // 비밀번호랑 비밀번호 확인이 일치하는지
    if (password !== passwordCheck) {
        res.status(400).send({
            errorMessage: '패스워드가 패스워드 확인란과 동일하지 않습니다.',
        });
        return;
    }

    // 닉네임, 이메일 중복 확인
    const existUsers = await User.findAll({
        where: {
            [Op.or]: [{ nickname }, { email }],
        },
    });
    if (existUsers.length) {
        res.status(400).send({
            errorMessage: '이미 가입된 이메일 또는 닉네임이 있습니다.',
        });
        return;
    }

    // 비밀번호 정규식 확인
    const regExpPassword = /^[A-Za-z0-9]{4,}$/.test(nickname);
    if(!regExpPassword) {
        res.status(400).send({
            errorMessage: '비밀번호 형식이 잘못되었습니다.',
        });
        return;
    }
    if(password.search(nickname) > -1) {
        res.status(400).send({
            errorMessage: '비밀번호에 닉네임과 같은 값이 포함되어 있습니다. ',
        });
        return;
    }

    await User.create({ email, nickname, password, admin });

    res.status(201).send({
        success: true,
        msg : "회원가입을축하합니다",
    });
});

// 로그인 api
router.post('/login', async (req, res) => {
    console.log("로그인 api");
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email, password } });

    if (!user) {
        res.status(400).send({
            errorMessage: '이메일 또는 패스워드가 잘못됐습니다.',
        });
        return;
    }

    const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET);
    res.cookie('user_cookie', token);
    res.send({
        success: true,
        token,
    });
});


app.use(morgan('dev'));
app.use(express.json());
app.use('/api', express.urlencoded({ extended: false }), router);
app.listen(3000, () => {
    console.log('서버가 요청을 받을 준비가 됐어요');
});



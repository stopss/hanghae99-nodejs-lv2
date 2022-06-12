const jwt = require('jsonwebtoken');
const { User } = require('../models');

module.exports = (req, res, next) => {
    const { authorization } = req.headers;
    const [tokenType, tokenValue] = authorization.split(' ');

    if (!tokenValue || tokenType !== 'Bearer') {
        res.status(401).send({
            errorMessage: '로그인 후 사용하세요',
        });
        return;
    }

    try {
        const { userId } = jwt.verify(tokenValue, process.env.JWT_SECRET);

        // 반환값 프로미스이다.
        // await 를 안쓴 이유는 async를 사용하지 않았기 때문에
        // 프로미스 .then을 사용한다.
        User.findByPk(userId).then((user) => {
            // user의 값이 있는지 확인해야 한다.
            // 하지만 res.locals.user = user; 를 사용한다면 db에서 사용자 정보를 가져오기 않게 할 수 있다.
            // express가 제공하는 안전한 변수에 담아두고 언제나 꺼내서 사용할 수 있다.
            // 이렇게 담아둔 값은 정상적으로 응답값을 보내고 나면 소멸한다.
            // res.locals.user 에 사용자 정보가 들어 있을 때는 이미 인증이 완료된 상태이다.
            res.locals.user = user;
            // user 값을 가져온 경우에만 next()
            next();
        });
    } catch (error) {
        res.status(401).send({
            errorMessage: '로그인 후 사용하세요',
        });
        return;
    }
};

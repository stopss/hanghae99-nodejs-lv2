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

        User.findByPk(userId).then((user) => {

            res.locals.user = user;

            next();
        });
    } catch (error) {
        res.status(401).send({
            result: {
                success: false,
                errorMessage: '로그인 후 사용하세요',
            }
            
        });
        return;
    }
};

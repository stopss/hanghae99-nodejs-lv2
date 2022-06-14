const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');
const { User, Posts, Like } = require('./models');
const authMiddleware = require('./middlewares/auth-middleware');
const { upload } = require('./middlewares/multer-middleware');

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
        result: {
            success: true,
            msg : "회원가입을축하합니다",
        }
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
    res.status(201).send({
        result: {
            success: true,
            token,
        }
    });
});

// 전체 게시글 목록 조회 API
router.get("/post", async (req, res) => {

    try {
        console.log("게시글 전체 목록 조회 api");
        const post_list = await Posts.findAll({
            order:[['createdAt', 'DESC']]
        });
        res.status(200).send({ 
            result: {
                post_list
            }
         });
    } catch(error) {
        return res.status(400).json({ error })
    }
});

// 게시글 작성 API
router.post("/post", authMiddleware, upload.single("image"), async (req, res) => {
    try{
        console.log("게시판 작성 api");

        const { userId } = res.locals.user;
        console.log(userId);
        const { title, content, layout } = req.body;
        const { image } = req.file;
        console.log("image", req.file.filename);
        // db 저장
        await Posts.create({ title, content, userId, layout, image: req.file.filename });

        res.status(201).send({ 
            result: {
                success: true,
                msg: "게시글 작성이 완료되었습나다."

            }
        });
    } catch(error) {
        return res.status(400).json({ 
            result: {
                success: false,
                error
            }
        });
    }
});

// 게시글 상세 조회 API
router.get("/post/:postId", async (req, res) => {
    console.log("게시글 상세 조회 api");
    const { postId } = req.params;

    const existsPost = await Posts.findOne({
        where: {
            postId,
        }
    });

    if(!existsPost) {
        res.status(400).send({
            success: false,
            errormessage: "존재하지 않는 게시물입니다.",
        });
        return;
    }

    const existsLike = await Like.findOne({
        where: {
            postId,
            userId : existsPost.userId

        }
    });
    
    const countLike = await Like.findAndCountAll({
        where: {
            postId
        }
    });

    // 유저 정보 
    const existUser = await User.findOne({
        where: { userId: existsPost.userId }
    })

    if (!existsLike) {
        const likeByMe = false;
        res.status(200).send({
            result: {
                likeByMe,
                countLike: countLike.count,
                title: existsPost.title,
                content: existsPost.content,
                image: existsPost.image,
                userId: existUser.nickname,
                postId: existsPost.postId,
            }
        })
    } else {
        res.status(200).send({
            result: {
                likeByMe: existsLike.done,
                countLike: countLike.count,
                title: existsPost.title,
                content: existsPost.content,
                image: existsPost.image,
                userId: existUser.nickname,
                postId: existsPost.postId,
            }
            
        });
    }

});




// 게시글 수정 API
router.put('/post/:postId', authMiddleware, upload.single("image"), async (req, res) => {
    try {
        console.log("게시글 수정 api");
        const { userId } = res.locals.user;
        const { postId } = req.params;
        const { title, content, layout } = req.body;
        const { image } = req.file;

        const existsPost = await Posts.findOne({
            where: {
                postId,
            },
        });

        // 게시글 작성자만 수정 할 수 있다
        if(existsPost.userId != userId) {
            res.send({
                result: {
                    success: false,
                    errorMessage: "게시글 작성자만 수정할 수 없습니다."
                }
            })
            return;
        }

        if (existsPost) {
            // 파일 삭제
            fs.unlinkSync("uploads/" + existsPost.image);
            console.log("image delete", existsPost.image);
            existsPost.title = title;
            existsPost.content = content;
            existsPost.image = req.file.filename;
            existsPost.layout = layout;
            await existsPost.save();   
        } 

        res.status(200).send({
            result: {
                success: true,
            }
        });
    } catch(error) {
        console.log(error);
    }
    
});

// 게시글 삭제
router.delete('/post/:postId', authMiddleware, async (req, res) => {
    try {
        console.log("게시글 삭제 api");
        const { userId, admin } = res.locals.user;
        console.log(admin);
        const { postId } = req.params;

        const existsPost = await Posts.findOne({
            where: {
                postId,
            },
        });

        // 관리자 권한을 가진 사람만 삭제 할 수 있다.s
        if(admin == true) {
            fs.unlinkSync("uploads/" + existsPost.image);
            console.log("image delete");
            await existsPost.destroy();
            await Like.destroy({
                where: {
                    postId,
                }
            });
            res.status(200).send({
                result: {
                    success: true,
                }
            });
        }

        // 게시글 작성자만 삭제 할 수 있다.
        if(existsPost.userId != userId) {
            res.status(200).send({
                result: {
                    success: false,
                    errorMessage: "게시글 작성자만 삭제할 수 있습니다."
                }
                
            })
            return;
        }

        if (existsPost) {
            fs.unlinkSync("uploads/" + existsPost.image);
            console.log("image delete");
            await existsPost.destroy();
            await existsLike.destroy();
            
            res.status(200).send({
                result: {
                    success: true,
                }
                
            });
        }
    } catch(error) {
        console.log(error);
    }
    
});


// 게시글 좋아요 api
router.get('/post/:postId/like', authMiddleware, async (req, res) => {
    console.log("게시글 좋아요 api");
    const { userId } = res.locals.user;
    const { postId } = req.params;
    const { done } = req.body;

    const existsLike = await Like.findOne({
        where: {
            userId,
            postId,
        },
    });

    // 좋아요가 저장되있는 경우
    if (existsLike) {
        if(existsLike.done == true) {
            existsLike.done = false;
            await existsLike.save();
        }else {
            existsLike.done = true;
            await existsLike.save();
        }
    } else {
        // 좋아요 저장 안되있는 경우
        await Like.create({
            userId,
            postId,
            done
        });
    }
    res.status(200).send({
        result: {
            success: true
        }
        
    });
});



app.use(cors());
app.use(express.static('uploads'));
app.use(morgan('dev'));
app.use(express.json());
app.use('/api', express.urlencoded({ extended: false }), router);
app.listen(3000, () => {
    console.log('서버가 요청을 받을 준비가 됐어요');
});



const multer = require('multer');
const path = require('path');
const fs = require('fs');

try {
    fs.readdirSync('uploads');
} catch(error) {
    console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
    fs.mkdirSync('uploads');
}

const fileFilter = (req, file, cb) => {
    // 확장자 필터
    if(
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg"
    ) {
        cb(null, true); // 해당하는 mimetype만 받음
    } else {
        req.fileValidationError = "jpg, jpeg, png, gif, webp 파일만 업로드 가능합니다.";
        cb(null, false);
    }
};

const upload = multer({
    storage: multer.diskStorage({
        destination(req, file, done) {
            done(null, './uploads');
        },
        filename(req, file, done) {
            const ext = path.extname(file.originalname);
            done(null, path.basename(file.originalname, ext) + Date.now() + ext);
        },
    }),
    fileFilter : fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
});


module.exports = { upload };



const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log(`${process.env.UPLOAD_DIR}/avatars`);
        const uploadPath = `${process.env.UPLOADS_DIR}/avatars` || '/data/uploads/avatars';

        // create folder if it doesnt exist
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const utorid = req.auth.utorid;
        const ext = path.extname(file.originalname);
        cb(null, `${utorid}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 
    }
});

module.exports = upload;
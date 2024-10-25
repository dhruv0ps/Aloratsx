const multer = require('multer');
const path = require('path');

// const imageStorage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'uploads/image/');
//     },
//     filename : (req,file,cb) => {
//         cb(null,Date.now() + path.extname(file.originalname));
//  }
// });

// const imageUpload = multer({
//     storage: imageStorage,
//     limits: { fileSize: 1 * 1024 * 1024 },
//     // fileFilter: (req, file, cb) => {
//     //     if (file.mimetype.startsWith('image/')) {
//     //         cb(null, true);
//     //     } else {
//     //         cb(new Error('Not an image! Please upload an image.'), false);
//     //     }
//     // }
// });
const fs = require('fs');
const imageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const imageUpload = multer({
    storage: imageStorage,
    limits: { fileSize: 1 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Not an image! Please upload an image.'), false);
        }
    }
});

const fileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/files/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const fileUpload = multer({
    storage: fileStorage,
    limits: { fileSize: 1 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        // console.log(file.mimetype)
        const filetypes = /csv|xlsx|vnd.openxmlformats-officedocument.spreadsheetml.sheet/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Unsupported file type! Please upload a CSV or Excel file.'));
    }
});

module.exports = {
    imageUpload,
    fileUpload
};

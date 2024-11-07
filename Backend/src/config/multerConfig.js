// const multer = require('multer');
// const path = require('path');

// // const imageStorage = multer.diskStorage({
// //     destination: function (req, file, cb) {
// //         cb(null, 'uploads/image/');
// //     },
// //     filename : (req,file,cb) => {
// //         cb(null,Date.now() + path.extname(file.originalname));
// //  }
// // });

// // const imageUpload = multer({
// //     storage: imageStorage,
// //     limits: { fileSize: 1 * 1024 * 1024 },
// //     // fileFilter: (req, file, cb) => {
// //     //     if (file.mimetype.startsWith('image/')) {
// //     //         cb(null, true);
// //     //     } else {
// //     //         cb(new Error('Not an image! Please upload an image.'), false);
// //     //     }
// //     // }
// // });
// const fs = require('fs');
// const imageStorage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         const uploadDir = 'uploads';
//         if (!fs.existsSync(uploadDir)) {
//             fs.mkdirSync(uploadDir, { recursive: true });
//         }
//         cb(null, uploadDir);
//     },
//     filename: function (req, file, cb) {
//         cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
//     }
// });
// const imageUpload = multer({
//     storage: imageStorage,
//     limits: { fileSize: 1 * 1024 * 1024 },
//     fileFilter: (req, file, cb) => {
//         if (file.mimetype.startsWith('image/')) {
//             cb(null, true);
//         } else {
//             cb(new Error('Not an image! Please upload an image.'), false);
//         }
//     }
// });

// const fileStorage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'uploads/files/');
//     },
//     filename: function (req, file, cb) {
//         cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
//     }
// });

// const fileUpload = multer({
//     storage: fileStorage,
//     limits: { fileSize: 1 * 1024 * 1024 }, // 5MB limit
//     fileFilter: (req, file, cb) => {
//         // console.log(file.mimetype)
//         const filetypes = /csv|xlsx|vnd.openxmlformats-officedocument.spreadsheetml.sheet/;
//         const mimetype = filetypes.test(file.mimetype);
//         const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//         if (mimetype && extname) {
//             return cb(null, true);
//         }
//         cb(new Error('Unsupported file type! Please upload a CSV or Excel file.'));
//     }
// });

// module.exports = {
//     imageUpload,
//     fileUpload
// };
const { S3Client } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');

// Initialize the S3 Client
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

// Multer S3 Configuration for Images
const imageUpload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.S3_BUCKET_NAME,
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
            cb(null, 'images/' + Date.now().toString() + path.extname(file.originalname));
        }
    }),
    limits: { fileSize: 1 * 1024 * 1024 }, // 1MB limit for images
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Not an image! Please upload an image.'), false);
        }
    }
});

// Multer S3 Configuration for Files
const fileUpload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.S3_BUCKET_NAME,
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
            cb(null, 'files/' + Date.now().toString() + path.extname(file.originalname));
        }
    }),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit for files
    fileFilter: (req, file, cb) => {
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

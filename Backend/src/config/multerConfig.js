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

// Utility function to create multer-S3 storage configuration
const createMulterS3Config = (bucket, folder, fileFilter, fileSizeLimit) => {
  return multer({
    storage: multerS3({
      s3: s3,
      bucket: bucket,
      metadata: (req, file, cb) => {
        cb(null, { fieldName: file.fieldname });
      },
      key: (req, file, cb) => {
        cb(null, `${folder}/${Date.now().toString()}${path.extname(file.originalname)}`);
      },
    }),
    limits: { fileSize: fileSizeLimit },
    fileFilter: fileFilter,
  });
};

// File filter for images
const imageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload an image.'), false);
  }
};

// File filter for CSV and Excel files
const csvExcelFileFilter = (req, file, cb) => {
  const allowedTypes = /csv|xlsx|vnd.openxmlformats-officedocument.spreadsheetml.sheet/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type! Please upload a CSV or Excel file.'), false);
  }
};

// Image upload configuration with 1MB size limit
const imageUpload = createMulterS3Config(
  process.env.S3_BUCKET_NAME,
  'images',
  imageFileFilter,
  1 * 1024 * 1024
);

// File upload configuration with 5MB size limit
const fileUpload = createMulterS3Config(
  process.env.S3_BUCKET_NAME,
  'files',
  csvExcelFileFilter,
  5 * 1024 * 1024
);

module.exports = {
  imageUpload,
  fileUpload,
};

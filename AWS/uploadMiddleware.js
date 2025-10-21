// import multer from "multer";
// import { v4 } from "uuid";

// // upload multiple files with different names
// const uploads = multer({ dest: "uploads" }).fields([
//   { name: "avatar", maxCount: 1 },
//   { name: "profile", maxCount: 1 },
// ]);

// // custom file name
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads");
//   },
//   filename: (req, file, cb) => {
//     const { originalname } = file;
//     cb(null, `${v4()}-${originalname}`);
//   },
// });

// const fileFilter = (req, file, cb) => {
//   if (file.mimetype.split("/")[0] === "image") {
//     cb(null, true);
//   } else {
//     cb(new Error(multer.MulterError), false);
//   }
// };

// const upload = multer({
//   storage,
//   fileFilter,
//   limits: { fileSize: 1000000, files: 2 },
// }).array("file", 2); // Assuming you want to handle "file" field with 2 files.;

// export default upload;

// // error handling middleware
// app.use((error, req, res, next) => {
//   if (error instanceof MulterError) {
//     if (error.code === "LIMIT_FILE_SIZE") {
//       res.status(400).json({
//         success: false,
//         message: "Error in file upload",
//         err: err.message,
//       });
//     }
//   }
// });

// MULTER WITH AWS S3

const storage = multer.memoryStorage();
const upload = multer({ storage }).single("image");

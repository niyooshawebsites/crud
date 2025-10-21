import multer from "multer";
// import { v4 } from "uuid";

// single file upload with one file input field
// const singleUpload = multer({ dest: "uploads" }).single("avatar");

// mutliple file upload with one file input field
// const multipleUpload = multer({ dest: "uploads" }).array("gallery", 2);

// mutiple file upload with mutiple file input fields
// const multipleUploadWithMultipleFields = multer({ dest: "uploads" }).fields([
//   { name: "mainImage", maxCount: 1 },
//   { name: "galleryImages", maxCount: 2 },
// ]);

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads");
//   },
//   filename: (req, file, cb) => {
//     const orgName = file.originalname;
//     cb(null, `${v4()}-${orgName}`);
//   },
// });

// const fileFilter = (req, file, cb) => {
//   if (
//     file.mimetype === "image/png" ||
//     file.mimetype === "image/jpg" ||
//     file.mimetype === "image/jpeg"
//   ) {
//     cb(null, true);
//   } else {
//     cb("Uploaded file now allowed", false);
//   }
// };

// const upload = multer({
//   storage,
//   fileFilter,
//   limits: { fileSize: 1000000, files: 2 },
// }).array("projects", 3);

const storage = multer.memoryStorage();
const upload = multer({ storage }).single("avatar");

export default upload;

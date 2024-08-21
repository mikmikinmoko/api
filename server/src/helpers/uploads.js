import path from "path";
import fs from "fs";
import multer from "multer";
import mime from "mime-types";
import randomize from "randomatic";
import moment from "moment";

const storage = (options) =>
  multer.diskStorage({
    destination: (req, _file, cb) => {
      const destPath = path.join("public", options.filePath(req, _file));
      const isExists = fs.existsSync(destPath);

      if (!isExists) {
        fs.mkdirSync(destPath, { recursive: true });
      }

      cb(null, destPath);
    },
    filename: (_req, file, cb) => {
      let ext = path.extname(file.originalname).toLowerCase();
      let date = moment().format("YYYYMMDDHHmmss");
      let filename = `${file.fieldname}.${randomize("A0", 11)}${date}${ext}`;

      cb(null, filename);
    },
  });

const upload = (options) =>
  multer({
    storage: storage(options),
    fileFilter: (_req, file, cb) => {
      const mimeType = file.mimetype;
      const fileExt = path.extname(file.originalname).toLowerCase();
      const mimeToExtensions = {
        "image/jpeg": [".jpeg", ".jpg"],
        "image/jpg": [".jpg"],
        "image/png": [".png"],
        "image/gif": [".gif"],
      };

      if (mimeToExtensions[mimeType]) {
        // Check if the extension matches the MIME type
        if (mimeToExtensions[mimeType].includes(fileExt)) {
          cb(null, true); // Accept the file
        } else {
          cb(new Error("File extension does not match MIME type")); // Reject the file
        }
      } else {
        cb(new Error("Invalid file type")); // Reject the file
      }
    },
  });

export default upload;

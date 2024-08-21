import fs from "fs/promises";
import { isEmpty } from "lodash";

export const unlinkSingle = async (file) => {
  try {
    if (!isEmpty(file)) {
      await fs.unlink(file.path);
      console.log(`Successfully unlinked: ${file.path}`);
    }
  } catch (err) {
    console.log("unlinking error", err);
    throw new Error(`Error unlinking file`);
  }
};

export const unlinkMultiple = async (files) => {
  try {
    if (files.length > 0) {
      for (const file of files) {
        console.log("unlink file", file);
        await fs.unlink(file.path);
        console.log(`Successfully unlinked`);
      }
    }
  } catch (err) {
    console.log("unlinking error", err);
    throw new Error("Error unlinking files");
  }
};

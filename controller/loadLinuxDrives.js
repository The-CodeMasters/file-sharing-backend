const path = require("path");
const fs = require("fs");
let os = require("os");

const CURRENT_USER = os.userInfo().username;
let DRIVES = `/media/${CURRENT_USER}`;
const HOME = os.homedir();

const {
  isDir,
  convertBytes,
  getDirTotalSize,
} = require("../util/UtilFunction");

const LoadLinuxDrives = (req, res) => {
  fs.readdir(DRIVES, function (err, files) {
    if (err) {
      return res.status(400).json("Unable to scan directory: " + err);
    }
    //listing all files using forEach
    const myFiles = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const obj = {};
        obj.name = file;
        obj.type = isDir(path.join(DRIVES, file))
          ? "Dir"
          : file.split(".")[file.split(".").length - 1];
        if (obj.type != "Dir") {
          obj.size = convertBytes(fs.statSync(path.join(DRIVES, file)).size);
        }
        myFiles.push(obj);
      } catch (error) {
        console.log(error);
        return res.status(400).json({ message: error.message });
      }
    }
    return res.status(200).json(myFiles);
  });
};
const LoadLinuxHome = (req, res) => {
  fs.readdir(HOME, function (err, files) {
    //handling error
    if (err) {
      return res.status(400).json("Unable to scan directory: " + err);
    }
    //listing all files using forEach
    const myFiles = [];
    files.forEach(function (file) {
      if (file[0] !== ".") {
        try {
          const obj = {};
          obj.name = file;
          obj.type = isDir(path.join(HOME, file))
            ? "Dir"
            : file.split(".")[file.split(".").length - 1];
          if (obj.type != "Dir") {
            obj.size = convertBytes(fs.statSync(path.join(HOME, file)).size);
          }
          myFiles.push(obj);
        } catch (error) {
          console.log(error);
          return res.status(400).json(error.message);
        }
      }
    });
    return res.status(200).json(myFiles);
  });
};
module.exports = { LoadLinuxDrives, LoadLinuxHome };

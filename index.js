const express = require("express");
const app = express();
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
let os = require("os");

const CURRENT_USER = os.userInfo().username;
const PORT = 8080;
let ActiveDir = `/media/${CURRENT_USER}`;
const HOME = os.homedir();
const driveRoute = require("./routes/index");
const { isDir, convertBytes, getDirTotalSize } = require("./util/UtilFunction");

app.use(driveRoute);
// app.get("", (req, res) => {
//   fs.readdir(ActiveDir, function (err, files) {
//     //handling error
//     if (err) {
//       return res.status(400).json("Unable to scan directory: " + err);
//     }
//     //listing all files using forEach
//     const yn = [];
//     files.forEach(function (file) {
//       try {
//         const obj = {};

//         obj.name = file;

//         obj.type = isDir(path.join(ActiveDir, file))
//           ? "Dir"
//           : file.split(".")[file.split(".").length - 1];
//         if (obj.type != "Dir") {
//           obj.size = convertBytes(fs.statSync(path.join(ActiveDir, file)).size);
//         }
//         yn.push(obj);
//       } catch (error) {
//         console.log(error);
//         return;
//       }
//     });
//     return res.status(200).json(yn);
//   });
// });
app.get("/home", (req, res) => {
  fs.readdir(HOME, function (err, files) {
    //handling error
    if (err) {
      return res.status(400).json("Unable to scan directory: " + err);
    }
    //listing all files using forEach
    const yn = [];
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
          yn.push(obj);
        } catch (error) {
          console.log(error);
          return;
        }
      }
    });
    return res.status(200).json(yn);
  });
});
app.get("/home/*", (req, res) => {
  const myPath = path.join(HOME, req.params["0"]);
  console.log({ myPath, params: req.params["0"] });
  if (!isDir(myPath)) {
    res.sendFile(myPath);
  } else {
    fs.readdir(myPath, function (err, files) {
      //handling error
      if (err) {
        return res.status(400).json("Unable to scan directory: " + err);
      }
      //listing all files using forEach
      const yn = [];
      files.forEach(function (file) {
        if (file[0] !== ".") {
          try {
            const obj = {};
            obj.name = file;
            obj.type = isDir(path.join(myPath, file))
              ? "Dir"
              : file.split(".")[file.split(".").length - 1];
            if (obj.type != "Dir") {
              obj.size = convertBytes(
                fs.statSync(path.join(myPath, file)).size
              );
            }
            yn.push(obj);
          } catch (error) {
            console.log(error);
            return;
          }
        }
      });
      return res.status(200).json(yn);
    });
  }
});
app.get("*", (req, res) => {
  const myPath = path.join(ActiveDir, req.params["0"]);
  // ActiveDir = myPath;
  console.log(myPath);
  if (!isDir(myPath)) {
    res.sendFile(myPath);
  } else {
    fs.readdir(myPath, function (err, files) {
      //handling error
      if (err) {
        return res.status(400).json("Unable to scan directory: " + err);
      }
      //listing all files using forEach
      const yn = [];
      files.forEach(function (file) {
        const obj = {};
        var stats = fs.statSync(path.join(myPath, file));
        var fileSizeInBytes = stats.size;
        // Convert the file size to megabytes (optional)

        obj.name = file;
        obj.type = isDir(path.join(myPath, file))
          ? "Dir"
          : file.split(".")[file.split(".").length - 1];
        obj.size =
          obj.type == "Dir"
            ? convertBytes(getDirTotalSize(path.join(myPath, file)))
            : convertBytes(fs.statSync(path.join(myPath, file)).size);
        yn.push(obj);
      });
      return res.status(200).json(yn);
    });
  }
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});

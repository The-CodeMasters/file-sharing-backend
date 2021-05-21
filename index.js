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

function isDir(path) {
  try {
    var stat = fs.lstatSync(path);
    return stat.isDirectory();
  } catch (e) {
    // lstatSync throws an error if path doesn't exist
    return false;
  }
}
const convertBytes = function (bytes) {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

  if (bytes == 0) {
    return "n/a";
  }

  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));

  if (i == 0) {
    return bytes + " " + sizes[i];
  }

  return (bytes / Math.pow(1024, i)).toFixed(1) + " " + sizes[i];
};
const getAllFiles = function (dirPath, arrayOfFiles) {
  files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function (file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, file));
    }
  });

  return arrayOfFiles;
};
const getDirTotalSize = function (directoryPath) {
  const arrayOfFiles = getAllFiles(directoryPath);

  let totalSize = 0;

  arrayOfFiles.forEach(function (filePath) {
    totalSize += fs.statSync(filePath).size;
  });

  return totalSize;
};

/* ***************************************************************** */
console.log(os.homedir());

app.get("", (req, res) => {
  fs.readdir(ActiveDir, function (err, files) {
    //handling error
    if (err) {
      return res.status(400).json("Unable to scan directory: " + err);
    }
    //listing all files using forEach
    const yn = [];
    files.forEach(function (file) {
      try {
        const obj = {};

        obj.name = file;

        obj.type = isDir(path.join(ActiveDir, file))
          ? "Dir"
          : file.split(".")[file.split(".").length - 1];
        if (obj.type != "Dir") {
          obj.size = convertBytes(fs.statSync(path.join(ActiveDir, file)).size);
        }
        yn.push(obj);
      } catch (error) {
        console.log(error);
        return;
      }
    });
    return res.status(200).json(yn);
  });
});
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

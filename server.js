const express = require("express");
const mysql = require("mysql");
const connectDB = require("./config/db");
const fs = require("fs");
const CreateReportEng = require("./reports/CreateReportEng");
const CreateReportDev = require("./reports/CreateReportDev");
const CreateReportDevEng = require("./reports/CreateReportDevEng");
const CreateTimeSheet = require("./reports/CreateTimeSheet");
const path = require("path");
require("dotenv").config();
const moment = require("moment");

const app = express();

connectDB();

app.use(express.json({ extended: false }));

// MongoDB
app.use("/api/users", require("./routes/users"));
app.use("/api/auth", require("./routes/auth"));

// mySQL;
// const db_config = {
//   host: "localhost",
//   user: "root",
//   password: "123456789",
//   database: "projectdata"
// };

const db_config = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT
};

let connection;

const handleDisconnect = () => {
  connection = mysql.createConnection(db_config);
  // Recreate the connection, since the old one cannot be reused.

  connection.connect(err => {
    if (err) {
      // The server is either down or restarting (takes a while sometimes).
      console.log(`Error when connecting to db: ${err} at ${Date()}`);
      setTimeout(handleDisconnect, 2000);
      // We introduce a delay before attempting to reconnect, to avoid a hot loop,
      // and to allow our node script to process asynchronous requests in the meantime.
    }

    console.log(`Connected as thread id: ${connection.threadId} at ${Date()}`);
  });

  connection.on("error", function(err) {
    console.log(`db error: ${err} at ${Date()}`);
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      // Connection to the MySQL server is usually lost due to either server restart,
      // or a connnection idle timeout (the wait_timeout server variable configures this)
      handleDisconnect();
    } else {
      throw err;
    }
  });
};

handleDisconnect();

// console.log(connection);

// app.get("/", (req, res) => {
//   res.json({ msg: "Welcome to TechnoStar!" });
// });

app.get("/api/name", (req, res) => {
  const { email } = req.query;

  const QUERY_NAME = `SELECT NICKNAME FROM projectdata.m_employee WHERE EMAIL = "${email}"`;

  connection.query(QUERY_NAME, (error, results, fields) => {
    if (error) {
      return res.send(error);
    } else {
      return res.json({
        data: results
      });
    }
  });
});

app.get("/api/workload/get", (req, res) => {
  const { sunday } = req.query;

  const QUERY_WORKLOAD = `SELECT CONCAT(UPPER(SUBSTR(name,1,1)),SUBSTR(name,2)) AS name, 
  pjid, worktime/60 AS worktime 
  FROM (projectdata.t_personalrecode) WHERE 
  (workdate BETWEEN ${sunday} AND ${moment(sunday, "YYYYMMDD")
    .add(6, "days")
    .format("YYYYMMDD")
    .toString()}) 
    ORDER BY name ASC`;
  connection.query(QUERY_WORKLOAD, (error, results, fields) => {
    if (error) {
      return res.send(error);
    } else {
      return res.json({
        data: results
      });
    }
  });
});

app.get("/api/xlsx/weekly", (req, res) => {
  const { name, sunday } = req.query;

  const file = fs.createReadStream(
    `./public/output/${sunday}_${moment(sunday, "YYYYMMDD")
      .add(6, "days")
      .format("YYYYMMDD")
      .toString()}_${name}.xlsx`
  );

  file.pipe(res);
});

app.get("/api/xlsx/timesheet", (req, res) => {
  const { name, monthStartDate } = req.query;

  const file = fs.createReadStream(
    `./public/output/FlextimeSheetForm_${moment(monthStartDate, "YYYYMM")
      .format("YYYYMM")
      .toString()}_${name}.xlsx`
  );

  file.pipe(res);
});

app.get("/api/weekly/get", (req, res) => {
  const { name, sunday, role } = req.query;

  const QUERY_WEEKLY = `SELECT workdate, pjid, pjname, deadline, expecteddate, percent,
  worktime, comment, starthour, startmin, endhour, endmin, count, name, subid, subname
    FROM (projectdata.t_personalrecode) WHERE name = '${name}'
    && (workdate BETWEEN ${sunday} AND ${moment(sunday, "YYYYMMDD")
    .add(6, "days")
    .format("YYYYMMDD")
    .toString()})
    ORDER BY workdate ASC`;
  connection.query(QUERY_WEEKLY, (error, results, fields) => {
    if (error) {
      return res.send(error);
    } else {
      if (role === "Engineer") {
        CreateReportEng(name, sunday, results);
      } else if (role === "Developer") {
        CreateReportDev(name, sunday, results);
      } else if (role === "Eng & Dev") {
        CreateReportDevEng(name, sunday, results);
      }
      return res.json({
        data: results
      });
    }
  });
});

app.get("/api/timesheet/get", (req, res) => {
  const { name, monthStartDate } = req.query;

  const QUERY_MONTHLY = `SELECT workdate, worktime, starthour, startmin, endhour, endmin
    FROM (projectdata.t_personalrecode) WHERE name = '${name}'
    && (workdate BETWEEN ${monthStartDate} AND ${moment(
    monthStartDate,
    "YYYYMMDD"
  )
    .add(1, "months")
    .subtract(1, "days")
    .format("YYYYMMDD")
    .toString()})
    ORDER BY workdate ASC`;
  connection.query(QUERY_MONTHLY, (error, results, fields) => {
    if (error) {
      return res.send(error);
    } else {
      CreateTimeSheet(name, monthStartDate, results);
      return res.json({
        data: results
      });
    }
  });
});

app.post("/api/projects/add", (req, res) => {
  const {
    name,
    workdate,
    count,
    pjid,
    pjname,
    subid,
    subname,
    status,
    comment,
    worktime,
    starthour,
    startmin,
    endhour,
    endmin
  } = req.body.params;
  const INSERT_PRODUCTS_QUERY = `INSERT INTO projectdata.t_personalrecode
  (name, workdate, count, pjid, pjname, deadline, expecteddate, subid, subname, percent, comment, worktime, starthour, startmin, endhour, endmin)
  VALUES('${name}','${workdate}','${count}','${pjid}','${pjname}',
  (SELECT deadline FROM projectdata.t_projectmaster WHERE pjid = '${pjid}'),
  (SELECT expecteddate FROM projectdata.t_projectmaster WHERE pjid = '${pjid}'),
  '${subid}','${subname}','${status}','${comment}', '${worktime}', '${starthour}', '${startmin}', '${endhour}', '${endmin}')`;
  connection.query(INSERT_PRODUCTS_QUERY, (error, results, fields) => {
    if (error) {
      return res.send(error);
    } else {
      console.log(`${name} added data at ${Date()}`);
      return res.send("Successfully added weekly data");
    }
  });
});

app.put("/api/projects/update", (req, res) => {
  const {
    name,
    workdate,
    count,
    pjid,
    pjname,
    subid,
    subname,
    status,
    comment,
    worktime,
    starthour,
    startmin,
    endhour,
    endmin
  } = req.body.params;
  // console.log(req.body.params);
  const UPDATE_PRODUCTS_QUERY = `UPDATE projectdata.t_personalrecode
  SET pjid = '${pjid}', pjname = '${pjname}',
  deadline = (SELECT deadline FROM projectdata.t_projectmaster WHERE pjid = '${pjid}'),
  expecteddate = (SELECT expecteddate FROM projectdata.t_projectmaster WHERE pjid = '${pjid}'),
  subid = '${subid}', subname = '${subname}', percent = '${status}', comment = '${comment}', worktime = '${worktime}',
  starthour = '${starthour}', startmin = '${startmin}', endhour = '${endhour}', endmin = '${endmin}'
  WHERE name = '${name}' AND workdate = '${workdate}' AND count = '${count}'`;
  connection.query(UPDATE_PRODUCTS_QUERY, (error, results, fields) => {
    if (error) {
      return res.send(error);
    } else {
      console.log(`${name} updated data at ${Date()}`);
      return res.send("Successfully updated weekly data");
    }
  });
});

app.delete("/api/projects/delete", (req, res) => {
  const { name, workdate, count } = req.query;
  const DELETE_PRODUCTS_QUERY = `DELETE FROM projectdata.t_personalrecode WHERE name = '${name}' AND workdate = '${workdate}' AND count = '${count}'`;
  connection.query(DELETE_PRODUCTS_QUERY, (error, results, fields) => {
    if (error) {
      return res.send(error);
    } else {
      console.log(`${name} deleted data at ${Date()}`);
      return res.send("Successfully deleted weekly data");
    }
  });
});

app.get("/api/personal", (req, res) => {
  const { name, workdate } = req.query;
  const QUERY_PERSONAL = `SELECT pjid, subid, percent, comment, worktime, starthour, startmin, endhour, endmin
    FROM (SELECT PC.*, PJ.scode FROM projectdata.t_personalrecode AS PC
    JOIN projectdata.t_projectmaster AS PJ
    ON PC.pjid = PJ.pjid
    WHERE scode = 0) AS TB WHERE name = '${name}' && workdate = '${workdate}' 
    ORDER BY CAST(count AS UNSIGNED) ASC`;
  connection.query(QUERY_PERSONAL, (error, results, fields) => {
    if (error) {
      return res.send(error);
    } else {
      console.log(`${name} logged in at ${Date()}`);
      return res.json({
        data: results
      });
    }
  });
});

const QUERY_PROJECTS =
  "SELECT pjid, pjname_en, pjname_jp FROM projectdata.t_projectmaster WHERE scode = 0";
const QUERY_SUBS =
  "SELECT subid, subname_en, subname_jp FROM projectdata.m_submaster";

app.get("/api/projects", (req, res) => {
  connection.query(QUERY_PROJECTS, (error, results, fields) => {
    if (error) {
      return res.send(error);
    } else {
      return res.json({
        data: results
      });
    }
  });
});

app.get("/api/subs", (req, res) => {
  connection.query(QUERY_SUBS, (error, results, fields) => {
    if (error) {
      return res.send(error);
    } else {
      return res.json({
        data: results
      });
    }
  });
});

app.get("/api/daily", (req, res) => {
  const { name, sortBy } = req.query;
  const QUERY_DAILY = `SELECT workdate, pjid, pjname, deadline, expecteddate,
  subid, subname, percent, comment, worktime, starthour, startmin, endhour, endmin
    FROM (projectdata.t_personalrecode) WHERE name = '${name}' ORDER BY workdate ${sortBy}, 
    CAST(count AS UNSIGNED) ${sortBy}`;
  connection.query(QUERY_DAILY, (error, results, fields) => {
    if (error) {
      return res.send(error);
    } else {
      console.log(`${name} queried daily history at ${Date()}`);
      return res.json({
        data: results
      });
    }
  });
});

app.get("/api/comments", (req, res) => {
  const { name } = req.query;
  const RESET_SQL_MODE = `SET GLOBAL sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));`;
  connection.query(RESET_SQL_MODE, (error, results, fields) => {
    if (error) {
      return res.send(error);
    } else {
      console.log(`Comments sent at ${Date()}`);
    }
  });

  const QUERY_COMMENTS = `SELECT pjid, comment, CC FROM (SELECT pjid, comment, COUNT(comment) AS CC
  FROM (SELECT PC.*, PJ.scode FROM projectdata.t_personalrecode AS PC
    JOIN projectdata.t_projectmaster AS PJ
    ON PC.pjid = PJ.pjid
    WHERE scode = 0) AS TB
    WHERE TB.name = '${name}' GROUP BY comment) AS B
    ORDER BY CC DESC`;
  connection.query(QUERY_COMMENTS, (error, results, fields) => {
    if (error) {
      return res.send(error);
    } else {
      // console.log(res);
      return res.json({
        data: results
      });
    }
  });
});

// Serve static assets in production
// if (process.env.NODE_ENV === "production") {
//   // Set static folder
//   app.use(express.static("client/build"));

//   app.get("*", (req, res) =>
//     res.sendFile(path.resolve(__dirname, "client", "build", "index.html"))
//   );
// }

app.use(express.static("client/build"));

app.get("*", (req, res) =>
  res.sendFile(path.resolve(__dirname, "client", "build", "index.html"))
);

// For development:
// const PORT = process.env.PORT || 4000;

// For client build:
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

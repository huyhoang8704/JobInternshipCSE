const app = require("express")();
const bodyParser = require("body-parser");
const http = require("http").createServer(app);
const cors = require("cors");
const axios = require("axios");
const nodemailer = require("nodemailer");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
require("dotenv").config();

app.get("/", function (req, res) {
  let config = {
    method: "get",
    maxBodyLength: Infinity,
    url: "https://internship.cse.hcmut.edu.vn/home/company/all",
    headers: {
      Cookie:
        "ntt=s%3A7-XR9dLZLUhGK5NeiAFqEsUwoJ2YnpOb.uWW1ikiw3M%2BNEpymA1pCZ8EmxzIhYGzLcla7dmysByo",
    },
  };

  axios
    .request(config)
    .then((response) => {
      res.json({ message: "success", data: response.data.items });
    })
    .catch((error) => {
      console.log(error);
    });
});

var prevOldJDID = "";

setInterval(async function () {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "phdhuy1@gmail.com",
      pass: "prxb dopf rxak uemh",
    },
  });
  EMAIL = process.env.EMAIL;
  newdata = [];

  let config = {
    method: "get",
    maxBodyLength: Infinity,
    url: "https://internship.cse.hcmut.edu.vn/home/company/all",
  };

  axios
    .request(config)
    .then((response) => {
      newdata = response.data.items;
      if (newdata[newdata.length - 1]._id == prevOldJDID || prevOldJDID == "") {
        return newdata[newdata.length - 1]._id;
      }
      prevOldJDID = newdata[newdata.length - 1]._id;

      let config1 = {
        method: "get",
        maxBodyLength: Infinity,
        url: `https://internship.cse.hcmut.edu.vn/home/company/id/${prevOldJDID}`,
        headers: {
          Host: "internship.cse.hcmut.edu.vn",
        },
      };

      let newDataItem = {};

      axios
        .request(config1)
        .then((response) => {
          newDataItem = response.data.item;
          if (newDataItem.description.includes("nhận đủ SV")) {
            console.log("No new JD");
            return prevOldJDID;
          }

          const mailOptions = {
            from: "phdhuy1@gmail.com",
            to: EMAIL,
            subject: "New JD from Internship CSE HCMUT",
            html: `<!DOCTYPE html>
            <html>
            <head>
            <meta charset="UTF-8">
            <title>New JD from Internship CSE HCMUT</title>
            </head>
            <body>
                <h2>Hello, there is a new job from Internship CSE HCMUT:</h2>
                <h3>Name: ${newDataItem.shortname}</h3>
                <p>Address: ${newDataItem.address}</p>
                <p>Internship File: <a href="https://internship.cse.hcmut.edu.vn${newDataItem.internshipFile}">link to JD</a></p>
                <h3>Description:</h3>
                <p>${newDataItem.description}</p>
                <h3>Work:</h3>
                <p>${newDataItem.work}</p>
            </body>
            </html>
                `,
          };

          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error("Error sending email:", error);
            } else {
              console.log("Email sent:", info.response);
            }
          });

          return prevOldJDID;
        })
        .catch((error) => {
          console.log(error);
        });
    })
    .catch((error) => {
      console.log(error);
    });
}, 30 * 1000);

http.listen(4000, function () {
  console.log("listening on port 4000");
});

app.use(cors());

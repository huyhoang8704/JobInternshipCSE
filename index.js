const app = require("express")();
const bodyParser = require("body-parser");
const http = require("http").createServer(app);
const cors = require("cors");
const axios = require("axios");
const nodemailer = require("nodemailer");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
require("dotenv").config();

app.use(cors());

// Store all JDs
let jdIds = [];


app.get("/", function (req, res) {
  getJDs()
    .then((jds) => res.json({ message: "success", data: jds }))
    .catch((error) => console.log(error));
});

setInterval(async function () {
  checkForNewJDs();
}, 1000);

http.listen(4000, function () {
  console.log("listening on port 4000 ");
});

// Get Job Descriptions from the HCMUT website 
async function getJDs() {
  let config = {
    method: "get",
    maxBodyLength: Infinity,
    url: "https://internship.cse.hcmut.edu.vn/home/company/all",
    headers: {
      Cookie:
        "ntt=s%3A7-XR9dLZLUhGK5NeiAFqEsUwoJ2YnpOb.uWW1ikiw3M%2BNEpymA1pCZ8EmxzIhYGzLcla7dmysByo",
    },
  };

  const response = await axios.request(config);
  // console.log(response.data.item.internshipFiles[0].path)
  return response.data.items;
}

// Check for new Job Descriptions
async function checkForNewJDs() {
  const newJDs = await getJDs();
  if (jdIds.length === 0) {
    jdIds = newJDs.map((jd) => jd._id);
    console.log("Initial JDs loaded:", jdIds);
    console.log("JD count:", jdIds.length);
    return;
  }
  const newJDIds = newJDs.map((jd) => jd._id);

  newJDIds.forEach((id) => {
    if (!jdIds.includes(id)) {
      jdIds.push(id);
      console.log("New JD found:", id);
      sendEmailNotification(id);
    }
  });
}

async function sendEmailNotification(id) {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  EMAIL = process.env.EMAIL;

  let config1 = {
    method: "get",
    maxBodyLength: Infinity,
    url: `https://internship.cse.hcmut.edu.vn/home/company/id/${id}`,
    headers: {
      Host: "internship.cse.hcmut.edu.vn",
    },
  };

  const response = await axios.request(config1);
  const newDataItem = response.data.item;
  console.log(newDataItem)

  // if (
  //   newDataItem &&
  //   newDataItem.description &&
  //   newDataItem.description.includes("nhận đủ SV")
  // ) {
  //   console.log("No new JD");
  //   return;
  // }

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: EMAIL,
    subject: "New Job from Internship CSE HCMUT",
    html: `<!DOCTYPE html>
    <html>
    <head>
    <meta charset="UTF-8">
    <title>New JD from Internship CSE HCMUT</title>
    </head>
    <body>
        <h2>Hello, there is a new job from Internship CSE HCMUT:</h2>
        <h3>Name: ${newDataItem.fullname}</h3>
        <p>Address: ${newDataItem.address}</p>
        <p>Internship File: <a href="https://internship.cse.hcmut.edu.vn${newDataItem.internshipFiles[0].path}">link to JD</a></p>
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
}

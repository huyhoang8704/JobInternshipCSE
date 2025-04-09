const app = require("express")();
const bodyParser = require("body-parser");
const http = require("http").createServer(app);
const cors = require("cors");
const axios = require("axios");
const nodemailer = require("nodemailer");
const { emails } = require("./data/emails");
const { saveJDsToFile, loadJDsFromFile } = require("./utils/FileIO");
const { createMailOption } = require("./utils/MailOption");

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


http.listen(4000, function () {
  console.log("listening on port 4000 ");
  jdIds = loadJDsFromFile();
  setInterval(async function () {
    console.log("Checking for new JDs...");
    await checkForNewJDs();
  }, 10000);

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
  const newJDIds = newJDs.map((jd) => jd._id);
  const promises = []
  newJDIds.forEach((id) => {
    if (!jdIds.includes(id)) {
      jdIds.push(id);
      console.log("New JD found:", id);
      promises.push(sendEmailNotification(id));
    }
  });
  await Promise.all(promises);
  saveJDsToFile(jdIds)
}

async function sendEmailNotification(id) {
  console.log({
    service: "Gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  })

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });


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
  for (const email of emails) {
    console.log("Sending email to:", email);
    try {
      const result = await transporter.sendMail(createMailOption(email, newDataItem));
      console.log("Email sent:", result.response);
    } catch (error) {
      console.error("Error sending email:", error);
    }
  }
}




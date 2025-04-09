require("dotenv").config();
function createMailOption(receiverMail, newDataItem) {
    const options =  {
        from: process.env.GMAIL_USER,
        to: receiverMail,
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
            <p>Internship File: <a href="https://internship.cse.hcmut.edu.vn${newDataItem?.internshipFiles[0]?.path}">link to JD</a></p>
            <h3>Description:</h3>
            <p>${newDataItem.description}</p>
            <h3>Work:</h3>
            <p>${newDataItem.work}</p>
        </body>
        </html>
            `,
    };
    console.log("options", options);
    return options
}

module.exports = { createMailOption };
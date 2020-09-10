var nodemailer = require('nodemailer');

const sendEmail = async (email, key) => {

	var transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: 'salvationgames9@gmail.com',//replace with your email
			pass: 'Welcome@123'//replace with your password
		}
	});

	var mailOptions = {
		from: 'salvationgames9@gmail.com',//replace with your email
		to: email,//replace with your email
		subject: 'OTP',
		html:`<h1>OTP details</h1>
		<h2> OTP:${key} </h2><br>`
	};

	await transporter.sendMail(mailOptions);
}

module.exports = sendEmail
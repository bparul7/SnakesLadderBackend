const sendGridApiKey = process.env.SENDGRID_API_KEY || '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'

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(sendGridApiKey);

const SendVerificationEmail = async (email, key) => {
		sgMail.send ({
			to : email,
			from : 'bparul999@gmail.com',
			subject : 'Verify Your Account',
			text : 'OTP: ' + key
		})
}

module.exports = {
	SendVerificationEmail
}
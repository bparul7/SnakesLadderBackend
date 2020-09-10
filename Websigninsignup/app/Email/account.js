const sendGridApiKey = process.env.SENDGRID_API_KEY || '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';

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
const express = require ('express')
const route = new express.Router();
const User = require ('../model/user.js')

//save data
route.post ('/users', async (req, res) => {
	const me = new User (req.body)
	try {
		await me.save ();
		const ret = {
			status : 1,
			message : "Successfully created the account",
			data : me
		}
		res.status (201).send (ret);
	}
	catch (e) {
		const ret = {
			status : 0,
			error : "Some error occured while saving to database",
			data : "false"
		}
		res.status (500).send (ret);
	}
})

//login users
route.post ('/users/login', async(req, res) => {
	try {
		const user = await User.loginCredentials (req.body.email, req.body.password);
		const ret = {
			status : 1,
			message : "Successfully Logged in",
			data : {

			}
		}
		res.send (ret);
	}
	catch (e) {
		const ret = {
			status : 0,
			error : "Unable to Login",
			data : "false"
		}
		res.status (400).send (ret);
	}
})

module.exports = route
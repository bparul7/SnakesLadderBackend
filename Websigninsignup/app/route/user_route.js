const express = require ('express')
const route = new express.Router();
const User = require ('../model/user.js')
const auth = require ('../middleware/auth.js')

//create Account
route.post ('/users', async (req, res) => {
	const me = new User (req.body)
	try {
		await me.save ();
		//created token
		const token = await me.generateToken ();
		const ret = {
			status : 1,
			message : "Successfully created the account",
			data : token
		}
		res.status (201).send (ret);
	}
	catch (e) {
		const ret = {
			status : 0,
			error : e.message,
			data : "false"
		}
		res.status (500).send (ret);
	}
})

//login users
route.post ('/users/login', async(req, res) => {
	try {
		const user = await User.loginCredentials (req.body.email, req.body.password);
		const token = await user.generateToken ();
		const ret = {
			status : 1,
			message : "Successfully Logged in",
			data : token
		}
		res.send (ret);
	}
	catch (e) {
		const ret = {
			status : 0,
			error : e.message,
			data : "false"
		}
		res.status (400).send (ret);
	}
})

//Get Profile
route.get ('/users/me', auth, async(req, res) => {
	const user = req.user;
	const ans = {
		status : 1,
		message : "Your Profile",
		data :  {user} 
	}
	res.send (ans);
})

//Update Profile
route.patch ('/users/updateme', auth, async(req, res) => {
	try {
		const user = req.user;
		console.log (user)
		const change = req.body;
		console.log (change)
		const update = (Object.keys (change));
		const fields = ["name", "password"];
		for (const v in update) {
			if (!fields.includes (update[v])) {
				const ans = {
					status : 0,
					error : update[v] + " :Key cannot be updated",
					data : {}
				}
				res.send (ans);
			}
		}
		update.forEach ((upd) => {
			user[upd] = change[upd]
		})
		await user.save();
		const ans = {
			status : 1,
			message : "user information have been updated",
			data : user
		}
		res.send (ans)
	}
	catch (e) {
		const ans = {
			status : 0,
			error : e.message,
			data : {}
		}
		res.send (ans)
	}
})
//LogOut
route.post ('/users/logOut', auth, async (req, res) => {
	const user = req.user;
	//update token array
	try {
		user.tokens = user.tokens.filter ((tokens) => {
			return (tokens.token !== req.token)
		})
		await user.save ();
		const ans = {
			status : 1,
			message : "Successfully Logged Out"
		}
		res.send (ans);
	}
	catch (e) {
		const ans = {
			status : 0,
			message : e.message
		}
		res.send (ans);
	}
})

//logOut of all sessions
route.post ('/users/logOutAll', auth, async (req, res) => {
	const user = req.user;
	try {
		user.tokens = [];
		await user.save();
		const ans = {
			status : 1,
			message : "Successfully Logged Out of all sessions"
		}
		res.send (ans);
	}
	catch (e) {
		const ans = {
			status : 0,
			message : e.message
		}
		res.send (ans)
	}
})

module.exports = route
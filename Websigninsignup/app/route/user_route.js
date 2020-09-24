const express = require ('express')
const route = new express.Router();
const User = require ('../model/user.js')
const auth = require ('../middleware/auth.js')
const SendVerificationEmail = require ('../Email/account.js').SendVerificationEmail
const SendEmail = require ('../Email/nodemailer.js')
const multer = require ('multer')
const cloudinary = require ('cloudinary')
const Datauri = require ('datauri/parser')
const dUri = new Datauri();
const avatarStore = require ('../model/avatarList.js')
console.log (SendEmail)
//create Account
route.post ('/users', async (req, res) => {
	const me = new User (req.body)
	try {
		await me.save ();
		//created token
		const token = await me.generateToken ();
		//send verification email
		SendEmail (me.email, 'Secret'+me._id);
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
		if (user.verify == false) {
			SendEmail (user.email, 'Secret'+user._id);
		}
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

//resend OTP
route.get ('/users/me/resendOTP', auth, async (req, res) => {
	try {
		SendEmail (req.user.email, 'Secret'+req.user._id);
		res.send( "OTP sent, please verify")
	}
	catch (e) {
		res.send (e.message)
	}
})

//verify account
route.post ('/users/me/verify', auth, async (req, res) => {
	try {
		const key = req.body.otp;
		const secretkey = 'Secret'+req.user._id;
		console.log (key)
		console.log (secretkey)
		if (key == secretkey) {
			req.user.verify = 1
			await req.user.save()
			const ret = {
				status : 1,
				message : "Successfully Verified Account",
			}
			res.send (ret);
		}
		else {
			throw new Error ('Incorrect OTP');
		}
	}
	catch (e) {
		const ret = {
			status : 0,
			error : e.message
		}
		res.send (ret)
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

//upload images
const upload = multer ({
	limits : {
		fileSize : 1000000
	},
	fileFilter (req, file, cb) {
		if (!file.originalname.match (/\.(jpg|jpeg|png)$/)) {
			return cb (new Error ("Please upload correct image file"))
		}
		cb (undefined, true)
	}
})

route.post ('/upload', upload.single('avatar'), async (req, res) => {
	try {
		if (req.file) {
			const ans = dUri.format(req.file.originalname+'.jpg', req.file.buffer);
			const file = ans.content
			var image;
			await cloudinary.uploader.upload (file, (result, error) => {
				if (error)
					throw new Error (error)
				image = result.url
			})
			const view = new avatarStore({
				url : image
			})
			await view.save();
			res.send ({
				status : 1,
				message : "Your image has been uploaded",
				data : {
					image
				}
			})
		}
		else {
			throw new Error ("Please upload some file")
		}
	}
	catch (e) {
		res.send ({
			status : 0,
			error : e.message
		})
	}
}, (error, req, res, next) => {
	res.send ({
		status : 0,
		error : error.message
	})
})

//fetch all avatar
route.get ('/allAvatar', async (req, res) => {
	try {
		const ans = await avatarStore.find ();
		res.send ({
			status : 1,
			data : ans
		})
	}
	catch (e) {
		res.send ({
			status : 0,
			error : e.message
		})
	}
})

route.post ('/users/me/avatar', auth, async (req, res) => {
	try {
		if (req.body.url) {
			req.user.avatar = req.body.url
			await req.user.save();
			res.send ({
				status : 1,
				message : "Your avatar has been updated"
			})
		}
		else {
			throw new Error ("Please upload some avatar")
		}
	}
	catch (e) {
		res.send ({
			status : 0,
			error : e.message
		})
	}
})

route.delete ('/users/me/avatar', auth, async (req, res) => {
	try {
		req.user.avatar = ""
		await req.user.save()
		res.send ({
			status : 1,
			message : "Your avatar has been deleted"
		})
	}
	catch (e) {
		res.send ({
			status : 0,
			error : e.message
		})
	}
})

route.get ('/users/me/avatar', auth, async (req, res) => {
	try {
		const url = req.user.avatar;
		if (!(url === "")) {
			res.send ({
				status : 1,
				avatar : url
			})
		}
		else {
			throw new Error ("You have not added any avatar")
		}
	}
	catch (e) {
		res.send ({
			status : 0,
			error : e.message
		})
	}
})

module.exports = route
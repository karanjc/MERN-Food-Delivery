const express = require("express");
const cors = require('cors')
const morgan = require("morgan");
const dotenv = require('dotenv')
const connectDB = require('./config/config')
const User = require('./Modals/user')
const userRoutes = require('./routes/users');
const authRoutes = require("./routes/auth");
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const userAPI=require('./config/userAPI.js');

//config dotenv
dotenv.config()

 
//connection mongoDb
connectDB()

//Creation of Rest object (to use the functionality of express)
const app = express();

//middlewares
//for adding the routing functions.
app.use(express.json());
app.use(cors());
app.use('/use',userAPI);

//routes
app.use("/api/users",userRoutes);
app.use("/api/auth",authRoutes);

//route
app.post('/api/register', async (req, res) => {
	console.log(req.body)
	try {
		const newPassword = await bcrypt.hash(req.body.password, 10)
		await User.create({
			name: req.body.name,
			email: req.body.email,
			password: newPassword,
		})
		res.json({ status: 'ok' })
	} catch (err) {
		res.json({ status: 'error', error: 'Duplicate email' })
	}
})

app.post('/api/login', async (req, res) => {
	const user = await User.findOne({
		email: req.body.email,
	})

	if (!user) {
		return { status: 'error', error: 'Invalid login' }
	}

	const isPasswordValid = await bcrypt.compare(
		req.body.password,
		user.password
	)

	if (isPasswordValid) {
		const token = jwt.sign(
			{
				name: user.name,
				email: user.email,
			},
			'secret123'
		)

		return res.json({ status: 'ok', user: token })
	} else {
		return res.json({ status: 'error', user: false })
	}
})


const port = process.env.PORT ||8000

app.listen(port,()=>{
    console.log(`Server Running On ${process.env.NODE_ENV} mode on port no ${process.env.PORT}`);
});
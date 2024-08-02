const mongoose = require('mongoose');

const connectionString = 'mongodb+srv://llagosta:5EFxj7cB3I8xj8Mx@cluster0.wninfmo.mongodb.net/dogaround';

mongoose.connect(connectionString, {connectTimeoutMs: 2000})
	.then(() => console.log('Data Connected'))
		.catch(error => console.error('error'));


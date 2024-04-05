import config from "./config.js";
import server from "./app.js";
import connectDb from "./config/db.js";
import setupSocketServer from "./sockets/index.js";

const start = async () => {
	try {
		await connectDb();
		setupSocketServer(server);

		server.listen(config.PORT, () =>
			console.log(`Server is listening on port ${config.PORT}...`)
		);
	} catch (error) {
		console.log(error);
	}
};

start();
import emitter from './emitter';
import env from './env';
import logger from './logger';

// If this file is called directly using node, start the server
if (require.main === module) {
	start();
}

export default async function start() {
	const createServer = require('./server').default;
	const { validateDBConnection } = require('./database');

	const server = await createServer();

	// const apolloServer = new ApolloServer({
	// 	typeDefs, // your schema as a string
	// 	resolvers: [resolvers, noteResolvers], // merge Graphback resolvers with your own
	// 	context: contextCreator // creates a context with Graphback services attached
	//   });

	await validateDBConnection();

	await emitter.emitAsync('server.start.before', { server });

	const port = env.PORT;

	server
		.listen(port, () => {
			logger.info(`Server started at port ${port}`);
			emitter.emitAsync('server.start').catch((err) => logger.warn(err));
		})
		.once('error', (err: any) => {
			if (err?.code === 'EADDRINUSE') {
				logger.fatal(`Port ${port} is already in use`);
				process.exit(1);
			} else {
				throw err;
			}
		});
}

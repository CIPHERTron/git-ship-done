import {startServer} from './src/server.ts';
import {startQueueService} from './src/queueService.ts';

const main = async () => {
    try {
        await startServer();
        await startQueueService();
    } catch (error) {
        console.log('Error starting services:', error);
        process.exit(1);
    }
}

main();
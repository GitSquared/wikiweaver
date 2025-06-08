import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: './.env.local' });

export default {
	resolve: {
		alias: {
			'@': path.resolve(__dirname, 'src'),
		},
	},
};

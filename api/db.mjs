import {server} from 'rest-on-mongo';
import express from 'express';

const app = express();
app.use('/api/db', await server.routes());
export default app

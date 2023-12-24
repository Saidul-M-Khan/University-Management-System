
import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import globalErrorHandler from './app/middleware/globalErrorHandler';
import notFound from './app/middleware/notFound';
import router from './app/routes';

const app: Application = express();

//parsers
app.use(express.json());
app.use(cors());

// application routes
app.use('/api/v1/', router);



const test = async (req: Request, res: Response) => {
  // Promise.reject()
  res.json({
    success: true,
    message: "Welcome to University Management System REST API",
    error: ""
  });
};

app.get('/', test);


app.use(globalErrorHandler)

// not found
app.use(notFound)

export default app;

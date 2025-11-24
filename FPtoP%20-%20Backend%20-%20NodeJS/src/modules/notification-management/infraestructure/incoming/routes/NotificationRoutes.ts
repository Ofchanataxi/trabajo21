import express from 'express';
import { NotificationController } from '../controller/notificationController';
import { GetUserNotification } from '../../../application/use-cases/GetUserNotification';
import { UserNotificationRepository } from '../Database/Repositories/UserNotificationRepository';


const router = express.Router();


const notificationRepository = new UserNotificationRepository
const notificationController = new NotificationController (
  new GetUserNotification(notificationRepository)
)

router.post('/notifications', (req, res, next) =>
  notificationController.getNotification(req, res, next),
);



export default router;

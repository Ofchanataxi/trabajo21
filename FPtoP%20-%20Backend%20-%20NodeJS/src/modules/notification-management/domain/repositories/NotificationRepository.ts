
export interface NotificationRepository {
    notification(req: Request, release: any): Promise<void>;
}
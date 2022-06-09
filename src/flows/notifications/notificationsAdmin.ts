import admin from "firebase-admin";

export default class NotificationsAdmin {
    // TODO : How to deploy the json file?

    private static instance: NotificationsAdmin;
    private serviceAccount = require(process.env.FCM_SERVER_PATH);

    private constructor() {
        admin.initializeApp({
            credential: admin.credential.cert(this.serviceAccount),
            databaseURL: process.env.FCM_SERVER_DB
        });
    }

    public static Instance(): NotificationsAdmin {
        if (!this.instance) this.instance = new NotificationsAdmin();
        return this.instance;
    }

    public sendNotification(message: any) {
        admin.messaging().send(message)
            .then((response) => {
                // Response is a message ID string.
                console.log('Successfully sent message:', response);
            })
            .catch((error) => {
                console.log('Error sending message:', error);
            });
    }

    public sendNotifications(message: any) {
        admin.messaging().sendMulticast(message)
            .then((response) => {
                // Response is a message ID string.
                console.log('Successfully sent message:', response);
            })
            .catch((error) => {
                console.log('Error sending message:', error);
            });
    }

    public sendBulkNotifications(message: [] = []) {
        admin.messaging().sendAll(message)
            .then((response) => {
                // Response is a message ID string.
                console.log('Successfully sent message:', response);
            })
            .catch((error) => {
                console.log('Error sending message:', error);
            });
    }
}
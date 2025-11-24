class Notification {
    constructor(
        public userID: any,
        public message?: any,
        public isRead?: boolean,
        public createdAT?: EpochTimeStamp,

    ) { }
}


export { Notification }
class UserApplicationPagesAccess {
    constructor(
        public user?: User,
        public userGroups?: UserGroups[],
        public modulesAccess?: string[]
    ) { }
}

class User {
    constructor(public id: number, public idBussinessLine: number, public name: String, public lastname: String, public email: String) { }
}

class PageAllowAccess {
    constructor(
        public idGroup: number,
        public pagePath: String,
    ) { }
}

class UserGroups {
    constructor(
        public id: number,
        public name: String,
        public pageAllowAccess: String[],
    ) { }
}

export { UserApplicationPagesAccess, User, PageAllowAccess, UserGroups }
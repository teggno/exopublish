export interface PublishArgs {
    domain: string;
    account: {
        userName: string;
        password: string;
    };
    script: string;
}
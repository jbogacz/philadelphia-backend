export class MongoError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'MongoError';
    }
}

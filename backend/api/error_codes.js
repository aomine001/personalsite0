class ERROR{
    constructor(){
        this.NO_ERROR = 0;
        this.NO_DETAILS = 1;

        // database errors
        this.DATABASE_FAILED = 100;
        this.FETCH_ERROR = 101;

        // user errors
        this.USER_ALREADY_EXISTS = 200;

        // HTTP ERRORS
        this.BAD_REQUEST = 300;
        this.FORBIDDEN = 301;
    }
}

exports.ERROR = new ERROR();

export type ParseResult<T> = {
    success : true;
    value   : T;
} | {
    success : false;
    errors  : string[];
};
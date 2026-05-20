function log() {
    return function (fn) {
        return function (...args) {
            const result = fn.apply(this, args);
            console.log("Called", fn.name, "with", args, "result", result);
            return result;
        };
    };
}

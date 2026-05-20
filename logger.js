function log() {
    return function (fn) {
        return function (...args) {
            try {
                const result = fn.apply(this, args);

                if (result && typeof result.then === 'function') {
                    return result.then(res => {
                        console.log("Async resolve", fn.name, res);
                        return res;
                    }).catch(err => {
                        console.error("Async error", fn.name, err.message);
                        throw err;
                    });
                }

                console.log("Sync return", fn.name, result);
                return result;
            } catch (err) {
                console.error("Sync error", fn.name, err.message);
                throw err;
            }
        };
    };
}

function log({ logger = console } = {}) {
    return function (fn) {
        return function (...args) {
            const startTime = Date.now();
            const timestamp = new Date().toISOString();

            try {
                const result = fn.apply(this, args);

                if (result && typeof result.then === 'function') {
                    return result.then(res => {
                        logger.log(`${timestamp} [ASYNC] ${fn.name} in ${Date.now() - startTime}ms`);
                        return res;
                    }).catch(err => {
                        logger.error(`${timestamp} [ERROR] ${fn.name} in ${Date.now() - startTime}ms`);
                        throw err;
                    });
                }

                logger.log(`${timestamp} [SYNC] ${fn.name} in ${Date.now() - startTime}ms`);
                return result;
            } catch (err) {
                logger.error(`${timestamp} [ERROR] ${fn.name} in ${Date.now() - startTime}ms`);
                throw err;
            }
        };
    };
}

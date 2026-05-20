function log({ level = 'INFO', logger = console } = {}) {
    const createWrapper = (fn) => {
        return function (...args) {
            const startTime = Date.now();
            const timestamp = new Date().toISOString();

            try {
                const result = fn.apply(this, args);

                if (result && typeof result.then === 'function') {
                    return result.then(res => {
                        if (level !== 'ERROR') {
                            logger.log(`[${level}] ${timestamp} ${fn.name} res: ${res}`);
                        }
                        return res;
                    }).catch(err => {
                        logger.error(`[ERROR] ${timestamp} ${fn.name}: ${err.message}`);
                        throw err;
                    });
                }

                if (level !== 'ERROR') {
                    logger.log(`[${level}] ${timestamp} ${fn.name} res: ${result}`);
                }
                return result;
            } catch (err) {
                logger.error(`[ERROR] ${timestamp} ${fn.name}: ${err.message}`);
                throw err;
            }
        };
    };

    return function (target, propertyKey, descriptor) {
        if (!descriptor && typeof target === 'function') {
            return createWrapper(target);
        }
        descriptor.value = createWrapper(descriptor.value);
        return descriptor;
    };
}

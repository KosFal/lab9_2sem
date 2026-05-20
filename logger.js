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
                            logger.log(JSON.stringify({
                                level,
                                timestamp,
                                method: fn.name,
                                args,
                                result: res,
                                duration: Date.now() - startTime
                            }));
                        }
                        return res;
                    }).catch(err => {
                        logger.error(JSON.stringify({
                            level: 'ERROR',
                            timestamp,
                            method: fn.name,
                            args,
                            error: err.message,
                            duration: Date.now() - startTime
                        }));
                        throw err;
                    });
                }

                if (level !== 'ERROR') {
                    logger.log(JSON.stringify({
                        level,
                        timestamp,
                        method: fn.name,
                        args,
                        result,
                        duration: Date.now() - startTime
                    }));
                }
                return result;
            } catch (err) {
                logger.error(JSON.stringify({
                    level: 'ERROR',
                    timestamp,
                    method: fn.name,
                    args,
                    error: err.message,
                    duration: Date.now() - startTime
                }));
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

const customLogger = {
    log: (msg) => console.log(`[STDOUT]: ${msg}`),
    error: (msg) => console.error(`[STDERR]: ${msg}`)
};

class DataProcessor {
    processSync(data) {
        return data.map(item => item * 2);
    }

    async fetchAsync(shouldFail) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (shouldFail) {
                    reject(new Error("Connection timeout"));
                } else {
                    resolve({ status: 200, data: "OK" });
                }
            }, 500);
        });
    }
}

DataProcessor.prototype.processSync = log({ level: 'INFO', logger: customLogger })(DataProcessor.prototype.processSync);
DataProcessor.prototype.fetchAsync = log({ level: 'ERROR', logger: customLogger })(DataProcessor.prototype.fetchAsync);

const wrappedFunction = log({ level: 'DEBUG', logger: customLogger })(
    function calculateSum(a, b) {
        return a + b;
    }
);

const processor = new DataProcessor();

processor.processSync([1, 2, 3]);
wrappedFunction(5, 10);
processor.fetchAsync(false).catch(() => {});
processor.fetchAsync(true).catch(() => {});

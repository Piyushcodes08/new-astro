const isDev = import.meta.env.MODE !== 'production';

const createLogger = (scope = '') => {
  const prefix = scope ? `[vahlayastro:${scope}]` : '[vahlayastro]';
  const wrap = (fn) => (...args) => fn(prefix, ...args);
  return {
    log: isDev ? wrap(console.log.bind(console)) : () => {},
    debug: isDev ? wrap(console.debug.bind(console)) : () => {},
    info: isDev ? wrap(console.info.bind(console)) : () => {},
    warn: wrap(console.warn.bind(console)),
    error: wrap(console.error.bind(console)),
  };
};

const logger = createLogger();
export default logger;
export { createLogger };

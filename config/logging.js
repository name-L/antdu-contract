module.exports = {
    'appenders': [
        {
            'type': 'logLevelFilter',
            'level': 'DEBUG',
            'appender': {
                'type': 'console',
                'layout': {
                    'type': 'pattern',
                    'pattern': '%[[%d{hh:mm:ss.SSS}] [%p] %c : %]%n%m%n'
                }
            }
        }
    ],
    'replaceConsole': true,
    'levels': {
        // "eefung.data-sdk-webapp.time-elapse.restler-base-extend.js": "INFO",
        // "eefung.webapp.session.time-elapse.session-hazelcast.js": "INFO",
        // "eefung.webapp.session.session-hazelcast.js": "INFO",
        // "eefung.socket.io.distribute-base.js": "INFO",
        // "eefung.data-sdk-webapp.token-provider.js": "INFO"
    }
};

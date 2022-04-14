module.exports = {
    'appenders': [
        {
            'type': 'logLevelFilter',
            'level': 'INFO',
            'appender': {
                'type': 'file',
                'filename': 'logs/app.log',
                'comments': '1B * 1024 * 1024 * 10 = 10485760B = 10M',
                'maxLogSize': 10485760,
                'backups': 10,
                'layout': {
                    'type': 'pattern',
                    'pattern': '[%d{MM-dd hh:mm:ss.SSS}] [%p] %c : %n%m%n'
                }
            }
        },
        {
            'type': 'logLevelFilter',
            'level': 'INFO',
            'appender': {
                'type': 'console',
                'layout': {
                    'type': 'pattern',
                    'pattern': '[%d{MM-dd hh:mm:ss.SSS}] [%p] %c : %n%m%n'
                }
            }
        }
    ],
    'replaceConsole': true,
    'levels': {
        'eefung.socket.io.distribute-base.js': 'INFO',
        'eefung.webapp.caster-store.time-elapse.caster-client.js': 'INFO',
        'console': 'INFO'
    }
};

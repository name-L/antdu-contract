module.exports = {
    'appenders': [
        {
            'type': 'logLevelFilter',
            'level': 'INFO',
            'appender': {
                'type': 'log4js-restlet',
                'url': global.log_setting_es_url,
                'indexName': global.log_setting_es_index_name,
                'tags': global.log_setting_es_layout_tags,
                'buffersize': 512,
                'timeout': 30000
            }
        },
        {
            'type': 'logLevelFilter',
            'level': 'INFO',
            'appender': {
                'type': 'file',
                'filename': 'logs/app.log',
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
        'eefung.socket.io.distribute-base.js': 'WARN',
        'eefung.webapp.caster-store.time-elapse.caster-client.js': 'INFO',
        'console': 'INFO'
    }
};

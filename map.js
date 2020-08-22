module.exports = test => !test.startsWith('test') ? undefined : test.replace(/^test/, 'lib')

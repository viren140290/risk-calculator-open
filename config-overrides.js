const multipleEntry = require('react-app-rewire-multiple-entry')([
    {
        entry: 'src/entry/launch.ts',
        template: 'public/launch.html',
        outPath: '/launch.html'
    },
    {
        entry: 'src/entry/launch-open.ts',
        template: 'public/launch-open.html',
        outPath: '/launch-open.html'
    },
]);

module.exports = {
    webpack: function(config, env) {
        multipleEntry.addMultiEntry(config);
        return config;
    }
};

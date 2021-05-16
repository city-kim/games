const path = require('path');

module.exports = {
    outputDir: "./docs",
    configureWebpack: {
        resolve: {
            alias: {
                '@': path.join(__dirname, 'src/')
            }
        }
    }
}

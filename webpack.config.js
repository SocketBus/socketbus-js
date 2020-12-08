const path = require('path');
module.exports = {
    optimization: {
        minimizer: [
            (compiler) => {
                const TerserPlugin = require('terser-webpack-plugin');
                new TerserPlugin({ /* your config */ }).apply(compiler);
            }
        ],
    },
    entry: './src/Index.ts',
    target: 'web',
    mode: 'production',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ],
    },
    output: {
        filename: 'socketbus.min.js',
        path: path.resolve(__dirname, 'dist'),
    },
};
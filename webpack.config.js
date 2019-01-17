const path = require('path')
const HTMLWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    mode: 'development',
    devtool: 'sourcemap',
    entry: path.resolve('demo/index.tsx'),
    output: {
        path: path.resolve('dist/'),
        filename: 'index.js',
    },
    target: 'web',
    module: {
        rules: [{
                test: /\.tsx?$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'ts-loader',
                    options: {
                        happyPackMode: true,
                    }
                },
            },
            {
                test: /\.sass$/,
                use: ['style-loader', 'css-loader', 'sass-loader'],
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            }, {
                test: /\.svg$/,
                use: [{
                        loader: 'url-loader',
                        options: {
                            // removeTags: true
                        },
                    },
                    {
                        loader: 'svgo-loader',
                        options: {
                            plugins: [{
                                    removeTitle: true
                                },
                                {
                                    convertColors: {
                                        shorthex: false
                                    }
                                },
                                {
                                    convertPathData: false
                                }
                            ]
                        }
                    }
                ],
            }
        ],
    },
    resolve: {
        extensions: ['.js', '.ts', '.tsx']
    },
    plugins: [
        new HTMLWebpackPlugin({
            template: path.resolve('./demo/index.html')
        })
    ]
}
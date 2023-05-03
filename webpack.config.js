// module.exports = {
//     plugins: [
//         new webpack.ProvidePlugin({
//                process: 'process/browser',
//         }),
//     ],
//   };

// const path = require('path-browserify');

// module.exports = {
//   // ... other configurations
//   resolve: {
//     // ... other resolve configurations
//     fallback: {
//       path: require.resolve('path-browserify'),
//     },
//   },
// };
module.exports = {
    resolve: {
        fallback: { 'path': require.resolve('path-browserify') },
    },
};
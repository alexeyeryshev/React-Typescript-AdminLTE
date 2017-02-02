// Webpack conf inspired by http://survivejs.com/
const path = require("path");
const webpack = require("webpack");
const merge = require("webpack-merge");

/* Some contants */
const plugins = {
  CopyWebpackPlugin: require("copy-webpack-plugin"),
  Dashboard: require("webpack-dashboard"),
  DashboardPlugin: require("webpack-dashboard/plugin"),
  ExtractTextPlugin: require("extract-text-webpack-plugin"),
};

const paths = {
  contentBase: "dist",
  outputPath: path.join(__dirname, "dist"),
  app: path.join(__dirname, "src"),
};

const appName = "react-typescript-adminlte";

/* Some helper functions */

/**
 * Extract options.entries in chuck options.name.
 * @param options
 * @returns {{entry: {}, plugins: [*]}}
 */
function extractBundle(options) {
  const entry = {};
  entry[options.name] = options.entries;

  return {
    // Define an entry point needed for splitting.
    entry: entry,
    plugins: [
      // Extract bundle and manifest files. Manifest is
      // needed for reliable caching.
      new webpack.optimize.CommonsChunkPlugin({
        names: [options.name, "manifest"]
      })
    ]
  };
}


/**
 * We lookup for vendor dependencies directly in package.json but we exclude some excludedDeps deps.
 * @returns {Array.<*>} dependencies array.
 */
function getVendorEntries(excludedDeps) {
  return Object.keys(require('./package.json').dependencies)
    .filter((dep) => (!excludedDeps.find(d => d === dep)));
}

/**
 * Minify stuff.
 */
function minify() {
  return {
    plugins: [
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        }
      })
    ]
  };
}

/**
 * Set some thing via DefinePlugin.
 * @param key
 * @param value
 */
function setFreeVariable(key, value) {
  const env = {};
  env[key] = JSON.stringify(value);

  return {
    plugins: [
      new webpack.DefinePlugin(env)
    ]
  };
}

function enableWebpackDashboard() {
  return {
    plugins: [
      new plugins.DashboardPlugin(new plugins.Dashboard().setData)
    ]
  };
}

/* Conf decalartions */

// Common conf for all build configurations.
const common = merge(
  {
    entry: {
      hapui: path.join(paths.app, "views", `${appName}.tsx`),
    },

    output: {
      path: paths.outputPath,
      filename: "[name].bundle.js",
      publicPath: '/',
    },

    resolve: {
      extensions: ["", ".js", ".ts", ".tsx", ".css"],
    },

    module: {
      loaders: [
        {
          test: /\.tsx?$/,
          exclude: /(node_modules)/,
          loaders: [
            "react-hot",
            "ts-loader",
          ],
        },
        { test: /\.css$/, loader: plugins.ExtractTextPlugin.extract("style", "css") },
        { test: /\.eot(\?v=\d+\.\d+\.\d+(.*)?)?$/, loader: "file" },
        { test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+(.*)?)?$/, loader:"url?prefix=font/&limit=5000" },
        { test: /\.ttf(\?v=\d+\.\d+\.\d+(.*)?)?$/, loader: "url?limit=10000&mimetype=application/octet-stream" },
        { test: /\.(svg|png|jpg|gif)(\?v=\d+\.\d+\.\d+(.*)?)?$/, loader: "url?limit=10000&mimetype=image/svg+xml" },
      ],
    },

    plugins: [
      
      // For example purposes
      // new plugins.CopyWebpackPlugin([
      //   {
      //     from: path.join(paths.app, "assets/index.html"),
      //     to: "index.html",
      //   },
      //   {
      //     from: path.join(paths.app, "assets"),
      //     to: "assets",
      //   }
      // ]),

      new plugins.ExtractTextPlugin(`${appName}.bundle.css`),

      new webpack.HotModuleReplacementPlugin(),
    ],

  },

  extractBundle({
    name: "vendor",
    // "font-awesome", "ionicons" are excluded as they doesnt contain any js file
    // "jquery", "bootstrap", "admin-lte" are excluded as they doesnt work in vendor bundle
    entries: getVendorEntries(["admin-lte", "bootstrap"])
  }),

);

// Webpack dev server conf for development configuration
const wds = {
  devServer: {
    host: "0.0.0.0",
    port: 9000,
    // here we copie html
    outputPath: paths.outputPath,
    // where we are looking for our static files
    contentBase: `${paths.contentBase}/`,

    inline: true,
    hot: true,
    // WebpackDashboard needs it to do its things.
    quiet: true,
    historyApiFallback: {
      rewrites: [
        {
          from: /.*\..*/, to: "/index.html",
        },
      ],
    },
  }
};

// We use process.env.NODE_ENV development/production meaning for modify our webpack conf.
// We also provide debug mode that is equal to development mode with the source maps generations.
const development = "development";
const debug = "debug";
const production = "production";

function buildConf(env) {
  env = env || development;
  // development
  if (env == development) {
    return merge(
      common,
      wds,
      enableWebpackDashboard(),
      setFreeVariable(
        "process.env.NODE_ENV",
        development
      )
    );
  }
  // debug
  else if (env == debug) {
    return merge(
      common,
      wds,
      {
        devtool: "eval-source-map",
      },
      enableWebpackDashboard(),
      setFreeVariable(
        "process.env.NODE_ENV",
        debug
      )
    );
  }
  // production
  return merge(
    common,
    {
      devtool: "source-map",
    },
    wds,
    setFreeVariable(
      "process.env.NODE_ENV",
      production
    ),
    minify()
  );
}

module.exports = buildConf(process.env.NODE_ENV);

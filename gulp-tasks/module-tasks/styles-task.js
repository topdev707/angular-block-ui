var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var minifyCss = require('gulp-minify-css');
var path = require('path');

var config = require('../../build-config.js');

var prefixer = require('../lib/gulp-autoprefixer-map.js');
var rename = require('../lib/gulp-rename-filename.js');
var filter = require('../lib/gulp-mini-filter.js');
var wrapper = require('../lib/gulp-wrap-src');

module.exports = function (gulp, module) {

  module.task('styles', 'clean', function () {

    var cssGlob = [
      path.join(module.folders.src, module.name + '.css'),
      path.join(module.folders.src, '**/*.css'),
      '!**/*.ignore.css'
    ];

    // Gulp plugins with support for sourcemaps with css are minimal and buggy.
    // I couldn't get any minifier to output a valid sourcemap in all situations.
    // The task here generates two stylesheets.
    //
    //  1. unminified + concat + autoprefixed + sourcemaps
    //  2. minified
    //
    // The minified version is based on the output generated by the 1st but does
    // not have a sourcemap associated with it.

    return gulp.src(cssGlob)

      .pipe(wrapper({
        header: {
          path: module.name + '-header.css',
          contents: config.header
        }
      }))

      // Generate the unminified stylesheet

      .pipe(module.touch())
      .pipe(sourcemaps.init())
      .pipe(concat(module.name + '.css'))
      .pipe(prefixer())
      .pipe(sourcemaps.write('.', { sourceRoot: '../src/' + module.name }))
      .pipe(gulp.dest(module.folders.dest))

      // Generate the minified stylesheet

      .pipe(filter(function (file) {

        // delete the previous generated sourcemap so we don't trigger
        // sourcemap merging in csswring.

        delete file.sourceMap;

        // Filter out the previous map file.

        return path.extname(file.path) != '.map';

      }))
      .pipe(minifyCss({ keepSpecialComments: 1 }))
      .pipe(rename(module.name + '.min.css'))
      .pipe(gulp.dest(module.folders.dest));

  });

};

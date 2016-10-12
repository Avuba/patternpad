var gulp = require('gulp'),
  connect = require('gulp-connect'),
  watch = require('gulp-watch'),
  concat = require('gulp-concat'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename');


// CONFIG


var CONFIG = {
  dirs: {
    src: './src',
    tmp: './.tmp',
    demo: './demo',
    dist: './dist',
    docs: './docs',
    bower: './bower_components'
  }
};


// PUBLIC TASKS


gulp.task('demo', ['_server', '_build-demo', '_watch']);


gulp.task('build', ['_build']);


// SERVER RELATED


gulp.task('_server', function() {
  connect.server({
    livereload: {
      port: 35529
    },
    port: 9100,
    root: [CONFIG.dirs.demo, CONFIG.dirs.tmp, CONFIG.dirs.bower]
  });
});


gulp.task('_watch', function() {
  gulp.watch(CONFIG.dirs.src + '/**/*.js', ['_build-demo', '_reload']);
  gulp.watch(CONFIG.dirs.demo + '/*.html', ['_reload']);
});


gulp.task('_reload', function() {
  return gulp.src([CONFIG.dirs.demo + '/*.html'])
    .pipe(connect.reload());
});


// PATTERNPAD TASKS


// TODO: think about how to integrate fragmental into the build process
var patternPadParts = [
  // start
  'src/misc/_start.js',
  // patternpad core
  'src/core/patternpad.js',
  'src/core/utils.js',
  // patternpad fragments
  'src/fragments/line.js',
  'src/fragments/dots.js',
  // end
  'src/misc/_end.js',
];


gulp.task('_build', function() {
  return gulp.src(patternPadParts)
    .pipe(concat('patternpad.js'))
    .pipe(uglify({
      mangle: true,
    }))
    .pipe(rename('patternpad.min.js'))
    .pipe(gulp.dest(CONFIG.dirs.dist));
});


gulp.task('_build-demo', function() {
  return gulp.src(patternPadParts)
    .pipe(concat('patternpad.js'))
    .pipe(gulp.dest(CONFIG.dirs.tmp));
});
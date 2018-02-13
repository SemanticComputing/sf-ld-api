var gulp = require('gulp');
var uglify = require('gulp-uglify');
var cssmin = require('gulp-minify-css');
var concat = require('gulp-concat');
var ngmin = require('gulp-ngmin');

var src = {
  css: ['src/**/*.css'],
  js: ['src/**/*.js']
};

var dist = {
  css: 'dist/css',
  js:'dist/js',
};

// Build app.js and app.css
gulp.task('build-css', function() {
  return gulp.src([
      'bower_components/bootstrap/dist/css/bootstrap.min.css',
    ].concat(src.css))
    .pipe(concat('app.css'))
    .pipe(cssmin())
    .pipe(gulp.dest(dist.css))
});
gulp.task('build-js', function() {
  return gulp.src([
      'bower_components/jquery/dist/jquery.min.js',
      'bower_components/angular/angular.min.js',
      'bower_components/angular-route/angular-route.min.js',
      'bower_components/bootstrap/dist/js/bootstrap.min.js',
      'bower_components/angular-bootstrap/ui-bootstrap.min.js',
      'bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
      'bower_components/angular-ui-router/release/angular-ui-router.min.js',
      'bower_components/lodash/dist/lodash.min.js',
    ].concat(src.js))
    .pipe(concat('app.js'))
    .pipe(gulp.dest(dist.js))
});
/*
gulp.task('minify-js', function() {
  return gulp.src(src.js)
    .pipe(concat('app.js'))
    .pipe(ngmin({dynamic: true}))
    .pipe(gulp.dest(dist.js))
});
*/

// Build project
gulp.task('build', ['build-js', 'build-css']);


// Start server
gulp.task('serve', function() {
  var connect = require('connect');
  var serveStatic = require('serve-static');
  connect().use(serveStatic(__dirname)).listen(8080);
});

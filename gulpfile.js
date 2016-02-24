var gulp = require('gulp'),
  uglify = require('gulp-uglify'),
  sass = require('gulp-sass'),
  plumber = require('gulp-plumber'),
  concat = require('gulp-concat'),
  cssNano = require('gulp-cssnano'),
  sourcemaps = require('gulp-sourcemaps'),
  autoprefixer = require('gulp-autoprefixer'),
  imagemin = require('gulp-imagemin'),
  browserSync = require('browser-sync'),
  merge = require('merge-stream'),
  runSequence = require('run-sequence'),
  del = require('del'),
  reload = browserSync.reload;

// Paths configuration
var paths = {
  public: './public/',
  npm: './node_modules/',
  scripts: './assets/scripts/',
  sass: './assets/sass/',
  images: './assets/img/',
};

// Assets configuration
var assets = {
  compiledJs: [
    paths.scripts + 'main.js',
  ],
};

// Copy assets
gulp.task('copy', function() {
  var normalizeCss = gulp.src(paths.npm + 'normalize.css/normalize.css')
    .pipe(gulp.dest(paths.public + 'css/'));

  var jquery = gulp.src(paths.npm + 'jquery/dist/jquery.min.js')
    .pipe(gulp.dest(paths.public + 'scripts/'));

  return merge(
    normalizeCss,
    jquery
  );
});

// Clean build
gulp.task('clean', function() {
  return del([paths.public + 'css', paths.public + 'scripts']);
});

// Clean images
gulp.task('clean-images', function() {
  return del([paths.public + 'img']);
});

// Compile sass
gulp.task('build-css', function() {
  return gulp.src('./assets/sass/main.scss')
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(concat('bundle.css'))
    .pipe(plumber())
    .pipe(sourcemaps.write())
    .pipe(autoprefixer({
      browsers: [
      'last 2 version',
      'IE 8',
      ],
    }))
    .pipe(cssNano())
    .pipe(gulp.dest(paths.public + 'css/build/'))
    .pipe(reload({stream:true}));
});

// Uglifies js
gulp.task('build-js', function() {
  return gulp.src(assets.compiledJs)
    .pipe(sourcemaps.init())
    .pipe(concat('bundle.js'))
    .pipe(sourcemaps.write())
    .pipe(uglify())
    .pipe(plumber())
    .pipe(gulp.dest(paths.public + 'scripts/build/'))
    pipe(reload({stream:true}));
});

// Load server
gulp.task('browser-sync', function() {
  browserSync({
    domain: 'http://localhost:3000',
    injectChanges: true,
    open: false,
    port: 3000,
    server: paths.public,
  });
});

// Reload server
gulp.task('bs-reload', function() {
  browserSync.reload();
});

// Copy and minify all static images
gulp.task('images', ['clean-images'], function() {
  return gulp.src(paths.images + '*')
    .pipe(imagemin({
      optimizationLevel: 7,
      progressive: true,
    }))
    .pipe(gulp.dest(paths.public + 'img'));
});

// Watch files
gulp.task('watch', function() {
    gulp.watch(paths.scripts + '*.js', ['build-js']);
    gulp.watch(paths.sass + '*.scss', ['build-css']);
    gulp.watch(paths.public + '*.html', ['bs-reload']);
});

// Build and compile all assets with sequence
gulp.task('build', function(callback) {
  runSequence(
    'clean',
    'copy',
    'images',
    'build-js',
    'build-css',
    callback
  );
});

// Default task initialization
gulp.task('default', ['build', 'browser-sync', 'watch']);

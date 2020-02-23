const gulp = require('gulp');
const tap = require('gulp-tap');
const posthtml = require('gulp-posthtml');
const rename = require('gulp-rename');
const minifier = require('posthtml-minifier');
const pug = require('posthtml-pug');
const browserSync = require('browser-sync').create();

const DIST_DIR = 'dist';

gulp.task('build:html', () => {
  let path;

  return gulp.src('src/index.pug')
    .pipe(tap(file => (path = file.path)))
    .pipe(posthtml([minifier()], { parser: pug({ locals: {} }) }))
    .pipe(rename('index.html'))
    .pipe(gulp.dest(DIST_DIR))
});

gulp.task('build:css', () => (
  gulp.src('src/**/*.css')
    .pipe(gulp.dest(DIST_DIR))
    .pipe(browserSync.stream())
));

gulp.task('build:assets', () => (
  gulp.src('src/**/*.jpg')
    .pipe(gulp.dest(DIST_DIR))
));

gulp.task('watch', () => {
  browserSync.init({
    server: './dist'
  });

  gulp.watch('src/index.pug', gulp.series('build:html'));
  gulp.watch('src/**/*.css', gulp.series('build:css'));
  gulp.watch('dist/index.html').on('change', () => browserSync.reload());
});

gulp.task('default', gulp.parallel(
  'build:html',
  'build:css',
  'build:assets'
));

gulp.task('watch', gulp.series('default', 'watch'));

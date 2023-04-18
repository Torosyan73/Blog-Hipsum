const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const watch = require('gulp-watch');
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const gcmq = require('gulp-group-css-media-queries');
const sassGlob = require('gulp-sass-glob');
const pug = require('gulp-pug');
const del = require('del');
const fs = require('fs');

gulp.task('pug', function() {
    return gulp.src('./src/pug/pages/*.pug')
        .pipe( plumber({
            errorHandler:notify.onError(function(err) {
                return {
                    title: 'pug',
                    sound: false,
                    message: err.message
                }
            })
        }) )
        .pipe( pug({
            pretty: true,
            locals: {
                jsonData: JSON.parse(
                    fs.readFileSync("./src/data/html-data.json", "utf8")
                ),
                footerNav: JSON.parse(
                    fs.readFileSync("./src/data/footerNav.json", "utf8")
                ),
                socialIcons: JSON.parse(
                    fs.readFileSync("./src/data/socialIcons.json", "utf8")
                )
            }
        }) )
        .pipe( gulp.dest('./build/') )
        .pipe( browserSync.stream() )
});

gulp.task('scss', function() {
    return gulp.src('./src/scss/**/*.scss')
        .pipe( sourcemaps.init() )
        .pipe( sassGlob() )
        .pipe( sass({
            indenType: 'tab',
            indentWidth: 1,
            outputStyle: 'expanded'
        }) )
        .pipe( gcmq() )
        .pipe( autoprefixer({
            overrideBrowserslist: ['last 4 versions']
        }) )
        .pipe( plumber({
            errorHandler:notify.onError(function(err) {
                return {
                    title: 'styles',
                    sound: false,
                    message: err.message
                }
            })
        }) )
        .pipe( sourcemaps.write() )
        .pipe( gulp.dest('./build/css/') )
        .pipe( browserSync.stream() )
});

gulp.task('copy:img', function() {
    return gulp.src('./src/img/**/*.*')
        .pipe( gulp.dest('./build/img/') )
        .pipe( browserSync.stream() )
});

gulp.task('watch', function() {
    watch(['./src/pug/**/*.pug', './src/data/**/*.json'], gulp.parallel('pug'));
    watch('./src/scss/**/*.scss', gulp.parallel('scss'));
    watch('./src/img/**/*.*', gulp.parallel('copy:img'));
});

gulp.task('clean:build', function() {
    return del('./build/')
});

gulp.task('server', function() {
    browserSync.init({
        server: {
            baseDir: './build/'
        }
    })
});

gulp.task(
    'default', 
    gulp.series(
        gulp.parallel('clean:build'),
        gulp.parallel('pug', 'scss', 'copy:img'),
        gulp.parallel('server', 'watch')
    )
)




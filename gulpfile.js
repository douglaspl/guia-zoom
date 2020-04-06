const   gulp = require('gulp'),
        htmlmin = require('gulp-html-minifier'); //
        uglify = require('gulp-uglify'), //
        sass = require('gulp-sass'),
        sassLint = require('gulp-sass-lint'),
        sourcemaps = require('gulp-sourcemaps'),
        autoprefixer = require('gulp-autoprefixer'),
        concat = require('gulp-concat'),
        cleanCSS = require('gulp-clean-css'), // minify
        purgecss = require('gulp-purgecss'), // remove unused
        imagemin = require('gulp-imagemin'), // redução no tamanho das imagens
        imageminMozjpeg = require('imagemin-mozjpeg'), //
        browserSync = require('browser-sync').create(),
        reload = browserSync.reload;

// transport html
function html() {
    return gulp.src('./src/*.html')
    .pipe(gulp.dest('./dist'))
}

// transport htmlProd
function htmlProd() {
    return gulp.src('./src/*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('./dist'))
}

// // transport images
function images() {
    return gulp.src('./src/images/**/*.+(png|jpg|gif|svg|ico|xml|txt|json)')
    .pipe(imagemin([
        // imagemin.jpegtran({progressive: true}),
            imageminMozjpeg({ quality: 80 }),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({
                plugins: [
                    {removeViewBox: true},
                    {cleanupIDs: false}
            ]})
    ]))
    .pipe(gulp.dest('./dist/images/'))
}

// transport js
function js() {
    return gulp.src('./src/js/**/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('./dist/js/'))
}

// transport fonts
function fonts() {
    return gulp.src('./src/fonts/**/*.*')
    .pipe(gulp.dest('./dist/styles/fonts/'))
}

// compile scss into css
function style() {
    // 1. where is myscss files
    return gulp.src([
        // setup
        './src/styles/setup/_functions.scss',
        './src/styles/setup/_variables.scss',
        './src/styles/setup/_fixed.scss',
        './src/styles/setup/_include-media.scss',
        './src/styles/setup/_flexboxgrid.scss',
        './src/styles/setup/_mixins.scss',

        // Libraries
        './src/styles/libraries/**/*.scss',

        // Type
        './src/styles/type/**/*.scss',

        // Blocks
        './src/styles/block/**/*.scss',

        // Layout
        './src/styles/layout/**/*.scss',

        // Trumps
        './src/styles/utils/_colors.scss',
        './src/styles/utils/_trumps.scss'
    ])
    // 2. sass linting
        .pipe(sassLint({
            rules: {
                'no-extends': 1,
                'no-color-keywords': 2,
                'class-name-format': [
                    1,
                    {
                        convention: 'hyphenatedbem'
                    }
                ],
                indentation: [
                    1,
                    {
                        character: 'space',
                        size: 4,
                    }
                ]
            }
        }))
    // 3. concat all scss
        .pipe(concat('styles.scss'))

    // 4. format sass according do sassLint definition
        .pipe(sassLint.format())

    // 5. create sourcemaps for easier debug
        .pipe(sourcemaps.init())

    // 6. pass that file through sass compiler
        .pipe(sass().on('error', sass.logError))

    // 7. apply autoprefixer
        .pipe(autoprefixer('last 2 versions'))

    // 8. where do I save the compiled css
        .pipe(gulp.dest('./dist/styles/'))

    // 9. stream changes to all browsers
        .pipe(browserSync.stream());
}

// compile scss into css prod
function styleProd() {
    // 1. where is myscss files
    return gulp.src([
        // setup
        './src/styles/setup/_functions.scss',
        './src/styles/setup/_variables.scss',
        './src/styles/setup/_fixed.scss',
        './src/styles/setup/_include-media.scss',
        './src/styles/setup/_flexboxgrid.scss',
        './src/styles/setup/_mixins.scss',

        // Libraries
        './src/styles/libraries/**/*.scss',

        // Type
        './src/styles/type/**/*.scss',

        // Blocks
        './src/styles/block/**/*.scss',

        // Layout
        './src/styles/layout/**/*.scss',

        // Trumps
        './src/styles/utils/_colors.scss',
        './src/styles/utils/_trumps.scss'
    ])
    // 2. sass linting
        .pipe(sassLint({
            rules: {
                'no-extends': 1,
                'no-color-keywords': 2,
                'class-name-format': [
                    1,
                    {
                        convention: 'hyphenatedbem'
                    }
                ],
                indentation: [
                    1,
                    {
                        character: 'space',
                        size: 4,
                    }
                ]
            }
        }))
    // 3. concat all scss
        .pipe(concat('styles.scss'))

    // 4. pass that file through sass compiler
        .pipe(sass().on('error', sass.logError))

    // 5. apply autoprefixer
        .pipe(autoprefixer('last 2 versions'))

    // 6. remove unused css
    .pipe(purgecss({
        content: ['./dist/**/*.html', './dist/js/**/*.js']
    }))

    // 7. minify css
    .pipe(cleanCSS({
        debug: true}, (details) => {
            console.log(`${details.name}: ${details.stats.originalSize}`);
            console.log(`${details.name}: ${details.stats.minifiedSize}`);
    }))

    // 8. where do I save the compiled css
        .pipe(gulp.dest('./dist/styles/'))
}

// watch to recompile and retransport files
function watch() {
    browserSync.init({
        server: {
            baseDir: './dist/'
        }
    });

    gulp.watch('./src/**/*.html', html);
    gulp.watch('./src/**/*.html').on('change', reload);
    gulp.watch('./src/images/**/*.+(png|jpg|gif|svg|ico|xml|txt|json)', images);
    gulp.watch('./src/images/**/*.+(png|jpg|gif|svg|ico|xml|txt|json)').on('change', reload);
    gulp.watch('./src/**/*.js', js);
    gulp.watch('./src/**/*.js').on('change', reload);
    gulp.watch('./src/fonts/**/*.*', fonts);
    gulp.watch('./src/fonts/**/*.*').on('change', reload);
    gulp.watch('./src/styles/**/*.scss', style);
    gulp.watch('./src/js/**/*.js').on('change', reload);
}

const build = gulp.series(html, images, js, style, fonts, watch);
const buildProd = gulp.series(htmlProd, images, js, styleProd, fonts, watch);

exports.html = html;
exports.htmlProd = htmlProd;
exports.images = images;
exports.js = js;
exports.style = style;
exports.styleProd = styleProd;
exports.fonts = fonts;
exports.watch = watch;
exports.build = build;
exports.buildProd = buildProd;
exports.default = build;

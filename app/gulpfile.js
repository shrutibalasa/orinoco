const gulp = require('gulp');
const jshint = require('gulp-jshint');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
var changed = require('gulp-changed');
var imagemin = require('gulp-imagemin');
var sass = require('gulp-sass');

gulp.task('processHTML', () => {
	return gulp.src('*.html')
    	.pipe(gulp.dest('dist'));
});

gulp.task('processJS', () => {
	return gulp.src('js/*.js')
    	.pipe(jshint({
	    	esversion: 8
	    }))
	    .pipe(jshint.reporter('default'))
	    .pipe(babel({
	    	presets: ['@babel/preset-env']
	    }))
	    .pipe(uglify())
	    .pipe(gulp.dest('dist/js'));
});

gulp.task('babelPolyfill', () => {
	return gulp.src('node_modules/babel-polyfill/browser.js')
    	.pipe(gulp.dest('dist/node_modules/babel-polyfill'));
});

gulp.task('sass', function(){
  	return gulp.src('css/*.css')
    	.pipe(sass()) // Using gulp-sass
    	.pipe(gulp.dest('dist/css'));
});

gulp.task('processImages', function() {
	var imgSrc = 'images/*.+(png|jpg|gif)',
	imgDst = 'dist/images';
   
	return gulp.src(imgSrc)
		.pipe(changed(imgDst))
		.pipe(imagemin())
		.pipe(gulp.dest(imgDst));
});

gulp.task('default', gulp.series('processHTML', 'processJS', 'sass', 'processImages', function (done) {
    done();
}));
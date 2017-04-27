module.exports = function(grunt) {

	require('jit-grunt')(grunt);

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		less: {
			demo: {
				options: {
					compress: true,
					yuicompress: true,
					optimization: 2
				},
				files: {
					"style.css": "style.less"
				}
			}
		},

		requirejs: {

			development: {
				options: {
					baseUrl: "./src",
					name: 'date-picker',
					out: './date-picker.js',
					optimize: 'none',
					generateSourceMaps: true,
					preserveLicenseComments: false
				}
			},

			production: {
				options: {
					baseUrl: "./src",
					name: 'date-picker',
					out: './date-picker.min.js',
					optimize: 'uglify2',
					uglify2: {
						mangle: false
					},
					generateSourceMaps: true,
					preserveLicenseComments: false
				}
			}
		},

		watch: {
			less: {
				files: ['src/**/*.less', 'style.less'],
				tasks: ['less'],
				options: {
					nospawn: true
				}
			},
			js: {
				files: ['src/**/*.js'],
				tasks: ['requirejs'],
				options: {
					nospawn: true
				}
			}
		}
	});

	grunt.registerTask('default', ['less', 'requirejs']);
	grunt.registerTask('dev', ['watch:js']);
	grunt.registerTask('demo', ['watch']);
};
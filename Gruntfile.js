module.exports = function(grunt) {
	grunt.initConfig({

		// 代码检查任务
		jshint: {
			options: {
				eqeqeq: false,
				eqnull: true,
				ignores: ['src/connect/*.js'],
				globals: {
					$: true,
					jQuery: true
				}
			},
			all: [
				'Gruntfile.js', 
				'src/*/*.js' 
			]
		},

		/** 
		 代码压缩
		 最好使用不同的target来压缩不同的模块，这样单独压缩某个模块的文件
		*/
		uglify: {
			connect: {
				files: {
					'dist/connect.min.js': ['dist/tmp/connect.js']
				}
			},

			tdxgrid: {
				files: {
					'dist/tdxgrid.min.js': ['dist/tmp/tdxgrid.js']
				}
			}
		},

		/**
		 * 代码文件合并
		 */ 
		concat: {
			connect: {
				// src: ['src/connect/*.js'],
				src: ['src/connect/ix_js.js', 'src/connect/sys_pc.js', 'src/connect/wrapper2.js'],
				// src: ['src/connect/ix_js.js', 'src/connect/sys_pc.js', 'src/connect/wrapper.js'],
				dest: 'dist/tmp/connect.js'
			},

			tdxgrid: {
				src: ['src/tdxgrid/*.js'],
				dest: 'dist/tmp/tdxgrid.js'
			}
		}

	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');

	// 通讯模块压缩
	grunt.registerTask('connect', ['concat:connect', 'uglify:connect']);

	// 表格模块
	grunt.registerTask('tdxgrid', ['concat:tdxgrid', 'uglify:tdxgrid']);

	// grunt.registerTask("default", ['concat:connect'])
};
// Generated on 2013-09-03 using generator-angular 0.4.0
'use strict';

// # Globbing

module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);

  // configurable paths
  var yeomanConfig = {
    app: '../',
    dist: 'dist'
  };

  grunt.initConfig({
    yeoman: yeomanConfig,
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '<%= yeoman.dist %>/*',
            '!<%= yeoman.dist %>/.git*'
          ]
        }]
      }
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        'Gruntfile.js',
        '<%= yeoman.app %>/js/{,*/}*.js'
      ]
    },
    // Put files not handled in other tasks here
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= yeoman.app %>',
          dest: '<%= yeoman.dist %>',
          src: [
            '*.{html,js,json,txt,md}',
            '_locales/**/*',
            'css/*',
            'img/*',
            'js/*',
            'js/**/*'
          ]
        }]
      }
    },
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        singleRun: true
      }
    },
    uglify: {
      dist: {
        files: {
          '<%= yeoman.dist %>/js/inject.js': [
            '<%= yeoman.dist %>/js/vendor/jquery-1.7.1.min.js',
            '<%= yeoman.dist %>/js/vendor/jquery-special-scroll.js',
            '<%= yeoman.dist %>/js/vendor/kinetic-v4.6.0.js',
            '<%= yeoman.dist %>/js/edropper2.js',
          ]
        }
      }
    }
  });

  grunt.registerTask('test', [
    'karma'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'copy:dist',
    'uglify'
  ]);

  grunt.registerTask('default', [
    'test',
    'build'
  ]);
};
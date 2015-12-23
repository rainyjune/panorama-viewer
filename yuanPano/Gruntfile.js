module.exports = function(grunt) {
  
  require('load-grunt-tasks')(grunt); // npm install --save-dev load-grunt-tasks

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    babel: {
      options: {
        sourceMap: true,
        presets: ['es2015']
      },
      dist: {
        files: {
          'js/build/app.js': 'js/src/app.js',
          'js/build/yuanpano.js': 'js/src/yuanpano.js'
        }
      }
    },
    watch: {
      scripts: {
        files: 'js/src/*.js',
        tasks: ['babel'],
        options: {
          interrupt: true,
        },
      },
    },
  });
  
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task(s).
  grunt.registerTask('default', ['watch']);

};
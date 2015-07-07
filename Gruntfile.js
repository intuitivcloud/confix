'use strict';

module.exports = function (grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      options: {
        jshintrc: './.jshintrc'
      },
      gruntfile: './Gruntfile.js',
      app: ['./index.js', 'test/**/*.test.js']
    },
    simplemocha: {
      options: {
        ui: 'bdd',
        reporter: 'spec'
      },
      all: {
        src: 'test/**/*.test.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-simple-mocha');

  grunt.registerTask('default', ['jshint', 'simplemocha']);
};

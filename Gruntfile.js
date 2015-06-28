module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-typescript');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.initConfig({
    typescript: {
      base : {
        src: ['src/server/**/*.ts'],
        options :{
          module: 'commonjs',
          target: 'es5'
        }
      }
    },

    clean : {
      all: {
        src : ['src/**/*.js']
      }
    }
  })
}

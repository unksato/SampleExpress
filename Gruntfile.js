module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-typescript');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-run');

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
    },

    run : {
      server : {
        args:['./src/server/App.js']
      }
    }
  });
  
  grunt.registerTask('start',['clean:all','typescript','run:server']);
}

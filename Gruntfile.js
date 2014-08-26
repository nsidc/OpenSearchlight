/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('OpenSearchlight.pkg.json'),
    meta: {
      banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>' + "\n" +
        '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.copyright %>;' +
        ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") + "\\n" %>*/' + "\n"
    },
    clean: {
      folder: "dist/"
    },
    concat: {
      options: {
        stripBanners: true,
        banner: '<%= meta.banner %>'
      },
      dist: {
        src: [
          'src/<%= pkg.name %>.js',
          'src/OpenSearchQuery.js',
          'src/OpenSearchService.js',
          'src/OpenSearchDescriptionDocument.js'
        ],
        dest: 'dist/<%= pkg.name %>-<%= pkg.version %>.js'
      }
    },
    uglify: {
      options: {
        banner: '<%= meta.banner %>'
      },
      dist: {
        // Banner
        src: ['<%= concat.dist.dest %>'],
        dest: 'dist/<%= pkg.name %>-<%= pkg.version %>.min.js'
      }
    },
    exec: {
      docco: {
        command: 'node_modules/docco/bin/docco -o dist/docs <%= concat.dist.dest %>'
      }
    },
    qunit: {
      all: ['test/**/*.html']
    },
    watch: {
      files: '<%= jshint.all %>',
      tasks: ['jshint', 'concat', 'qunit']
    },
    jshint: {
      all: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        browser: true,
        globals: {
          jQuery: true,
          $: true,
          sinon: true,
          _: true,
          test: true,
          ok: true,
          module: true,
          equal: true,
          deepEqual: true,

          // specit
          describe: true,
          it: true,
          assert: true,
          should: true,
          before: true,
          after: true,

          // specit matchers
          include: true,
          eql: true,
          beSimilarTo: true,
          be: true,
          beA: true,
          beAn: true,
          match: true,
          respondTo: true,
          beLessThan: true,
          beLessThanOrEqualTo: true,
          beGreaterThan: true,
          beGreaterThanOrEqualTo: true,
          beOnThePage: true,
          beEmpty: true,
          beToTheLeftOf: true,
          beToTheRightOf: true,
          beAbove: true
        }
      }
    }
  });

  // Load modules
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-exec');

  // Default task.
  grunt.registerTask('default', ['jshint', 'qunit', 'concat', 'uglify']);
  grunt.registerTask('docs', ['default', 'exec']);
};


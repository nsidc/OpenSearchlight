/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: '<json:OpenSearchlight.pkg.json>',
    meta: {
      banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.copyright %>;' +
        ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
    },
    clean: {
      folder: "dist/"
    },
    concat: {
      dist: {
        src: [
          '<banner:meta.banner>',
          '<file_strip_banner:src/<%= pkg.name %>.js>',
          '<file_strip_banner:src/OpenSearchQuery.js>',
          '<file_strip_banner:src/OpenSearchService.js>',
          '<file_strip_banner:src/OpenSearchDescriptionDocument.js>'
        ],
        dest: 'dist/<%= pkg.name %>-<%= pkg.version %>.js'
      }
    },
    min: {
      dist: {
        src: ['<banner:meta.banner>', '<config:concat.dist.dest>'],
        dest: 'dist/<%= pkg.name %>-<%= pkg.version %>.min.js'
      }
    },
    exec: {
      docco: {
        command: 'node_modules/docco/bin/docco -o dist/docs dist/OpenSearchlight-0.1.0.js'
      }
    },
    jasmine: {
      all: ['spec/SpecRunner.html']
    },
    lint: {
      files: ['grunt.js', 'src/**/*.js', 'spec/**/*.js']
    },
    watch: {
      files: '<config:lint.files>',
      tasks: 'lint concat jasmine'
    },
    jshint: {
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
        browser: true
      },
      globals: {
        jQuery: true,
        $: true,
        sinon: true,
        _: true,
        beforeEach: true,
        afterEach: true,
        describe: true,
        it: true,
        xit: true,
        expect: true
      }
    },
    uglify: {}
  });

  // Default task.
  grunt.registerTask('default', 'lint jasmine concat min');
  grunt.loadNpmTasks('grunt-jasmine-task');
  grunt.loadNpmTasks('grunt-clean');
  grunt.loadNpmTasks('grunt-exec');
};

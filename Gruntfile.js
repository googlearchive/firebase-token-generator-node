module.exports = function(grunt) {
  'use strict';

  var src = [
    'lib/closure/library',
    'js/src'
  ];

  grunt.initConfig({

    jshint: {
      src:  [
        'Gruntfile.js',
        'js/src/**/*.js',
        '!js/src/cryptojs.js'
      ],
      options: {
        curly: true,
        eqeqeq: true,
        node: true,
        sub: true
      }
    },

    concurrent: {
      closure : [
        'closureBuilder:js-token-generator',
        'closureBuilder:js-token-generator-node',
        'closureBuilder:js-token-generator-debug',
        'closureDepsWriter'
      ]
    },

    closureBuilder:  {
      options: {
        namespaces         : 'FirebaseTokenGenerator',
        closureLibraryPath : 'lib/closure/library',
        builder            : 'lib/closure/library/closure/bin/build/closurebuilder.py',
        compilerFile       : 'lib/closure/compiler.jar',
        compile            : true,
        compilerOpts       : {}
      },
      'js-token-generator': {
        src        : src,
        dest       : 'dist/firebase-token-generator.js',
        options    : {
          compilerOpts: {
            'generate_exports'  : true,
            'compilation_level' : 'ADVANCED_OPTIMIZATIONS',
            'output_wrapper'    : '(function() {%output%})();',
            'define'            : ["'NODE_CLIENT=false'"]
          }
        }
      },
      'js-token-generator-debug': {
        src        : src,
        dest       : 'dist/firebase-token-generator-debug.js',
        options    : {
          compilerOpts: {
            'generate_exports'  : true,
            'formatting'        : 'PRETTY_PRINT',
            'compilation_level' : 'WHITESPACE_ONLY',
            'define'            : ["'NODE_CLIENT=false'"]
          }
        }
      },
      'js-token-generator-node': {
        src        : src,
        dest       : 'dist/firebase-token-generator-node.js',
        options    : {
          compilerOpts: {
            'generate_exports'  : true,
            'compilation_level' : 'SIMPLE_OPTIMIZATIONS',
            'define'            : ["'NODE_CLIENT=true'"]
          }
        }
      }
    },

    closureDepsWriter: {
      options: {
        closureLibraryPath : 'lib/closure/library',
        depswriter         : 'lib/closure/library/closure/bin/build/depswriter.py',
        root_with_prefix   : '"js ../../../../../js/"'
      },
      deps: {
        dest: 'js/deps.js'
      }
    },

    jasmine: {
      dist: {
        src: [
          'dist/firebase-token-generator.js'
        ],
        options: {
          vendor: [],
          helpers: [],
          specs: [
            'js/test/jasmine/*.spec.js'
          ]
        }
      },
      debug: {
        src: [
          'dist/firebase-token-generator-debug.js'
        ],
        options: {
          vendor: [],
          helpers: [],
          specs: [
            'js/test/jasmine/*.spec.js'
          ]
        }
      }
    },

    exec: {
      mocha: {
        command: 'mocha js/test/mocha'
      }
    }

  });

  require('load-grunt-tasks')(grunt);

  grunt.registerTask('build', ['jshint', 'closureBuilder', 'closureDepsWriter']);
  grunt.registerTask('build-concurrent', ['jshint', 'concurrent:closure']);
  grunt.registerTask('test', ['jasmine', 'exec:mocha']);

  grunt.registerTask('default', ['build-concurrent', 'test']);
};

module.exports = function(grunt) {

    require('load-grunt-tasks')(grunt);

    var _ = require('underscore');
    var jsbeautify = require('js-beautify').js_beautify;
    var config = {};
    var dirs = {
        build : './build/',
        src : './src/'
    };

    /*
    Precompile all underscore templates and save them in the same directory as their html counterpart.

    The filename (without extension) is used as the javascript
    */
    grunt.task.registerTask('precompileUnderscoreTemplates', 'Precompile underscore templates.', function(){

        var templateDir = dirs.src + 'templates/';
        var templates = grunt.file.expand(templateDir + '*.html');

        var templatesFile = 'var templates = {};\n\n';
        var templateModule = 'templates.{template_name} = {fn};\n\n';

        templates.forEach(function (template) {

            var compiled = _.template(grunt.file.read(template)).source;
            templatesFile += templateModule
                                .replace('{fn}', compiled)
                                .replace('{template_name}', template.replace(templateDir,'').replace('.html', ''));
        });

        grunt.file.write(
            dirs.build + 'scripts/templates.js',
            jsbeautify(templatesFile, {
                indent_size: 2
            })
        );

        grunt.log.ok('Compiled ' + templates.length + ' templates.');

    });


    config.uglify = {
        options : {
            sourceMap : true
        },
        scripts : {
            files : (function(){
                var builtScript = dirs.build + 'scripts/scripts.js';
                var files = [
                    dirs.src + 'scripts/libs/fastclick.js',
                    dirs.src + 'scripts/libs/zepto.js',
                    dirs.build + 'scripts/templates.js', // Generated by grunt.
                    dirs.src + 'scripts/main.js'
                ];
                var map = {};

                map[builtScript] = files;

                return map;
            }()),
        }
    };

    config.less = {
        styles : {
            files : (function(){

                var builtStyle = dirs.build + 'styles/style.css';
                var sourceStyles = [
                    dirs.src + 'styles/style.less'
                ];
                var map = {};

                map[builtStyle] = sourceStyles;

                return map;
            }())
        }
    };

    config.imagemin = {
        options : {
            cache : false
        },
        images : {
            expand : true,
            cwd : dirs.src + 'images/',
            src : ['**/*.{png,jpg,gif}'],
            dest : dirs.build + 'images/'
        }
    };

    config.copy = {
        apacheTemplates : {
            files : [{
                expand : true,
                cwd : dirs.src,
                src : ['**.html'],
                dest : dirs.build
            }]
        }
    };

    config.jshint = {
        scripts : [dirs.src + 'scripts/*.js'],
        gruntfile : ['./gruntfile.js']
    };

    config.watch = {
        gruntfile : {
            files : ['./gruntfile.js'],
            tasks : ['jshint:gruntfile', 'build']
        },
        scripts : {
            files : [dirs.src + 'scripts/**/*.js'],
            tasks : ['jshint:scripts', 'uglify:scripts']
        },
        styles : {
            files : [dirs.src + 'styles/**/*.less'],
            tasks : ['less:styles']
        },
        images : {
            files : [dirs.src + 'images/**/*'],
            tasks : ['imagemin:images']
        },
        templates : {
            files : [dirs.src + '**/*.html'],
            tasks : ['copy:apacheTemplates', 'precompileUnderscoreTemplates', 'uglify:scripts']
        }
    };

    grunt.initConfig(config);

    grunt.registerTask('build', [
        'jshint:scripts',
        'precompileUnderscoreTemplates',
        'uglify:scripts',
        'less:styles',
        'imagemin:images',
        'copy:apacheTemplates'
    ]);
};

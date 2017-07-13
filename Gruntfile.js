// Generated on 2016-04-06 using generator-angular 0.15.1
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    // Automatically load required Grunt tasks
    require('jit-grunt')(grunt, {
        useminPrepare: 'grunt-usemin'
    });

    // Configurable paths for the application
    var appConfig = {
        app: require('./bower.json').appPath || 'app',
        appModule: require('./bower.json').moduleName || 'reportingDashboard',
        dist: 'dist'
    };

    // Project configuration.
    grunt.initConfig({

        //Project Settings
        popdashboard: appConfig,

        // Empties folders to start fresh
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: ['<%= popdashboard.dist %>/**/*']
                }]
            }
        },

        // Copies remaining files to places other tasks can use
        copy: {
            dist: {
                files: [{
                    expand: true,
                    cwd: './',
                    dest: '<%= popdashboard.dist %>',
                    src: [
                        'index.html',
                        'app/views/**',
                        'fonts/{,*/}*.*',
                        'images/**/*.{png,jpg,jpeg,gif,ico}',
                        'favicon.ico'
                    ]
                }, {
                    expand: true,
                    cwd: 'bower_components/materialize/fonts/roboto',
                    src: '*',
                    dest: '<%= popdashboard.dist %>/fonts/roboto/',

                }, {
                    expand: true,
                    cwd: 'bower_components/components-font-awesome/fonts',
                    src: '*',
                    dest: '<%= popdashboard.dist %>/fonts/',

                }]
            }
        },

        // Reads HTML for usemin blocks to enable smart builds that automatically
        // concat, minify and revision files. Creates configurations in memory so
        // additional tasks can operate on them
        useminPrepare: {
            html: 'index.html',
            options: {
                dest: '<%= popdashboard.dist %>',
                flow: {
                    html: {
                        steps: {
                            js: ['concat'],
                            css: ['cssmin']
                        },
                        post: {}
                    }
                }
            }
        },

        // To compress images
        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= popdashboard.dist %>/',
                    src: '**/*.{png,jpg,jpeg,gif,ico}',
                    dest: '<%= popdashboard.dist %>/'
                }]
            }
        },

        // Run some tasks in parallel to speed up the build process
        concurrent: {
            copyData: ['copy:dist'],
            imageMinification: ['imagemin:dist'],
            options: {
                logConcurrentOutput: true
            }
        },

        // ng-annotate tries to make the code safe for minification automatically
        // by using the Angular long form for dependency injection.
        ngAnnotate: {
            options: {
                add: true,
                remove: true,
                singleQuotes: true,
                separator: ';'
            },
            dist: {
                files: [{
                    expand: true,
                    src: ['<%= popdashboard.app %>/**/*.js'],
                    extDot: 'last'
                }]
            }
        },

        // Renames files for browser caching purposes
        filerev: {
            dist: {
                src: [
                    '<%= popdashboard.dist %>/scripts/{,*/}*.js',
                    '<%= popdashboard.dist %>/css/{,*/}*.css'
                ]
            }
        },

        // Performs rewrites based on filerev and the useminPrepare configuration
        usemin: {
            html: ['<%= popdashboard.dist %>/{,*/}*.html'],
            css: ['<%= popdashboard.dist %>/css/{,*/}*.css'],
            js: ['<%= popdashboard.dist %>/scripts/{,*/}*.js']
        },

        // Minify html files
        htmlmin: {
            dist: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true,
                    removeEmptyAttributes: false,
                    removeCommentsFromCDATA: true,
                    removeRedundantAttributes: false,
                    collapseBooleanAttributes: false,
                    keepClosingSlash: true,
                    minifyJS: true,
                    minifyCSS: true
                },
                files: [{
                    expand: true,
                    cwd: '<%= popdashboard.dist %>',
                    src: ['*.html', 'app/views/*.html'],
                    dest: '<%= popdashboard.dist %>'
                }]
            }
        }

    });

    // Default task(s).
    grunt.registerTask('build', [
        'clean:dist',
        'useminPrepare',
        'concurrent',
        'concat',
        'cssmin',
        'usemin',
        'htmlmin'
    ]);

};
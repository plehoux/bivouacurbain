var minify = require('jake-uglify').minify

task('default', ['js/scripts.min.js'])

desc('Minify javascript')
minify({'js/scripts.min.js': [
    'js/scripts.js'
]}, {
  header: "/*\n\tauthor\t: @EtienneLem\n\tcompany\t: Heliom <http://heliom.ca>\n*/"
})

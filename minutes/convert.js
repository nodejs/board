// This converts the meeting minutes to markdown from a .docx file
// (most were originally .rtf files that were converted to .docx)
//
// example: node minutes/convert.js ./word/2016-01-30.docx

const mammoth = require('mammoth')
const toMarkdown = require('to-markdown')
const path = require('path')

if (!process.argv[2] || !process.argv[2].endsWith('.docx')) return console.log('expected a .docx')
const filename = path.resolve(__dirname, process.argv[2])
const destination = path.resolve(__dirname, path.basename(filename, '.docx')+'.md')
console.log(destination)

var markdown = mammoth.convertToHtml({ path: path.resolve(__dirname, filename) }, { prettyPrint: true })
.then((r) => r.value)
.then(toMarkdown)
.then((md) => md
  .replace(/\*\*Adjournment\*\*/i, '## Adjournment\n')
  .replace(/<a.+\n\n/g, '')
  .replace(/\*\*Directors Attending.+\n\n/gi, '## Participants\n### Directors\n\n* ')
  .replace(/\*\*Counsel.+\n\n/gi, '### Counsel\n\n* ')
  .replace(/\*\*Also participating.+\n\n/gi, '### Also participating\n\n* ')
  .replace(/\*\*Call to Order.+/gi, '## Meeting\n### Call to Order\n')
  .replace(/\*\*(.+?)\*\*/g, '#### $1')
  .replace(/#### RESOLVED:/g, '_RESOLVED:_\n>')
  .replace(/\), /g, ')\n* ') // converts the list of attendees to a bullet list
  .replace(/\n______/, '\n\\______')
)
.then((md) => {
  return require('fs').writeFileSync(destination, md)
})
.catch(console.log)


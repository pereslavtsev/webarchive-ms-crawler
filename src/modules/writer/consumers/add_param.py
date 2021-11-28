import mwparserfromhell
import sys

wikicode = mwparserfromhell.parse(sys.argv[1])
templates = wikicode.filter_templates()
template = templates[0]

template.add(sys.argv[2], sys.argv[3])

print(template)

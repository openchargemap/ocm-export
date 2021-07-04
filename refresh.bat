rmdir data /Q /S
rmdir tmp /Q /S

mkdir tmp
mkdir data

curl "https://api-01.openchargemap.io/v3/poi?client=ocm-data-export&maxresults=200000&compact=true&verbose=false&includecomments=true" --output ./tmp/poi.json
curl "https://api-01.openchargemap.io/v3/referencedata?client=ocm-data-export" --output ./tmp/referencedata.json

node ./tools/parse-all/index.js
rmdir data /Q /S
rmdir tmp /Q /S

mkdir tmp
mkdir data

node ./tools/fetch-poi-data.js
curl "https://api-01.openchargemap.io/v3/referencedata?client=ocm-data-export" --output ./tmp/referencedata.json

node ./tools/parse-all/index.js

 REM git add --all    
 REM git commit -m "Update data"
 REM git push
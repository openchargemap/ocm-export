Refresh process:

- Fetch poi.json (takes about 3mins, greater than 90MB): 

`curl "https://api-01.openchargemap.io/v3/poi?client=ocm-data-export&maxresults=200000&compact=true&verbose=false" --output ./tmp/poi.json`

- Fetch core reference data (operators, charger type etc):
`curl "https://api-01.openchargemap.io/v3/referencedata?client=ocm-data-export" --output ./tmp/referencedata.json`

- Delete all files under ./data/, this will allow removed/moved POIs to be removed from the subsequent git commit
- Split POIs into individual files organised by country code : `node ./tools/parse-all/index.js`
- Copy ./tmp/referencedata.json to /data/

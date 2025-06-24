Refresh process:

- Fetch poi.json using paginated API requests (replaces single large curl request): 

`node ./tools/fetch-poi-data.js`

This script:
- Uses pagination with `greaterthanid` parameter to fetch data in batches of 1000 POIs
- Automatically continues until no more results are returned
- Saves all POIs to `./tmp/poi.json`
- Includes the same parameters as the original curl command: `compact=true&verbose=false&includecomments=true&excludecomputed=true`

- Fetch core reference data (operators, charger type etc):
`curl "https://api-01.openchargemap.io/v3/referencedata?client=ocm-data-export" --output ./tmp/referencedata.json`

- Delete all files under ./data/, this will allow removed/moved POIs to be removed from the subsequent git commit
- Split POIs into individual files organised by country code : `node ./tools/parse-all/index.js`


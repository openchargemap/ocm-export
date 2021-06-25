# ocm-export
Export of OCM POI data into one file per POI

This is an experimental export of the live data from openchargemap.org. In the `data` folder you will find:
- `referencedata.json` - data used for ID lookups such as country ID, Connection Type ID etc.
- POI data is arranged as subfolders named after the 2-digit ISO Country code for the location of the POI. Country folders make contains many thousands of entries.

To consume the data, import all of the POI json files you need for the countries you want to use into the tool of your choice.

## Refreshing Data
The export is performed by calling the main API with parameters `maxresults=200000&compact=true&verbose=false`. The resulting single POI json file is split into files using: `node ./tools/parse-all/index.js`


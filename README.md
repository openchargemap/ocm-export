# ocm-export
Export of OCM POI data into one file per POI

This is an experimental export of the live data from openchargemap.org. In the `data` folder you will find:
- `referencedata.json` - data used for ID lookups such as country ID, Connection Type ID etc.
- POI data is arranged as subfolders named after the 2-digit ISO Country code for the location of the POI. Country folders may contains many thousands of entries.

To consume the data, import all of the POI json files you need for the countries you want to use into the tool of your choice.

## Purpose
To provide a granular view of change history over time per POI

## Ideas
Create one commit per modified POI, with comment showing name of contributor and editor/approver

## Refreshing Data
The export is performed by calling the main API in pages, with parameters `sortby=id_asc&greaterthanid=N&maxresults=1000&compact=true&verbose=false&includecomments=true`. The resulting single POI json file is split into files using: `node ./tools/parse-all/index.js`

See refresh.bat for refresh process which you could optionally run yourself on your own local install. Data is downloaded to tmp, then parsed and copied into per-country directories as individual json files.

## Data Licensing Notes

POIs with Data Provider ID 1 are created by Open Charge Map contributors and licensed per Open Charge Maps data license. Other POIs have different data providers and the data license will vary (different variations of open data licenses). See Data Providers (License field) in referencedata.json.

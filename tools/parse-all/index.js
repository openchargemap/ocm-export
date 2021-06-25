const { chain } = require('stream-chain');

const { parser } = require('stream-json');
const { pick } = require('stream-json/filters/Pick');
const { ignore } = require('stream-json/filters/Ignore');
const { streamValues } = require('stream-json/streamers/StreamValues');
const { streamArray } = require('stream-json/streamers/StreamArray');

const fs = require('fs');

let basePath = "./tmp";
let referenceData = JSON.parse(fs.readFileSync(basePath + "/referencedata.json"));

const pipeline = chain([
    fs.createReadStream(basePath + '/poi.json'),
    parser(),
    streamArray(),
    data => {
        const value = data.value;
        // optionally filter data
        return value;
    }
]);

let counter = 0;

pipeline.on('data', (poi) => {
    ++counter;
    // write file for this POI

    let countryCode = referenceData.Countries.find(c => c.ID == poi.AddressInfo.CountryID).ISOCode;

    let path = basePath + "/../data/" + countryCode;

    fs.mkdirSync(path, { recursive: true }, (err) => {
        if (err) throw err;
    });

    fs.writeFileSync(path + "/OCM-" + poi.ID + ".json", JSON.stringify(poi, null, 4));

    if (counter % 1000 == 0) {
        console.log(` ${counter} POIs exported.`)
    }
}
);

pipeline.on('end', () =>
    console.log(`Completed export. ${counter} POIs exported.`)
);
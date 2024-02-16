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

    // remove unused elements that will cause a diff on export
    delete poi.IsRecentlyVerified;
    delete poi.DataQualityLevel;

    // for user comments and media items, trim the user details so that reputation points etc don't get included in the change set
    if (poi.UserComments) {
        for (let c of poi.UserComments) {
            if (c.User) {
                c.User = { ID: c.User.ID, Username: c.User.Username };
            }
        }
    }

    if (poi.MediaItems) {
        for (let c of poi.MediaItems) {
            if (c.User) {
                c.User = { ID: c.User.ID, Username: c.User.Username };
            }
        }
    }


    fs.writeFileSync(path + "/OCM-" + poi.ID + ".json", JSON.stringify(poi, null, 4));

    if (counter % 1000 == 0) {
        console.log(` ${counter} POIs exported.`)
    }
}
);

pipeline.on('end', () => {
    console.log(`Completed export. ${counter} POIs exported.`);

    // export reference data with trimmed unused elements
  
    delete referenceData.ChargePoint;
    delete referenceData.UserComment;
    delete referenceData.UserProfile;

    fs.writeFileSync(basePath + "/../data/referencedata.json", JSON.stringify(referenceData, null, 4));
});
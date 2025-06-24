const fs = require('fs');
const https = require('https');
const path = require('path');
const zlib = require('zlib');

/**
 * Fetches POI data from OpenChargeMap API with pagination
 * Uses greaterthanid parameter to paginate through results
 */
class PoiFetcher {
    constructor() {
        this.baseUrl = 'https://api-01.openchargemap.io/v3/poi';
        this.client = 'ocm-data-export';
        this.maxResults = 10000;
        this.outputPath = './tmp/poi.json';
        this.allPois = [];
    }

    /**
     * Makes an HTTP GET request and returns a Promise
     */
    makeRequest(url) {
        return new Promise((resolve, reject) => {
            const options = {
                headers: {
                    'Accept-Encoding': 'gzip, deflate'
                }
            };

            https.get(url, options, (res) => {
                let data = '';
                
                // Handle gzip compression
                let stream = res;
                if (res.headers['content-encoding'] === 'gzip') {
                    stream = res.pipe(zlib.createGunzip());
                }
                
                stream.on('data', (chunk) => {
                    data += chunk;
                });
                
                stream.on('end', () => {
                    try {
                        const jsonData = JSON.parse(data);
                        resolve(jsonData);
                    } catch (error) {
                        reject(new Error(`Failed to parse JSON: ${error.message}`));
                    }
                });
                
                stream.on('error', (error) => {
                    reject(error);
                });
            }).on('error', (error) => {
                reject(error);
            });
        });
    }

    /**
     * Builds the API URL with parameters
     */
    buildUrl(greaterThanId = null) {
        const params = new URLSearchParams({
            client: this.client,
            maxresults: this.maxResults.toString(),
            compact: 'true',
            verbose: 'false',
            includecomments: 'true',
            excludecomputed: 'true',
            sortby:'id_asc'
        });

        if (greaterThanId) {
            params.append('greaterthanid', greaterThanId.toString());
        }

        return `${this.baseUrl}?${params.toString()}`;
    }    /**
     * Fetches a single page with retry logic
     */
    async fetchPageWithRetry(url, pageCount, maxRetries = 5) {
        let lastError;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const pois = await this.makeRequest(url);
                return pois;
            } catch (error) {
                lastError = error;
                console.error(`Attempt ${attempt}/${maxRetries} failed for page ${pageCount}: ${error.message}`);
                
                if (attempt < maxRetries) {
                    const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000); // Exponential backoff, max 10 seconds
                    console.log(`Retrying in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                } else {
                    console.error(`All ${maxRetries} attempts failed for page ${pageCount}`);
                    throw lastError;
                }
            }
        }
    }

    /**
     * Fetches all POI data using pagination
     */
    async fetchAllPois() {
        let greaterThanId = null;
        let pageCount = 0;
        let totalFetched = 0;

        console.log('Starting POI data fetch with pagination...');

        while (true) {
            pageCount++;
            const url = this.buildUrl(greaterThanId);
            
            console.log(`Fetching page ${pageCount}${greaterThanId ? ` (starting from ID: ${greaterThanId})` : ''}...`);
            
            try {
                const pois = await this.fetchPageWithRetry(url, pageCount);
                
                if (!Array.isArray(pois) || pois.length === 0) {
                    console.log('No more results returned. Pagination complete.');
                    break;
                }

                console.log(`Received ${pois.length} POIs on page ${pageCount}`);
                
                // Add POIs to our collection
                this.allPois.push(...pois);
                totalFetched += pois.length;
                
                // Get the highest ID from this batch for the next request
                const maxId = Math.max(...pois.map(poi => poi.ID));
                greaterThanId = maxId;
                
                console.log(`Total POIs fetched so far: ${totalFetched}`);
                
                // Small delay to be respectful to the API
                await new Promise(resolve => setTimeout(resolve, 100));
                
            } catch (error) {
                console.error(`Failed to fetch page ${pageCount} after all retry attempts:`, error.message);
                throw error;
            }
        }

        console.log(`Pagination complete. Total POIs fetched: ${totalFetched}`);
        return this.allPois;
    }

    /**
     * Saves the POI data to the output file
     */
    async savePois() {
        try {
            // Ensure the tmp directory exists
            const tmpDir = path.dirname(this.outputPath);
            if (!fs.existsSync(tmpDir)) {
                fs.mkdirSync(tmpDir, { recursive: true });
            }

            // Write the POI data to file
            fs.writeFileSync(this.outputPath, JSON.stringify(this.allPois, null, 2));
            console.log(`POI data saved to ${this.outputPath}`);
        } catch (error) {
            console.error('Error saving POI data:', error.message);
            throw error;
        }
    }

    /**
     * Main method to fetch and save POI data
     */
    async run() {
        try {
            await this.fetchAllPois();
            await this.savePois();
            console.log('POI data fetch completed successfully!');
        } catch (error) {
            console.error('Failed to fetch POI data:', error.message);
            process.exit(1);
        }
    }
}

// Run the fetcher if this script is executed directly
if (require.main === module) {
    const fetcher = new PoiFetcher();
    fetcher.run();
}

module.exports = PoiFetcher;

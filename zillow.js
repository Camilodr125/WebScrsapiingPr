const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const port = 7000;

app.get('/zillow', async(req, res) => {
    let browser;

    try {
        let pageNumber = 1;
        const data = [];
        browser = await puppeteer.launch();
        const page = await browser.newPage();

        while (pageNumber < 2) {
            const url = `https://www.zillow.com/ky/${pageNumber}_p/`;
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3')

            await page.goto(url, {waitUntil: 'networkidle2'})
            await page.waitForSelector('.property-card-data', { timeout: 70000 });

            const info = await page.evaluate(() => {
                const properties = [];
                document.querySelectorAll('.property-card-data').forEach(item => {
                  const anchorUrl =  item.querySelector('.property-card-link');
                  const url = anchorUrl ? anchorUrl.href : null;
                  const anchorPrice = item.querySelector('.PropertyCardWrapper__StyledPriceLine-srp-8-102-0__sc-16e8gqd-1');
                  const price = anchorPrice ? anchorPrice.textContent.trim() : null;
                  const features = [];
                  const listings = item.querySelectorAll('.StyledPropertyCardHomeDetailsList-c11n-8-102-0__sc-1j0som5-0 li');
                  listings.forEach(list => features.push(list.textContent.trim()));
                  const anchorAddress = item.querySelector('.StyledPropertyCardDataArea-c11n-8-102-0__sc-10i1r6-0');
                  const address = anchorAddress ? anchorAddress.textContent.trim() : null;


                  properties.push({Url: url, Price: price, Features: features, Address: address});
                })
                return properties;
                
            })
             data.push(...info);
             pageNumber++;
        }
        console.log(JSON.stringify(data, null, 2)); // Log JSON in a pretty format

        res.json(data);
        
    } catch (error) {
        console.error('Error during scrapping:', error.message);
        res.status(500).send(`Error during scrapping: ${error.message}`)
        
        
    } finally {
            if (browser) {
                await browser.close();
            }
    }
})

app.listen(port, () =>{
    console.log(`Server running at http://localhost:${port}`);
    
})
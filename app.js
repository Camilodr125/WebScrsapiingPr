const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const port = 3000;

app.get('/deshow', async (req, res) => {
    const pageNumber = parseInt(req.query.page, 10);

    if (pageNumber < 0 || isNaN(pageNumber)) {
        return res.status(400).send("Invalid page number");
    }

    let browser;
    try {
        browser = await puppeteer.launch();
        const page = await browser.newPage();
        const url = `https://deshow.com/advance-search/page/${pageNumber}/`;

        await page.goto(url, { waitUntil: 'networkidle2' });

        const data = await page.evaluate(() => {
            const listings = [];
            document.querySelectorAll('li.col-lg-4').forEach(item => {
                const anchor = item.querySelector('a');
                const linkUrl = anchor ? anchor.href : null;
                const anchorTitle = item.querySelector('.description h3');
                const TitleName = anchorTitle ? anchorTitle.textContent.trim() : null;
                const anchorPrice= item.querySelector('.number');
                const TotalPrice = anchorPrice ? anchorPrice.textContent.trim() : null;
                const properties = [];
                const spans = item.querySelectorAll('.properties span');
                spans.forEach(span => properties.push(span.textContent.trim()))
                const anchorstate= item.querySelector('.tag');
                const state = anchorstate ? anchorstate.textContent.trim() : null;
               
                


                
                listings.push({ url: linkUrl, title:TitleName, price:TotalPrice, features:properties, status:state });
            });
            return listings;
        });

        res.json(data);

    } catch (error) {
        console.error('Error during scraping:', error.message);
        res.status(500).send(`Error during scraping: ${error.message}`);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
});



app.listen(port,() => {
    console.log(`Servidor corriende en http://localhost:${port}`);
    
})
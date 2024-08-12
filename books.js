const express = require('express');
const app = express();
const puppeteer = require('puppeteer');
const port = 8000;

app.get('/book', async (req,res) => {
    const pageNumber = parseInt(req.query.page, 10)

    if(isNaN(pageNumber) || pageNumber<0) {
        return res.status(400).send('ERROR: Invalid Page number');
    }

    let browser;

    try {
        browser = await puppeteer.launch();
        const page = await browser.newPage();
        const url = `https://books.toscrape.com/catalogue/page-${pageNumber}.html`;

        await page.goto(url, { waitUntil: 'networkidle2' });
        
        const data = await page.evaluate(() => {
            const books = [];
            document.querySelectorAll('article.product_pod').forEach(item => {
                const anchorUrl = item.querySelector('h3 a');
                const linkUrl = anchorUrl ? anchorUrl.href : null;
                const titleName = anchorUrl ? anchorUrl.getAttribute('title') : null;
                const anchorPrice= item.querySelector('.price_color');
                const price = anchorPrice ? anchorPrice.textContent.trim() : null;
                const anchorStock = item.querySelector('.availability');
                const stock = anchorStock ? anchorStock.textContent.trim() : null;


                books.push({url : linkUrl, title: titleName, price: price, availability: stock });

            });

            return books;
        });

        res.json(data)

    }catch(error) {
        console.error('Error at scrapping:', error.message);
        res.status(500).send(`Error during scraping: ${error.message}`);
        

    } finally {
        if(browser) {
            await browser.close();
        }
    }



})

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
    
})
const express = require('express');
const puppeteer = require('puppeteer');
const app = express()
const port = 5000;

app.get('/deshow', async(req, res) => {
    let Browser;

    try {
        Browser = await puppeteer.launch();
        const page = await Browser.newPage();
        let pageNumber = 1;
        const products = [];

        while (pageNumber < 5) {
            const url = `https://www.amazon.com/s?k=gaming+laptop&page=${pageNumber}&qid=1727127570&ref=sr_pg_${pageNumber}`;
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3');
            await page.goto(url, {waitUntil: 'networkidle2'})

            const infoProducts = await page.evaluate(()=> {
                const dataProducts = [];
               document.querySelectorAll('.s-card-container').forEach( item => {
                const anchorLink = item.querySelector('.s-link-style');
                const link = anchorLink ? anchorLink.href : null;
                const anchorTitle = item.querySelector('.a-text-normal');
                const title = anchorTitle ? anchorTitle.textContent.trim() : null;
                const anchorPrice= item.querySelector('.a-offscreen');
                const price = anchorPrice? anchorPrice.textContent.trim() : null;
                const anchorRate= item.querySelector('.a-icon-alt');
                const rate= anchorRate? anchorRate.textContent.trim() : null;


                dataProducts.push({Url: link, Title: title, Price: price, Rating: rate})

               })
               return dataProducts;

            })
            products.push(...infoProducts)
            pageNumber ++;

        }
        res.json(products)

    } catch (error) {
        console.error('Error during scrapping: ', error.message);
        res.status(500).send(`Error during scrapping: ${error.message}`)
        
    } finally {
        if (Browser) {
            await Browser.close()
        }
    }
})
app.listen(port, () => {
    console.log(`Servidor corriende en http://localhost:${port}`);
    
})
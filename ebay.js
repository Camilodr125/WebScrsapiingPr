const express = require('express');
const app = express();
const puppeteer = require('puppeteer');
const port = 7000;

app.get('/products', async(req, res) => {
    let browser;

    try {
        let pageNumber = 1;
        const data = [];
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        while (pageNumber < 10) {
            const url = `https://www.ebay.com/sch/i.html?_nkw=laptop&_pgn=${pageNumber}&rt=nc`;
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3');
            await page.goto(url, {waitUntil: 'networkidle2'});

            const info = await page.evaluate(() => {
                const info = [];
                document.querySelectorAll(".s-item").forEach(item => {
                    const anchorTitle = item.querySelector(".s-item__title span:nth-child(1)");
                    const title = anchorTitle ? anchorTitle.textContent.trim(): null;
                    const anchorPrice = item.querySelector(".s-item__price");
                    const price= anchorPrice ? anchorPrice.textContent.trim(): null;
                    const anchorCondition= item.querySelector(".SECONDARY_INFO");
                    const condition = anchorCondition ? anchorCondition.textContent.trim(): null;
                    const anchorUrl= item.querySelector(".s-item__link");
                    const url = anchorUrl ? anchorUrl.href: null;
                    const anchorShipping = item.querySelector(".s-item__shipping");
                    const shipping= anchorShipping ? anchorShipping.textContent.trim(): null;

                    info.push({Title: title, Price: price, Shipping: shipping, Condition: condition, Url: url})

                });

                return info;

            })

            data.push(...info)
            pageNumber++;

        }

        res.json(data)

        
        
    } catch (error) {
        console.error('Error at scrapping', error.message);
        res.status(500).send(`Error during scraping: ${error.message}`); 
    } finally {
        if (browser) {
            await browser.close()
        }
        
    }
});

app.listen(port, () => {
    console.log(`Servidor corriende en http://localhost:${port}`);
    
})
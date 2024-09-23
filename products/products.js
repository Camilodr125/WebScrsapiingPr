const puppeteer = require('puppeteer')
const express = require('express')
const { PierceQueryHandler } = require('puppeteer')
const app = express()
const port = 4000

app.get('/products', async (req, res) => {
    
    let browser;

    try {
        let pageNumber = 1
        const data = [];
        browser = await puppeteer.launch()
        const page = await browser.newPage()

        while (pageNumber < 5) {
            const url = `https://www.realtor.com/apartments/Austin_TX/sby-6/pg-${pageNumber}`;
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3')

            await page.goto(url, {waitUntil: 'networkidle2'})

            const info = await page.evaluate(() => {
                const product = []
                document.querySelectorAll('.Cardstyles__StyledCard-rui__sc-6oh8yg-0').forEach(item => {
                    const anchorAdress = item.querySelector('[data-testid="card-address-1"]')
                    const address = anchorAdress ? anchorAdress.textContent.trim() : null;
                    const anchorPrice = item.querySelector('.jywYrs')
                    const price = anchorPrice ? anchorPrice.textContent.trim() : null;


                    product.push({Address: address, Price: price})        


                })
                return product;
            })

            data.push(...info)
            pageNumber++
        }
        res.json(data)
        
        
    } catch (error) {
        console.error('Error during scrapping:', error.message);
        res.status(500).send(`Error during scrapping ${error.message}`)
        
    } finally {
        if (browser) {
            await browser.close()
        }
    }
})

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/products`);
    
})
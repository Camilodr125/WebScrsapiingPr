//Import the libraries
const express = require('express');
const app = express();
const puppeteer = require('puppeteer');
const port = 5000;

//Create the endpoint
app.get('/book', async (req,res) => {
    const pageNumber = parseInt(req.query.page, 10)

    if(isNaN(pageNumber) || pageNumber<0) {
        return res.status(400).send('ERROR: Invalid Page number'); //Validate that the PageNumber is grater that 0
    }

    let browser;

    try {
        browser = await puppeteer.launch();
        const page = await browser.newPage();
        const url = `https://books.toscrape.com/catalogue/page-${pageNumber}.html`; //Initialize the urs where all the information is going to be fetched

        await page.goto(url, { waitUntil: 'networkidle2' });//Go to the the url mentioned above

        const bookLinks = await page.evaluate( () => {
            return Array.from(document.querySelectorAll('article.product_pod h3 a')).map(anchor => anchor.href)
        })

        const books = [];
        for(let link of bookLinks) {
            await page.goto(link, { waitUntil: 'networkidle2' });

            const data = await page.evaluate(() => {
            
              
                    const anchorTitle= document.querySelector('.product_main h1');
                    const title = anchorTitle ? anchorTitle.textContent.trim() : null;
                    const anchorPrice= document.querySelector('.price_color');
                    const price = anchorPrice ? anchorPrice.textContent.trim() : null;
                    const anchorStock = document.querySelector('.availability');
                    const stock = anchorStock ? anchorStock.textContent.trim() : null;
                    const thirdLi = document.querySelector('.breadcrumb li:nth-child(3)');
                    const altCategory = thirdLi.querySelector('a');
                    const category = altCategory ? altCategory.textContent : null;
    
    
                    return {title, price,stock,category};
    
                
    
                
            });
            books.push({url : link, ...data });

        }
        

        res.json(books)

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
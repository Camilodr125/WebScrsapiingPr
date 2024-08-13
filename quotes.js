const express = require('express');
const app = express();
const puppeteer = require('puppeteer');
const port = 5000;

app.get('/quotes', async(req,res) => {
    pageNumber = parseInt(req.query.page, 10);

    if(isNaN(pageNumber) || pageNumber < 0) {
        return res.status(400).send('ERROR: Invalid page number')
    }

    let browser;

    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        const url = `https://quotes.toscrape.com/page/${pageNumber}/`

        await page.goto(url, {waitUntil: 'networkidle2' })

        const data = await page.evaluate(() => {
            const quotes = [];
            document.querySelectorAll('.quote').forEach(item => {
                const anchorText = item.querySelector('.text');
                const text = anchorText ? anchorText.textContent.trim(): null;
                const anchorAuthor = item.querySelector('.author');
                const author = anchorAuthor ? anchorAuthor.textContent.trim(): null;
                const tags = [];
                const tagElement = item.querySelectorAll('.tag');
                tagElement.forEach(tag => tags.push(tag.textContent.trim()));

                quotes.push({Quote: text, Author: author, Tags:tags});

            });
            return quotes
        });

        res.json(data)
    
        
    } catch (error) {
        console.error('Error at scrapping', error.message);
        res.status(500).send(`Error during scraping: ${error.message}`)
    } finally {
        if (browser) {
            await browser.close()
        }
    }
})

app.listen(port, ()=> {
    console.log(`Servidor corriende en http://localhost:${port}`);
})
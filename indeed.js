const express = require('express');
const app = express();
const puppeteer = require('puppeteer');
const port = 2000;

app.get('/jobs', async(req,res)=>{
    let pageNumber = parseInt(req.query.page, 10);


    if( isNaN(pageNumber) || pageNumber < 0) {
        res.status(400).send('ERROR: Invalid page number' );
    }

    let browser;
    pageNumber = (pageNumber-1)*10

    try {
        
        const browser = await puppeteer.launch({headless: true});
        const page = await browser.newPage();
        const url = `https://co.indeed.com/jobs?q=developer&start=${pageNumber}`
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3');
        await page.goto(url,{waitUntil: 'networkidle2'})

        const data = await page.evaluate(() => {
            const jobs = [];
            document.querySelectorAll('.slider_item').forEach( item => {
                const anchorJob = item.querySelector('.jobTitle a span')
                const job = anchorJob ? anchorJob.textContent.trim(): null;
                const anchorCompany = item.querySelector('.css-63koeb')
                const company = anchorCompany ? anchorCompany.textContent.trim(): null;
                const anchorLocation = item.querySelector('.css-1p0sjhy')
                const location = anchorLocation ? anchorLocation.textContent.trim(): null;
                const anchorUrl = item.querySelector('.jcs-JobTitle')
                const url = anchorUrl ? anchorUrl.href: null;
                const description = []
                const responsabilities = item.querySelectorAll('.css-9446fg li')
                responsabilities.forEach( responsability => {description.push(responsability.textContent.trim())})

                jobs.push({Job: job, Company: company, Location:location, Url: url, Responsabilities: description})


            });
            return jobs;

        });
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

app.listen(port, ()=>{
    console.log(`Servidor corriende en http://localhost:${port}`);
})


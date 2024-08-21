//Import the libraries and initialize the server 
const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const port = 3000;

//Create the endpoint and an input parameter which is pageNumber
app.get('/deshow', async (req, res) => {
    const pageNumber = parseInt(req.query.page, 10); 

    //Validate that the page number is greater than 0
    if (pageNumber < 0 || isNaN(pageNumber)) {
        return res.status(400).send("Invalid page number");
    }

    let browser;

    //Ininitialize the puppeteer browser and page
    try {
        browser = await puppeteer.launch();
        const page = await browser.newPage();
        const url = `https://deshow.com/advance-search/page/${pageNumber}/`; // Create avariable with the url where the data will be scrapped, also adding the pageNumber parameter

        //Navigate to the page that was declared just above
        await page.goto(url, { waitUntil: 'networkidle2' });

        //1. Create a variable where all data that is going to be scrapped will be stored
        const data = await page.evaluate(() => {
            const listings = [];
            document.querySelectorAll('li.col-lg-4').forEach(item => { //Extract data from all the elements that are a list and have the  'col-lg-4' class
                const anchor = item.querySelector('a'); //Select the first a element 
                const linkUrl = anchor ? anchor.href : null; //Extraxt the href attribute from the previos element
                const anchorTitle = item.querySelector('.description h3'); //Select the h3 element that is assciated with the class='description'
                const TitleName = anchorTitle ? anchorTitle.textContent.trim() : null;//Extract the text content from the previos elemnent
                const anchorPrice= item.querySelector('.number');//Select the element with the class='number'
                const TotalPrice = anchorPrice ? anchorPrice.textContent.trim() : null;//Extract the text content from the previous element
                const properties = []; //Create an array where all the features will be stored
                const spans = item.querySelectorAll('.properties span'); //Select all the span elements that are associated with the class='properties'
                spans.forEach(span => properties.push(span.textContent.trim()))//Iterate over those elements in order to extract the text conte and store it in the prperties array
                const anchorstate= item.querySelector('.tag');//Select the element with the class='tag'
                const state = anchorstate ? anchorstate.textContent.trim() : null;//Extract the text content from the previous element
                
                listings.push({ url: linkUrl, title:TitleName, price:TotalPrice, features:properties, status:state }); //Push all the data in the listings array
               
            });
            return listings; // Return the completed array
        });

        res.json(data);//Send the data that was scrapped in a JSON format as response to the server

        //In case there is an error show it in the server
    } catch (error) {
        console.error('Error during scraping:', error.message);
        res.status(500).send(`Error during scraping: ${error.message}`);
    } finally {
        if (browser) {
            await browser.close(); // close the browser 
        }
    }
});
//Show in the cmd the url where the server is running
app.listen(port,() => {
    console.log(`Servidor corriende en http://localhost:${port}`);
    
})

//Camilo A. Diaz
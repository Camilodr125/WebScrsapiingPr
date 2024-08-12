//Import the libraries
const express = require('express');
const app = express();
const port = 4000;

const puppeteer = require('puppeteer')

//Create the endpoint
app.get('/news', async(req,res) => {
    const pageNumber = parseInt(req.query.page, 10);

    if(isNaN(pageNumber) || pageNumber < 0){
      return  res.status(400).send('ERROR: Invalid page number');  //Validate that the PageNumber is grater that 0
    }

    let browser;

    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        const url = `https://news.ycombinator.com/news?p=${pageNumber}` //Initialize the urs where all the information is going to be fetched

        await page.goto(url,{waitUntil: 'networkidle2'});//Go to the the url mentioned above
         
        const data = await page.evaluate(() => {
            const news = [];
            const titles = document.querySelectorAll('.titleline');//Select the elements where the title and url will be fetched
            const subline = document.querySelectorAll('.subline');//Select the elements where the score and comments will be fetched
            

            //Iterate over the elemetns in order to concat all of them in one array
            titles.forEach((item, index) => {
                const anchorTitle = item.querySelector('a');
                const title = anchorTitle ? anchorTitle.textContent.trim(): null;
                const link = anchorTitle ? anchorTitle.href: null

                const scoreElement = subline[index] ? subline[index].querySelector('.score'): null;
                const score = scoreElement ? scoreElement.textContent.trim(): null
                const commentsElement = subline[index] ? subline[index].querySelectorAll('a')[3]: null;
                const comment = commentsElement ? commentsElement.textContent: null;

                news.push({title: title, url: link, score: score, comments: comment });


            })
            return news; //return the array

        })

        res.json(data); //Send the data that was scrapped as a json file



       

        //If there is an error it will validate it and display it
    } catch(error) {
        console.error('Error at scrpping', error.message);
        res.status(500).send(`Error during scraping: ${error.message}`)
        
    } finally {
        if(browser){
            await browser.close();
    }

        }
        
});

app.listen(port,() => {
    console.log(`Servidor corriende en http://localhost:${port}`);
    
});
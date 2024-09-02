
import express, { Request, Response  } from "express";
import puppeteer, { Browser, Page } from "puppeteer";


const app = express();
const port = 3000;

app.get('/deshow', async (req: Request, res: Response) => {
    const pageNumber = parseInt(req.query.page as string, 10);

    if (pageNumber < 0 || isNaN(pageNumber)) {
        return res.status(400).send('Invalid Page Number');
    }

    let browser: Browser | null = null;

    try {
        browser = await puppeteer.launch();
        const page = await browser.newPage();
        const url = `https://deshow.com/advance-search/page/${pageNumber}/`;

        await page.goto(url, {waitUntil: 'networkidle2'});

        const data = await page.evaluate(() => {
            const listings: Array<{ url: string | null, title: string | null, price: string | null, features: string[] | null, status: string | null }> = [];
            document.querySelectorAll('li.col-lg-4').forEach((item: any) => {
                const anchor = item.querySelector('a');
                const anchorUrl = anchor ? anchor.href : null;
                const anchorTitle = item.querySelector('.description h3'); // Select the 'h3' element associated with the class='description'
                const TitleName = anchorTitle ? anchorTitle.textContent?.trim() || null : null; // Extract the text content from the previous element
                const anchorPrice = item.querySelector('.number'); // Select the element with the class='number'
                const TotalPrice = anchorPrice ? anchorPrice.textContent?.trim() || null : null; // Extract the text content from the previous element
                const properties: string[] = []; // Create an array where all the features will be stored
                const spans = item.querySelectorAll('.properties span'); // Select all the span elements that are associated with the class='properties'
                spans.forEach((span: any) => properties.push(span.textContent?.trim() || '')); // Iterate over those elements to extract the text content and store it in the properties array
                const anchorState = item.querySelector('.tag'); // Select the element with the class='tag'
                const state = anchorState ? anchorState.textContent?.trim() || null : null; // Extract the text content from the previous element


                listings.push({url: anchorUrl, title: TitleName, price: TotalPrice, features:properties, status: state})
            });

            return listings
        });

        res.json(data)
    } catch (error) {
        console.error('Error during scrapping: ', (error as Error).message);
        res.status(500).send(`Error during scrapping: ${(error as Error).message}`);
    } finally {
        if (browser) {
            await browser.close()
        }
    }
})


app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
    
})
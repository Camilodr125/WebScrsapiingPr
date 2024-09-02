import express, {Request, Response } from 'express'
import puppeteer, { Browser } from 'puppeteer'
const app = express();
const port = 5000;

app.get('/quotes', async(req: Request, res: Response) => {
    const pageNumber = parseInt(req.query.page as string, 10);
    const tag = req.query.tag as string;


    if(isNaN(pageNumber) || pageNumber < 0) {
        return res.status(400).send('ERROR: Invalid page number')
    }

    let browser: Browser | null = null;

    try {
         browser = await puppeteer.launch();
        const page = await browser.newPage();
        const url = `https://quotes.toscrape.com/page/${pageNumber}/`

        await page.goto(url, {waitUntil: 'networkidle2' })

        const data = await page.evaluate((tag: any) => {
            const quotes: Array<{Quote: string | null, Author: string | null, Tags: string[] | null,}> = [];
            document.querySelectorAll('.quote').forEach((item: any) => {
                const anchorText = item.querySelector('.text');
                const text = anchorText ? anchorText.textContent.trim(): null;
                const anchorAuthor = item.querySelector('.author');
                const author = anchorAuthor ? anchorAuthor.textContent.trim(): null;
                const tags: string[] = [];
                const tagElement = item.querySelectorAll('.tag');
                tagElement.forEach((tag:any) => tags.push(tag.textContent.trim()));

                if(tag && !tags.includes(tag))  return;
                    quotes.push({Quote: text, Author: author, Tags:tags});
            });
            return quotes
        }, tag);

        res.json(data)
    
        
    } catch (error) {
        console.error('Error at scrapping', (error as Error).message);
        res.status(500).send(`Error during scraping: ${(error as Error).message}`)
    } finally {
        if (browser) {
            await browser.close()
        }
    }
})

app.listen(port, ()=> {
    console.log(`Servidor corriende en http://localhost:${port}`);
})
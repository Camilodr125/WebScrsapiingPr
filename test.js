const puppeteer = require('puppeteer');

async function  screenshot() {
    const browser = await puppeteer.launch({headless: false, slowMo:400});
    const page = await browser.newPage();
    await page.goto('https://www.example.com');
    await page.screenshot({path: 'example.png'})
    await page.pdf({ path: 'page.pdf', format: 'A4' });

    

    await browser.close();
}

//screenshot();


async function  click() {
    const browser = await puppeteer.launch({headless: false, slowMo:400});
    const page = await browser.newPage();
    await page.goto('https://quotes.toscrape.com/');
    await page.click('a[href="/login"]')


    

    await browser.close();
}

click();

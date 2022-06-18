const catchAsync = require('../middleware/catchAysnc');
const puppeteer = require('puppeteer')
exports.generateReport = catchAsync( async(req,res,next)=>{
    
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('http://localhost:3000/api/v1/generateReport'
    , {
        waitUntil: 'networkidle2',
    });
    const result = await page.pdf({format: 'a4' });
    await browser.close();
    
    res.set({ 'Content-Type': 'application/pdf', 'Content-Length': result.length })
    res.status(200).send(result)
})


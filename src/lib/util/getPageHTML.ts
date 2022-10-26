import puppeteer from 'puppeteer';

const getPageHTML = async (pageUrl) => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage()
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.60 Safari/537.36')
  await page.goto(pageUrl, { waitUntil: "networkidle2" })

  const pageHTML = await page.evaluate('new XMLSerializer().serializeToString(document.doctype) + document.documentElement.outerHTML')

  await page.removeAllListeners()
  await browser.close()
  return pageHTML
}

export default getPageHTML
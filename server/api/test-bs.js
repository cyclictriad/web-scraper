import puppeteer from 'puppeteer';


export default defineEventHandler(async (event) => {
  const broswer = await puppeteer.launch({ headless: false })
  const page = await broswer.newPage();
  const data = []
  await page.goto("https://brainscape.com/subjects")
  const listings = await page.$$(".tag-listing > li")

  for (const listing of listings) {
    const classList = await listing.evaluate(el => [...el.classList])
    const details = await (await listing.$('a.tag-link')).evaluate(el => ({ name: el.textContent, url: el.href }))
    if (classList.includes("root-tag")) {
      data.push({ ...details, l2: [] })
    } else {
      if (classList.includes("leaf-tag")) {
        data.at(-1).l2.push(details)
      } else if (classList.includes("parent-tag")) {
        data.at(-1).l2.push({ ...details, l3: [] })
      }

    }

  }
  for (const l1 of data) {
    for (const l2 of l1.l2) {
      if (!Object.keys(l2).includes("l3")) continue;

      await page.goto(l2.url)
      const listings = await page.$$(".tag-listing > li")
      
      let gotToL4 = false;

      for (const listing of listings) {

        const classList = await listing.evaluate(el => [...el.classList])
        const details = await (await listing.$('a.tag-link')).evaluate(el => ({ name: el.textContent, url: el.href }))

        if (classList.includes("root-tag")) {

          l2.l3.push({ ...details, l4: [] })
          gotToL4 = true;
        } else {

          if (gotToL4) {
            console.log(gotToL4)
            l2.l3.at(-1).l4.push(details)

          } else {

            l2.l3.push(details)
          }
        }
      }
    }
  }
  await broswer.close()
  return data;
})
const { chromium } = require('C:/Users/Husnain/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const path = require('node:path');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
 await page.goto('http://127.0.0.1:5173');await page.waitForTimeout(2600);
 await page.screenshot({path:'artifacts/lock.png'});
 await page.locator('[data-device-action="home"]').click();await page.waitForLoadState('networkidle');await page.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode().catch(()=>{}))));await page.waitForTimeout(600);
 await page.screenshot({path:'artifacts/home.png'});
 console.log('home icons',await page.locator('.duo-app-grid .app-icon').count());
 console.log('broken images',await page.locator('img').evaluateAll(imgs=>imgs.filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src)));
 await page.locator('[data-device-action="split"]').click();await page.waitForTimeout(500);
 await page.screenshot({path:'artifacts/split.png'});
 await page.locator('[data-device-action="fold"]').click();await page.waitForTimeout(650);
 console.log('folded',await page.evaluate(()=>OS.get('folded')));
 await page.locator('[data-device-action="home"]').click();await page.waitForTimeout(300);
 await page.screenshot({path:'artifacts/folded.png'});
 await page.locator('[data-device-action="controls"]').click();
 console.log('control center',await page.evaluate(()=>OS.get('controlCenterOpen')));
 await page.keyboard.press('Escape');
 for(const app of ['phone','mail','calendar','reminders','shortcuts','health','wallet','facetime','tv','appstore','maps','settings','photos','notes','calculator','clock','weather','music','files','safari','camera','messages']){
  await page.evaluate(id=>OS.multitasking.openApp(id,'left'),app);
  if(!await page.locator('#content-left').innerText())errors.push('empty app '+app);
 }
 await page.evaluate(()=>OS.duo.home());
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(500);
 await page.screenshot({path:'artifacts/mobile.png'});
 console.log('errors',JSON.stringify(errors));
 await browser.close();if(errors.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});

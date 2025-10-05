import asyncio
from playwright import async_api

async def run_test():
    pw = None
    browser = None
    context = None
    
    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()
        
        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )
        
        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)
        
        # Open a new page in the browser context
        page = await context.new_page()
        
        # Navigate to your target URL and wait until the network request is committed
        await page.goto("http://localhost:8080", wait_until="commit", timeout=10000)
        
        # Wait for the main page to reach DOMContentLoaded state (optional for stability)
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=3000)
        except async_api.Error:
            pass
        
        # Iterate through all iframes and wait for them to load as well
        for frame in page.frames:
            try:
                await frame.wait_for_load_state("domcontentloaded", timeout=3000)
            except async_api.Error:
                pass
        
        # Interact with the page elements to simulate user flow
        # Select a demo user from available seed users to log in.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div[2]/div/div[2]/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Use User Switcher on header to select a different demo user.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div[2]/header/div/div[2]/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Select a different demo user (Borrower B) from the User Switcher to switch user context.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div[3]/div[2]/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Assert user is logged in and redirected to dashboard by checking the page title or a dashboard-specific element.
        assert 'dashboard' in frame.url.lower() or 'LenTrust - Peer-to-Peer Lending with Accountability' in await frame.title()
        # Assert the dashboard shows the logged in user's name (Borrower A initially)
        dashboard_user_name = await frame.locator('xpath=//header//div[contains(text(),"Borrower A")]').text_content()
        assert 'Borrower A' in dashboard_user_name
        # After switching user, assert the dashboard reloads with new user data (Borrower B)
        await page.wait_for_timeout(3000)  # wait for dashboard reload
        dashboard_user_name_after_switch = await frame.locator('xpath=//header//div[contains(text(),"Borrower B")]').text_content()
        assert 'Borrower B' in dashboard_user_name_after_switch
        # Assert user is logged out and returned to login page by checking URL or login page element
        await page.wait_for_timeout(3000)
        assert 'login' in frame.url.lower() or await frame.locator('xpath=//button[contains(text(),"Select a demo user")]').is_visible()
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    
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
        # Click on the lender user button to log in as lender.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div[2]/div/div[2]/div/button[3]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Check for incoming loan requests list and verify borrower Reliability Stars and negative reviews if any.
        await page.mouse.wheel(0, window.innerHeight)
        

        # Assert that the incoming loan requests list is displayed
        loan_requests_section = frame.locator('text=awaiting_borrower_confirmation').first
        assert await loan_requests_section.is_visible(), 'Incoming loan requests section is not visible',
        # Assert borrower Reliability Stars (reliability_score) are visible for active contracts
        active_contracts = frame.locator('text=Active').locator('..')
        assert await active_contracts.count() > 0, 'No active contracts found',
        for i in range(await active_contracts.count()):
            contract = active_contracts.nth(i)
            reliability_score = await contract.locator('text=Excellent').count() + await contract.locator('text=Poor').count()
            assert reliability_score > 0, f'Reliability score not visible for contract {i}',
        # Assert negative reviews are shown pinned for borrowers with outstanding issues
        overdue_notes = frame.locator('text=Overdue by').first
        assert await overdue_notes.is_visible(), 'Negative reviews (overdue notes) not visible for borrowers with outstanding issues'
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    
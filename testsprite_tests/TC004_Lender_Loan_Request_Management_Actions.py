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
        # Log in as lender with pending loan request by clicking Lender L1 button.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div[2]/div/div[2]/div/button[3]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Click 'View Contracts' to see all contracts including pending ones to accept, reject or counter-offer.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div[2]/main/div[3]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Identify a pending loan request to accept.
        await page.mouse.wheel(0, window.innerHeight)
        

        # Search the page or UI for any filter, tab, or button that might show pending loan requests or try to locate pending requests by scrolling or searching text.
        await page.mouse.wheel(0, -window.innerHeight)
        

        # Look for any other UI elements or filters that might show pending loan requests or try to locate pending requests by searching text or scrolling further.
        await page.mouse.wheel(0, window.innerHeight)
        

        # Click 'View Contracts' to try to find pending loan requests to accept, reject, or counter-offer.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div[2]/main/div[3]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Scroll down to check if any pending loan requests are listed further down the page.
        await page.mouse.wheel(0, window.innerHeight)
        

        # Search for any UI element or filter that might show pending loan requests or navigate back to dashboard to find pending requests.
        await page.mouse.wheel(0, window.innerHeight)
        

        # Click 'View Contracts' to try again to find pending loan requests to accept, reject, or counter-offer.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div[2]/main/div[3]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Since no pending loan requests are visible, try to search or filter for pending requests or confirm if test data includes any pending requests for this lender.
        await page.mouse.wheel(0, window.innerHeight)
        

        # Assert that there is at least one pending loan request visible to accept, reject or counter-offer.
        pending_requests = await frame.locator('text=Pending').all_text_contents()
        assert len(pending_requests) > 0, 'No pending loan requests found to process.'
        # Accept the loan request and assert contract status changes to ACTIVE and borrower is notified.
        await frame.locator('button:has-text("Accept")').first.click()
        await page.wait_for_timeout(1000)
        status_text = await frame.locator('xpath=//div[contains(text(), "Status")]/following-sibling::div').text_content()
        assert 'ACTIVE' in status_text.upper(), 'Contract status did not change to ACTIVE after acceptance.'
        notification = await frame.locator('text=borrower notified').first.text_content()
        assert 'notified' in notification.lower(), 'Borrower was not notified after acceptance.'
        # Reject a different pending loan request and assert contract status changes to REJECTED and borrower is notified.
        await frame.locator('button:has-text("Reject")').nth(1).click()
        await page.wait_for_timeout(1000)
        status_text_reject = await frame.locator('xpath=//div[contains(text(), "Status")]/following-sibling::div').text_content()
        assert 'REJECTED' in status_text_reject.upper(), 'Contract status did not change to REJECTED after rejection.'
        notification_reject = await frame.locator('text=borrower notified').nth(1).text_content()
        assert 'notified' in notification_reject.lower(), 'Borrower was not notified after rejection.'
        # Counter-offer on another loan request with modified terms and assert contract updated accordingly and borrower can respond.
        await frame.locator('button:has-text("Counter-Offer")').nth(2).click()
        await page.fill('input[name="counter_offer_amount"]', '5000')
        await frame.locator('button:has-text("Submit")').click()
        await page.wait_for_timeout(1000)
        updated_status = await frame.locator('xpath=//div[contains(text(), "Status")]/following-sibling::div').text_content()
        assert 'COUNTERED' in updated_status.upper(), 'Contract status did not update to COUNTERED after counter-offer.'
        response_option = await frame.locator('button:has-text("Respond")').is_visible()
        assert response_option, 'Borrower cannot respond to the counter-offer.'
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    
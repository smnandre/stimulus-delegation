import { test, expect } from '@playwright/test';

test.describe('Delegation Mixin E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/e2e/delegation.html');
    await page.waitForLoadState('domcontentloaded');
  });

  test('delegates button clicks correctly', async ({ page }) => {
    const log = page.locator('#main-log');
    
    await expect(log).toContainText('Controller connected');
    
    await page.click('#save-btn');
    await expect(log).toContainText('Button clicked: save (Save)');
    await expect(log).toContainText('→ Saving data...');
    
    await page.click('#cancel-btn');
    await expect(log).toContainText('Button clicked: cancel (Cancel)');
    await expect(log).toContainText('→ Cancelling operation...');
  });

  test('handles form input events', async ({ page }) => {
    const log = page.locator('#main-log');
    
    await page.fill('#username-input', 'testuser');
    await expect(log).toContainText('Input changed: username = "testuser"');
    
    await page.fill('#email-input', 'test@example.com');
    await expect(log).toContainText('Input changed: email = "test@example.com"');
    
    await page.selectOption('#role-select', 'admin');
    await expect(log).toContainText('Select changed: role = "admin"');
  });

  test('handles nested element clicks with closest()', async ({ page }) => {
    const log = page.locator('#main-log');
    
    // Click nested clickable span
    await page.click('.card[data-card-id="1"] .clickable');
    await expect(log).toContainText('Clickable clicked: "Click me (nested)"');
    
    // Click deep nested element
    await page.click('.deep-nested');
    await expect(log).toContainText('Clickable clicked: "Deep nested clickable"');
    
    // Click card itself
    await page.click('.card[data-card-id="2"]');
    await expect(log).toContainText('Card clicked: 2');
  });

  test('works with dynamically added elements', async ({ page }) => {
    const log = page.locator('#main-log');
    
    // Add dynamic button
    await page.click('#add-dynamic');
    
    // Click the dynamically added button
    await page.click('#dynamic-container button');
    await expect(log).toContainText('Button clicked: dynamic (Dynamic 1)');
    
    // Add another and test
    await page.click('#add-dynamic');
    await page.click('#dynamic-container button:last-child');
    await expect(log).toContainText('Button clicked: dynamic (Dynamic 2)');
  });

  test('handles button hover events', async ({ page }) => {
    const log = page.locator('#main-log');
    
    await page.hover('#save-btn');
    await expect(log).toContainText('Button hovered: save');
    
    await page.hover('#delete-btn');
    await expect(log).toContainText('Button hovered: delete');
  });

  test('properly cleans up on disconnect', async ({ page }) => {
    const log = page.locator('#main-log');
    
    // Verify events work initially
    await page.click('#save-btn');
    await expect(log).toContainText('Button clicked: save');
    
    // Clear log for clean test
    await page.click('#clear-log');
    await expect(log).toContainText('No events yet');
    
    // Disconnect controller
    await page.click('#disconnect-controller');
    await expect(log).toContainText('Controller disconnected - cleaning up');
    
    // Events should no longer trigger
    await page.click('#save-btn');
    await page.click('#cancel-btn');
    
    // Should only show disconnect message, no new events
    const logContent = await log.textContent();
    expect(logContent).not.toContain('Button clicked');
  });

  test('reconnection works properly', async ({ page }) => {
    const log = page.locator('#main-log');
    
    // Disconnect then reconnect
    await page.click('#disconnect-controller');
    await page.click('#clear-log');
    await page.click('#reconnect-controller');
    
    await expect(log).toContainText('Controller connected');
    
    // Events should work again
    await page.click('#save-btn');
    await expect(log).toContainText('Button clicked: save');
  });

  test('multiple event types on same element', async ({ page }) => {
    const log = page.locator('#main-log');
    
    const saveBtn = page.locator('#save-btn');
    
    // Click should trigger button click handler
    await saveBtn.click();
    await expect(log).toContainText('Button clicked: save');
    
    // Hover should trigger hover handler
    await saveBtn.hover();
    await expect(log).toContainText('Button hovered: save');
  });

  test('events are contained within controller scope', async ({ page }) => {
    const log = page.locator('#main-log');
    
    // Add button outside controller scope
    await page.evaluate(() => {
      const externalBtn = document.createElement('button');
      externalBtn.className = 'btn';
      externalBtn.dataset.action = 'external';
      externalBtn.textContent = 'External Button';
      externalBtn.id = 'external-btn';
      document.body.appendChild(externalBtn);
    });
    
    await page.click('#clear-log');
    
    // Click external button should not trigger controller handler
    await page.click('#external-btn');
    
    const logContent = await log.textContent();
    expect(logContent).toBe('No events yet');
    
    // But internal button should still work
    await page.click('#save-btn');
    await expect(log).toContainText('Button clicked: save');
  });

  test('log functionality works correctly', async ({ page }) => {
    const log = page.locator('#main-log');
    
    await page.click('#clear-log');
    await expect(log).toContainText('No events yet');
    
    await page.click('#save-btn');
    await page.click('#cancel-btn');
    
    const logContent = await log.textContent();
    const lines = logContent.split('\n');
    
    // Should have multiple timestamped entries
    expect(lines.length).toBeGreaterThan(1);
    expect(lines[0]).toMatch(/\[\d{1,2}:\d{2}:\d{2}.*\]/);
    expect(logContent).toContain('Button clicked: save');
    expect(logContent).toContain('Button clicked: cancel');
  });
});

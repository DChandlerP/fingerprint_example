import { test, expect } from '@playwright/test';

test.describe('CIPP/US Flashcards Navigation and Functionality', () => {

  test.beforeEach(async ({ page }) => {
    // Mock the flashcards.json fetch to ensure predictable and fast testing
    await page.route('**/flashcards.json', async route => {
      const mockDecks = [
        {
          name: 'Test Deck 1',
          cards: [
            { front: 'Deck 1 Front 1', back: 'Deck 1 Back 1' },
            { front: 'Deck 1 Front 2', back: 'Deck 1 Back 2' }
          ]
        },
        {
          name: 'Test Deck 2',
          cards: [
            { front: 'Deck 2 Front 1', back: 'Deck 2 Back 1' }
          ]
        }
      ];
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockDecks)
      });
    });

    await page.goto('/cipp_flashcards.html');
  });

  test('should load category view and disable start button initially', async ({ page }) => {
    // Verify that the category view is visible
    await expect(page.locator('#category-view')).toBeVisible();
    await expect(page.locator('#flashcard-view')).toBeHidden();
    
    // By default, no checkboxes might be selected if we dynamically populate,
    // though the code adds them empty. We ensure start button is disabled until selection.
    // Wait, the DOM logic generates checkboxes, we should check their states.
    const startBtn = page.locator('#start-btn');
    await expect(startBtn).toBeDisabled();
    
    const checkboxes = page.locator('.deck-checkbox');
    await expect(checkboxes).toHaveCount(2);
  });

  test('should allow selecting decks and starting review', async ({ page }) => {
    const startBtn = page.locator('#start-btn');
    await expect(startBtn).toBeDisabled();

    // Select the first deck
    const deck1Checkbox = page.locator('input.deck-checkbox').nth(0);
    await deck1Checkbox.check();

    // The start button should be enabled now
    await expect(startBtn).toBeEnabled();

    // Start Review
    await startBtn.click();

    // Flashcard view should be visible now
    await expect(page.locator('#category-view')).toBeHidden();
    await expect(page.locator('#flashcard-view')).toBeVisible();

    // Verify counter (we selected Deck 1, which has 2 cards)
    await expect(page.locator('#card-counter')).toHaveText('1 / 2');
  });

  test('select all checkbox should toggle all deck selections', async ({ page }) => {
    const selectAllCheckbox = page.locator('#select-all');
    const startBtn = page.locator('#start-btn');

    // Check 'Select All'
    await selectAllCheckbox.check();
    
    // Verifying both individual checkboxes are checked
    const checkboxes = page.locator('.deck-checkbox');
    for (let i = 0; i < await checkboxes.count(); i++) {
        await expect(checkboxes.nth(i)).toBeChecked();
    }
    await expect(startBtn).toBeEnabled();

    // Uncheck 'Select All'
    await selectAllCheckbox.uncheck();
    for (let i = 0; i < await checkboxes.count(); i++) {
        await expect(checkboxes.nth(i)).not.toBeChecked();
    }
    await expect(startBtn).toBeDisabled();
  });

  test('should flip the flashcard when clicked', async ({ page }) => {
    // Select a deck and start
    await page.locator('input.deck-checkbox').nth(0).check();
    // Turn off shuffle so order is predictable
    await page.locator('#shuffle-cards').uncheck();
    await page.locator('#start-btn').click();

    await expect(page.locator('#card-front')).toContainText('Deck 1 Front 1');

    const cardContainer = page.locator('#card-container');
    const cardInner = page.locator('#card-inner');

    // Initially not flipped (should not have rotate-y-180 class)
    await expect(cardInner).not.toHaveClass(/rotate-y-180/);

    // Click to flip
    await cardContainer.click();

    // Verify flipped
    await expect(cardInner).toHaveClass(/rotate-y-180/);
    await expect(page.locator('#card-back')).toContainText('Deck 1 Back 1');

    // Click to flip back
    await cardContainer.click();
    await expect(cardInner).not.toHaveClass(/rotate-y-180/);
  });

  test('should navigate to next and previous cards', async ({ page }) => {
    await page.locator('#select-all').check();
    await page.locator('#shuffle-cards').uncheck(); // predictable order
    await page.locator('#start-btn').click();

    // Card 1
    await expect(page.locator('#card-counter')).toHaveText('1 / 3');
    await expect(page.locator('#card-front')).toContainText('Deck 1 Front 1');
    await expect(page.locator('#prev-btn')).toBeDisabled(); // Can't go back on first card

    // Go to Card 2
    await page.locator('#next-btn').click();
    await expect(page.locator('#card-counter')).toHaveText('2 / 3');
    await expect(page.locator('#card-front')).toContainText('Deck 1 Front 2');
    await expect(page.locator('#prev-btn')).toBeEnabled();

    // Go back to Card 1
    await page.locator('#prev-btn').click();
    await expect(page.locator('#card-counter')).toHaveText('1 / 3');
    await expect(page.locator('#card-front')).toContainText('Deck 1 Front 1');
  });

  test('should show complete view when finishing all cards', async ({ page }) => {
    // Select Deck 2 (only 1 card)
    await page.locator('input.deck-checkbox').nth(1).check();
    await page.locator('#start-btn').click();

    // We are on the only card
    await expect(page.locator('#card-counter')).toHaveText('1 / 1');
    await expect(page.locator('#flashcard-view')).toBeVisible();
    await expect(page.locator('#complete-view')).toBeHidden();

    // Click next (which would be index 1 >= 1)
    await page.locator('#next-btn').click();

    // Now complete view should be visible
    await expect(page.locator('#flashcard-view')).toBeHidden();
    await expect(page.locator('#complete-view')).toBeVisible();
    await expect(page.locator('#total-reviewed')).toHaveText('1');

    // Clicking restart should take us back to flashcard view
    await page.locator('#restart-btn').click();
    await expect(page.locator('#complete-view')).toBeHidden();
    await expect(page.locator('#flashcard-view')).toBeVisible();
    await expect(page.locator('#card-counter')).toHaveText('1 / 1');
  });

  test('should quit review and return to category selection', async ({ page }) => {
    await page.locator('input.deck-checkbox').nth(0).check();
    await page.locator('#start-btn').click();

    await expect(page.locator('#flashcard-view')).toBeVisible();
    await expect(page.locator('#category-view')).toBeHidden();

    // Click Quit
    await page.locator('#quit-btn').click();

    await expect(page.locator('#flashcard-view')).toBeHidden();
    await expect(page.locator('#category-view')).toBeVisible();
  });
});

import { test, expect } from '@playwright/test';

test.describe('CIPP/US Practice Exam Navigation and Functionality', () => {

  const mockQuestions = [
    {
      text: 'What is the capital of Privacy?',
      correctAnswer: 'A',
      rationale: 'Because it is a mock rationale.',
      options: [
        { label: 'A', text: 'PrivacyLand' },
        { label: 'B', text: 'PublicLand' }
      ]
    },
    {
      text: 'Which principle ensures data is correct?',
      correctAnswer: 'B',
      rationale: 'Integrity ensures correctness.',
      options: [
        { label: 'A', text: 'Confidentiality' },
        { label: 'B', text: 'Integrity' },
        { label: 'C', text: 'Availability' }
      ]
    }
  ];

  test.beforeEach(async ({ page }) => {
    // Mock the practice_questions.json fetch
    await page.route('**/practice_questions.json', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockQuestions)
      });
    });

    await page.goto('/cipp_us_practice_exam.html');
  });

  test('should load start screen and display total questions', async ({ page }) => {
    // Start screen visible
    await expect(page.locator('#start-screen')).toBeVisible();
    await expect(page.locator('#quiz-container')).toBeHidden();

    // Verify the total questions count is displayed from our mock
    await expect(page.locator('#total-questions-count')).toHaveText('2');
    await expect(page.locator('#question-count')).toHaveValue('2');
  });

  test('should allow custom question count limit', async ({ page }) => {
    const questionCountInput = page.locator('#question-count');

    // Change input to 1
    await questionCountInput.fill('1');
    await page.locator('#start-btn').click();

    // Verify only 1 question was loaded in the progress
    await expect(page.locator('#question-progress')).toHaveText('Question 1 of 1');
  });

  test('should handle a correct answer correctly', async ({ page }) => {
    await page.locator('#start-btn').click();
    await expect(page.locator('#quiz-container')).toBeVisible();

    const currentQuestionText = await page.locator('#question-text').innerText();
    const isQuestion1 = currentQuestionText.includes('capital of Privacy');
    const correctOptionText = isQuestion1 ? 'PrivacyLand' : 'Integrity';

    // Click the correct answer
    const correctBtn = page.locator('#options-container button', { hasText: correctOptionText });
    await correctBtn.click();

    // Verify feedback is shown and correct
    await expect(page.locator('#feedback-container')).toBeVisible();
    await expect(page.locator('#feedback-header')).toContainText('Correct!');
    
    // Score should be 1
    await expect(page.locator('#score-display')).toHaveText('Score: 1');

    // Rationale should be displayed
    const expectedRationale = isQuestion1 ? 'Because it is a mock rationale.' : 'Integrity ensures correctness.';
    await expect(page.locator('#rationale-text')).toHaveText(expectedRationale);
  });

  test('should handle an incorrect answer correctly', async ({ page }) => {
    await page.locator('#start-btn').click();

    const currentQuestionText = await page.locator('#question-text').innerText();
    const isQuestion1 = currentQuestionText.includes('capital of Privacy');
    const incorrectOptionText = isQuestion1 ? 'PublicLand' : 'Confidentiality';

    // Click the incorrect answer
    const incorrectBtn = page.locator('#options-container button', { hasText: incorrectOptionText }).first();
    await incorrectBtn.click();

    // Verify feedback is shown and is incorrect
    await expect(page.locator('#feedback-container')).toBeVisible();
    await expect(page.locator('#feedback-header')).toContainText('Incorrect');
    
    // Score should be 0
    await expect(page.locator('#score-display')).toHaveText('Score: 0');
  });

  test('should progress through the quiz and show results', async ({ page }) => {
    await page.locator('#start-btn').click();

    for (let i = 0; i < 2; i++) {
        // Resolve current question to answer it correctly
        const currentQuestionText = await page.locator('#question-text').innerText();
        const isQuestion1 = currentQuestionText.includes('capital of Privacy');
        const correctOptionText = isQuestion1 ? 'PrivacyLand' : 'Integrity';

        // Wait to make sure option updates 
        const correctBtn = page.locator('#options-container button', { hasText: correctOptionText });
        await correctBtn.click();

        // Click Next
        await page.locator('#next-btn').click();
    }

    // Now we should be on results screen
    await expect(page.locator('#quiz-container')).toBeHidden();
    await expect(page.locator('#results-screen')).toBeVisible();

    // We answered 2 correctly
    await expect(page.locator('#final-score')).toHaveText('100%');
    await expect(page.locator('#final-stats')).toHaveText('2 out of 2 questions correct');
  });
});

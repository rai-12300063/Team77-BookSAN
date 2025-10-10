// Basic test to verify jest-dom is working
test('jest-dom matchers are available', () => {
  const div = document.createElement('div');
  div.textContent = 'BookSAN Learning Progress Tracker';
  document.body.appendChild(div);
  
  expect(div).toBeInTheDocument();
  expect(div).toHaveTextContent('BookSAN Learning Progress Tracker');
});

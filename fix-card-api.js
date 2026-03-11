const fs = require('fs');
const file = 'src/api/service.js';

let content = fs.readFileSync(file, 'utf8');

// The required JSON logic to be converted over to match POST {{URL}}/api/cards
// But wait, the user says the API is currently failing for "employee login".
// We need to look at CreateHealthCard first to see what the employee is calling.

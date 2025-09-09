const actionsStorage = /actions.*storage/i;
const actionsMinutes = /actions(?!.*storage)/i;

console.log('Testing GitHub Actions - Storage:');
console.log('actionsStorage test:', actionsStorage.test('github actions - storage'));
console.log('actionsMinutes test:', actionsMinutes.test('github actions - storage'));

console.log('\nTesting GitHub Actions - Linux:');
console.log('actionsStorage test:', actionsStorage.test('github actions - linux'));  
console.log('actionsMinutes test:', actionsMinutes.test('github actions - linux'));

console.log('\nTesting Actions Storage:');
console.log('actionsStorage test:', actionsStorage.test('actions storage'));
console.log('actionsMinutes test:', actionsMinutes.test('actions storage'));

console.log('\nTesting Actions Minutes:');
console.log('actionsStorage test:', actionsStorage.test('actions minutes'));
console.log('actionsMinutes test:', actionsMinutes.test('actions minutes'));

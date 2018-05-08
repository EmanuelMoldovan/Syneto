const User = require('./models/auth');

test('Should not match the username', () => {    
    expect('231').not.toBe('emanuel');
});

test('Should match the username', () => {    
    expect('emanuel').toBe('emanuel');
});

test('Should be true', () => {
    expect(User.match('ana')).toBe(true);
});
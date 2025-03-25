module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  rules: {
    // Enforce consistent code style
    '@typescript-eslint/explicit-member-accessibility': ['error'],
    '@typescript-eslint/explicit-function-return-type': ['error'],
    '@typescript-eslint/no-explicit-any': ['error'],
    '@typescript-eslint/typedef': ['error'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'never'],
    'indent': ['error', 2],
    'no-unexpected-multiline': 'error',
    
    // Function style rules
    'func-style': ['error', 'expression'],
    'arrow-body-style': ['error', 'as-needed'],
    'prefer-arrow-callback': ['error', { allowNamedFunctions: false }],
    'arrow-parens': ['error', 'always'],
    
    // Enforce best practices
    '@typescript-eslint/no-unused-vars': ['error'],
    '@typescript-eslint/no-non-null-assertion': ['error'],
    '@typescript-eslint/no-floating-promises': ['error'],
    'no-console': ['warn'],
    
    // Class organization
    '@typescript-eslint/member-ordering': ['error', {
      default: [
        // Index signature
        'signature',
        
        // Fields
        'public-static-field',
        'protected-static-field',
        'private-static-field',
        'public-instance-field',
        'protected-instance-field',
        'private-instance-field',
        
        // Constructors
        'constructor',
        
        // Methods
        'public-static-method',
        'protected-static-method',
        'private-static-method',
        'public-instance-method',
        'protected-instance-method',
        'private-instance-method',
      ],
    }],
  },
} 

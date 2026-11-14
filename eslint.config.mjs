import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const eslintConfig = [
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      // Konten blok berasal dari editor; karakter kutip & komentar teks di JSX
      // sudah lazim di repo ini sehingga diturunkan menjadi peringatan.
      'react/no-unescaped-entities': 'warn',
      'react/jsx-no-comment-textnodes': 'warn',
      // Komponen dashboard lama memakai pola setState di effect.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/immutability': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: false,
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^(_|ignore)',
        },
      ],
    },
  },
  {
    ignores: [
      '.next/',
      'src/payload-types.ts',
      'src/payload-generated-schema.ts',
      'src/app/(payload)/admin/importMap.js',
    ],
  },
]

export default eslintConfig

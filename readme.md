1. Create the package

npm init -y --scope @facebluk -w packages/n

2. Change main to dist/index.js inside package.json

3. Install dependencies 

- npm install @facebluk/n -w @facebluk/n

4. Create tsconfig inside project

project/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist"
  },
  "references": [{ "path": "../n" }]
}

5. Add project reference inside root tsconfig.json

{ "path": "apps/n" }
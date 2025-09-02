@echo off
start cmd /k "node .\Back\index.js"

cd Front
npm run dev

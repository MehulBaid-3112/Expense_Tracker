@echo off
curl --silent --show-error -X POST http://localhost:5000/api/transactions/sms-webhook ^
  -H "Content-Type: application/json" ^
  -d "{\"messageBody\": \"Rs 999 paid for Amazon Prime membership via Credit Card\"}"

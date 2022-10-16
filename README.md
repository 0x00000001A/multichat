# Multichat
Shares messages between streaming services (youtube, trovo).
Example 1:
- YouTube User "Guest" sends message "Hello world"
- Application shows this message and resends it to Trovo chat

Example 2:
- Trovo User "Guest" sends message "Hello world"
- Application shows this message and resends it to YouTube chat (if there is any stream is running)

Example 3:
- Chat owner sends message "Hello world" to any chat
- Message not gonna be shared

Example 4:
- Chat owner sends message "Hello world" using this application
- Message will be sended to Trovo and YouTube

## Requirements
- NodeJS

## Configuration
- Create and fill the `config.json` file in the root folder.

## Installation
- Execute the `npm start` command in the root folder.

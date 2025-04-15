Current Infrastructure & Next Steps for Authentication
Current App Infrastructure

Framework: React Native with Expo
Routing: Expo Router with tabs layout
Backend: Firebase (Authentication & Firestore)
Configuration: Environment variables through Expo's built-in system
Project Structure: Standard Expo app structure with tabs navigation

Working Elements

Firebase connection is successfully established
Environment variables are properly configured
Basic project structure with tabs is in place


TODO:


- Add logout
- Add rest of the login parts 1 and 2
- Add secret to .env => powerful...
- Create a very simple UI








UPDATE (auth) register process.



1. Whenever user registers it should not only create an authentitcation record in (Authentication) from firebase, but also create a record for them into Firestore Database. How to do that?

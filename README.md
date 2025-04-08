# Project Structure Explained

## Root Level Files
- **app.json**: Configuration file for your Expo app (defines app name, version, etc.)
- **babel.config.js**: Babel transpiler configuration
- **expo-env.d.ts**: TypeScript definitions for Expo environment variables
- **firebase.js**: Your Firebase configuration and initialization
- **package.json/package-lock.json**: Node.js dependencies management
- **tsconfig.json**: TypeScript configuration
- **.env**: Environment variables (not visible in folders but you've set it up)
- **.gitignore**: Git ignore rules

## Main Folders
- **app/**: This is the heart of Expo Router - each file becomes a route in your app
  - **(tabs)/**: A special route group for tab-based navigation
    - **_layout.tsx**: Defines the tab navigation structure
    - **index.tsx**: The main/home tab screen
    - **explore.tsx**: The explore tab screen
    - **+not-found.tsx**: Error page for invalid routes

- **assets/**: Static assets like images, fonts, etc.

- **components/**: Reusable UI components
  - Separating these from screens improves code organization and reusability

- **constants/**: Constants and configuration values
  - Typically includes things like theme colors, API endpoints, etc.

- **hooks/**: Custom React hooks
  - Common patterns include hooks for API calls, form handling, etc.

- **node_modules/**: Installed dependencies (managed by npm/yarn)

- **scripts/**: Custom scripts for development, building, etc.

## Expo Router Structure
The `app/` folder uses file-based routing:
- Each file becomes a route (e.g., `/app/index.tsx` → `/` route)
- Folders with parentheses like `(tabs)` are groups that share layouts but don't affect URL paths
- The `_layout.tsx` files define navigation containers for their folder level

You're using a tab-based navigation structure which is common for mobile apps. The authentication implementation we discussed would add an `(auth)` group alongside your existing `(tabs)` group to handle login/signup flows.

This structure follows modern React Native best practices by separating concerns (components, hooks, constants) while using Expo Router's file-based approach for intuitive navigation.


# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
# bezme-app

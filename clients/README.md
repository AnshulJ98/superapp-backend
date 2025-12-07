# Clients

This folder contains scaffolds for client apps and a small shared API client.

Clients added:

- `clients/api` — a tiny Node-compatible API client and `demo.js` script that calls the gateway health endpoint.
- `clients/react-native` — an Expo-ready React Native skeleton (`package.json` + `App.js`).

Quick demo (API client):

1. Run the stack (if not already running):

```bash
cd /Users/anshulj/Documents/backend-project/superapp-backend
docker compose up -d --build
```

2. Run the API client demo:

```bash
cd clients/api
npm install
npm run demo
```

React Native notes:

- The `clients/react-native` folder contains an Expo `package.json` and `App.js` for quick prototyping.
- To run the mobile app, install Expo tools and run:

```bash
cd clients/react-native
npm install
npx expo start
```

When running on Android emulator, the app uses `http://10.0.2.2:8080/` to reach the gateway. On a physical device you can use `localhost` with an expo tunnel or set `GATEWAY_URL` before starting.

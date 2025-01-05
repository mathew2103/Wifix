# WiFix

WiFix is a simple app that automatically logs you into the IIIT Kottayam WiFi network, eliminating the hassle of manual logins. Built with React Native and Expo, WiFix seamlessly runs in the background to ensure uninterrupted connectivity.

## Features

- **Automatic WiFi Login**: No more typing in credentials every time you connect to the IIIT Kottayam WiFi.
- **Background Process**: Uses Expo's Background Fetch to keep you logged in without manual intervention.
- **User-Friendly Interface**: Lightweight and easy to use, WiFix runs with minimal interaction.
- **Time-Saving**: Designed for students and staff who rely on IIIT Kottayam's WiFi for their daily activities.

## Tech Stack

- **React Native**: For building the cross-platform mobile app with a smooth user experience.
- **Expo**: Simplifies the app's development and deployment processes.
- **Expo Background Fetch**: Enables the app to perform background tasks efficiently.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/mathew2103/wifix.git
   cd wifix
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the app:
   ```bash
   expo start
   ```

4. Build the app for your device:
   - For Android: `expo build:android`
   - For iOS: `expo build:ios`

5. Install the built app on your device.

## Scope for Optimization

WiFix is a great starting point, but there’s always room for improvement. Here are a few areas where the app could be enhanced:

1. **Battery Optimization**: Minimize background task frequency to improve battery life.
2. **Push Notifications**: Notify users of login failures or when the app is inactive.

## Contributing

Contributions are welcome! If you’d like to contribute:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Commit your changes and push them to your branch.
4. Open a pull request, detailing your changes and improvements.

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.

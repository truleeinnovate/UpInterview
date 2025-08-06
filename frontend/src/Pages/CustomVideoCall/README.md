# Custom Video Call Integration

This folder contains the custom video call application that has been integrated into the main upinterview application.

## Routes

The video call application is accessible through the following routes:

- `/video-call` - Landing page where users can create or join a room
- `/video-call/join` - Join room page (without specific room ID)
- `/video-call/join/:roomID` - Join specific room page
- `/video-call/room/:roomID/:userName` - Video call room

## Components

### Landing.jsx
- Main entry point for the video call application
- Allows users to enter their name and room ID
- Provides option to create a new room with random ID
- Simple, clean interface with Tailwind CSS styling

### JoinRoom.jsx
- Handles joining specific rooms
- Shows room ID if provided in URL
- Validates user input before joining

### Room.jsx
- Main video call interface
- Displays participant information
- Includes controls for microphone, camera, and screen sharing
- Sidebar with participants list, chat, and question bank areas
- Placeholder for future video call functionality

## Integration Details

The video call routes have been added to the main App.js file as public routes, meaning they don't require authentication. The routes are also excluded from the navbar display.

## Dependencies

The video call functionality will use the `zego-express-engine-webrtc` package. This dependency will be added to package.json when the actual video call functionality is implemented.

## Future Enhancements

- Implement actual video call functionality using ZegoCloud SDK
- Add real-time chat functionality
- Integrate with the existing question bank system
- Add screen sharing capabilities
- Implement participant management
- Add recording functionality

## Usage

1. Navigate to `/video-call` in your browser
2. Enter your name and room ID (or create a new room)
3. Click "Join Room" to enter the video call interface
4. Share the room link with others to invite them

## Styling

The components use Tailwind CSS for styling, maintaining consistency with the main application design. 
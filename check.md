I am working on an existing React Native Expo application named:

“SafeSphereAI”

Project repository:

https://github.com/priyabratasahoo780/Safety-App.git

Project requirements:

- Expo SDK 54
- Expo Go SDK 54 where supported
- React Native
- TypeScript
- Expo Router
- Existing feature-first architecture
- Existing authentication/backend
- Existing Home screen
- Existing Profile screen
- Existing bottom navigation
- Existing SOS feature
- Existing real-time location feature
- Existing Safe Route feature
- Existing Live Tracking feature
- Existing AI Assistant
- Existing AI Safety Analysis
- Existing Guardian/Trusted Contact system
- Existing SafeSphere unique user ID
- Existing Fake Call feature
- Existing Offline AI Fake Call feature
- Existing camera/evidence feature
- Existing notifications
- Existing Neumorphism UI

TASK:

Perform a complete:

“FULL PROJECT AUDIT, FEATURE TEST, BUG FIX AND PRODUCTION-READINESS CHECK”

for the existing SafeSphereAI React Native application.

Automatically inspect every existing feature.

Determine:

1. Which features are fully working.

2. Which features are partially implemented.

3. Which features contain only UI without real functionality.

4. Which buttons have no action.

5. Which routes are missing or broken.

6. Which APIs are not connected.

7. Which backend operations fail.

8. Which permissions are missing.

9. Which features use fake or hard-coded data.

10. Which features crash or produce errors.

11. Which features do not work in Expo Go.

12. Which features require an EAS Development Build.

13. Which features require environment variables.

14. Which features require backend deployment.

15. Which features cannot be tested automatically.

After the audit:

Fix every issue that can be safely fixed using the existing project architecture.

Do not only provide suggestions.

Implement the required fixes.

Do not claim that a feature works unless it has been verified.

==================================================
CRITICAL PROJECT RULES
==================================================

Do not create a new Expo project.

Do not create another React Native application.

Do not upgrade Expo SDK 54.

Do not upgrade React.

Do not upgrade React Native.

Do not migrate to another framework.

Do not replace the complete project architecture.

Do not delete working features.

Do not redesign working screens unnecessarily.

Do not recreate existing features.

Do not create duplicate:

- Routes
- Screens
- Bottom navigation
- Home pages
- Profile pages
- Authentication systems
- Firebase initialization
- Supabase clients
- API clients
- Zustand stores
- Location watchers
- SOS services
- Notification services
- AI services
- Camera services
- Guardian systems
- Fake Call systems
- Theme files

Preserve the existing:

- SafeSphereAI branding
- Neumorphism UI
- Bottom navigation
- Center SOS button
- Feature-folder architecture
- Expo Router architecture
- User experience

Make the smallest safe changes required to make existing functionality work.

==================================================
PHASE 1: INSPECT THE COMPLETE PROJECT
==================================================

Before modifying any code, inspect the complete repository.

Inspect:

- Repository root
- React Native application folder
- package.json
- package-lock.json
- node_modules compatibility
- Expo SDK version
- React version
- React Native version
- TypeScript version
- Expo Router version
- app.json
- app.config.js
- app.config.ts
- eas.json
- babel.config.js
- metro.config.js
- tailwind.config.js
- nativewind-env.d.ts
- tsconfig.json
- eslint configuration
- environment-variable files
- .env.example
- .gitignore
- README
- Existing scripts
- Existing assets
- Existing images
- Existing fonts
- Existing icons
- Existing audio files
- Existing model files
- Existing backend folder
- Existing API routes
- Existing database configuration
- Existing Firebase configuration
- Existing Supabase configuration
- Existing authentication
- Existing security rules
- Existing storage configuration
- Existing notification configuration

Inspect every folder inside:

app/

src/

features/

components/

hooks/

services/

stores/

utils/

constants/

types/

assets/

backend/

server/

functions/

Do not assume a file exists.

Use the actual project as the source of truth.

==================================================
PHASE 2: CREATE A COMPLETE FEATURE INVENTORY
==================================================

Find every existing feature automatically.

Create an internal feature inventory.

Check at minimum:

1. Splash screen

2. Onboarding

3. Sign up

4. Login

5. Logout

6. Forgot password

7. Phone OTP if implemented

8. Authentication persistence

9. Home page

10. Home real-time map

11. Current location

12. Safe Route

13. Live Tracking

14. Location sharing

15. SOS

16. Two-second SOS hold

17. Guardian connection

18. SafeSphere unique user ID

19. Guardian request

20. Guardian request acceptance

21. Trusted Contacts

22. Guardian emergency alerts

23. Emergency location sharing

24. Emergency camera evidence

25. Emergency video upload

26. Evidence Vault

27. AI Assistant

28. AI Safety Analysis

29. Safety Score

30. Fake Call

31. Online AI Fake Call

32. Offline AI Fake Call

33. Speech-to-text

34. Local AI model

35. Offline text-to-speech

36. Profile

37. Edit Profile

38. Profile image

39. Settings

40. Notifications

41. Push notifications

42. Community Safety Reports

43. Safety Timer

44. Journey tracking

45. Nearby Safe Places

46. Daily Safety Checklist

47. Safety Guide images

48. Recent Activity

49. Bottom navigation

50. Center SOS tab

Also discover and audit any additional features not listed above.

==================================================
PHASE 3: CLASSIFY EVERY FEATURE
==================================================

Classify each feature using only one verified status:

WORKING

The feature is implemented, connected and verified.

PARTIALLY WORKING

Some parts work, but important functionality is incomplete.

UI ONLY

The screen exists, but real logic/backend functionality is missing.

BROKEN

The feature exists but produces errors or does not work.

NOT IMPLEMENTED

No real implementation exists.

BLOCKED BY CONFIGURATION

Code exists but requires:

- API key
- Backend URL
- Database configuration
- Environment variable
- Provider setup
- Notification credentials

REQUIRES DEVELOPMENT BUILD

The feature cannot fully work in Expo Go and requires:

- EAS Development Build
- Custom development client
- Native module

NOT AUTOMATICALLY VERIFIABLE

The feature requires:

- Real physical device
- Camera
- Microphone
- GPS movement
- Push notification delivery
- Multiple user accounts
- External provider
- Human interaction

Do not mark a feature as WORKING only because:

- A screen renders.
- A button exists.
- TypeScript compiles.
- A function exists.
- Placeholder data appears.
- A mock response is returned.

==================================================
PHASE 4: STATIC CODE AUDIT
==================================================

Search the complete project for:

TODO

FIXME

HACK

TEMP

MOCK

DEMO

PLACEHOLDER

COMING SOON

NOT IMPLEMENTED

console.log

console.error

alert

hard-coded user data

hard-coded coordinates

hard-coded API responses

hard-coded safety scores

fake contacts

fake notifications

fake Guardian data

fake SOS success messages

fake AI responses

fake map locations

fake emergency reports

empty functions

empty catch blocks

unused imports

unused variables

duplicate code

duplicate routes

duplicate stores

duplicate API clients

duplicate location watchers

unsafe type assertions

TypeScript any

ts-ignore

eslint-disable

unhandled promises

missing cleanup functions

memory leaks

hard-coded secrets

API keys

service-account credentials

private keys

tokens

passwords

Do not delete demo data automatically if the real backend is unavailable.

Clearly label demo data.

Never present demo data as real user data.

==================================================
PHASE 5: DEPENDENCY AUDIT
==================================================

Inspect package.json.

Check:

- Expo SDK 54 compatibility
- React Native compatibility
- Expo Router compatibility
- NativeWind compatibility
- React Native Reanimated compatibility
- React Native Maps compatibility
- Expo Location compatibility
- Expo Camera compatibility
- Expo Notifications compatibility
- Expo Haptics compatibility
- Expo File System compatibility
- Async Storage compatibility
- Firebase compatibility
- Zustand compatibility
- TanStack React Query compatibility
- React Hook Form compatibility
- Zod compatibility
- React Native SVG compatibility
- Audio package compatibility

Run:

npm install

Then run:

npx expo install --check

Do not automatically upgrade Expo SDK.

Use Expo SDK 54-compatible package versions only.

If a package version is incompatible:

Fix only that package using:

npx expo install package-name

Do not use:

npm install package-name@latest

unless the package is JavaScript-only and compatibility has been verified.

Do not remove a package without checking all imports.

==================================================
PHASE 6: TYPESCRIPT AND CODE QUALITY
==================================================

Run:

npx tsc --noEmit

Fix:

- TypeScript errors
- Missing imports
- Incorrect imports
- Broken aliases
- Invalid route types
- Missing interfaces
- Unsafe null access
- Invalid component props
- Incorrect package APIs
- Invalid Expo SDK 54 APIs

Do not hide errors using:

any

@ts-ignore

@ts-nocheck

eslint-disable

unless there is a documented unavoidable third-party type issue.

Prefer proper types.

==================================================
PHASE 7: EXPO PROJECT HEALTH
==================================================

Run:

npx expo-doctor

Fix relevant issues while keeping:

Expo SDK 54

Do not upgrade to Expo SDK 55, 56, 57 or another version.

Check:

- Expo package compatibility
- Native dependencies
- Duplicate packages
- App configuration
- Metro configuration
- Babel configuration
- Expo Router entry point
- Reanimated configuration
- NativeWind configuration

After fixes:

Run:

npx expo-doctor

again.

Do not claim success unless the final result is clean or remaining warnings are clearly documented.

==================================================
PHASE 8: ROUTE AND NAVIGATION AUDIT
==================================================

Inspect every Expo Router route.

Verify:

- Every route file exports a valid default component.
- Every router.push path exists.
- Every router.replace path exists.
- Every Link href exists.
- Dynamic route parameters are valid.
- Back navigation works.
- Authentication redirects work.
- Protected routes work.
- Tab routes work.
- Nested routes work.
- Modal routes work.

Check every button that performs navigation.

Fix:

- Missing routes
- Incorrect route names
- Incorrect folder names
- Invalid typed routes
- Duplicate routes
- Broken back navigation

Do not create a new screen only to hide a navigation error.

If the intended feature does not exist:

Show a clear:

“Feature coming soon”

message instead of navigating to a nonexistent route.

==================================================
PHASE 9: BOTTOM NAVIGATION AUDIT
==================================================

Test:

- Home tab
- Live Tracking tab
- Center SOS button
- AI Assistant tab
- Profile tab

Verify:

- Correct active-tab state
- Correct icons
- Correct labels
- No duplicate bottom navigation
- No tab-bar overlap
- No content hidden behind the tab bar
- Center SOS button remains clickable
- Android safe area
- iOS safe area

Inspect whether:

position: "absolute"

is used.

If content overlaps the navbar:

Use:

useSafeAreaInsets()

Calculate bottom spacing from:

actual tab-bar height

+

insets.bottom

+

small visual gap

Do not use random large padding.

==================================================
PHASE 10: UI AND RESPONSIVENESS AUDIT
==================================================

Test every screen for:

- Small Android phones
- Medium Android phones
- Large Android phones
- iPhones
- Devices with notches
- Different safe-area sizes
- Large font sizes
- Long names
- Long email addresses
- Empty data
- Loading data
- Error states

Check:

- Text clipping
- Horizontal overflow
- Cards outside screen
- Buttons outside screen
- Keyboard covering inputs
- Bottom navbar overlap
- Images stretching
- Maps overflowing
- Modal overflow
- Incorrect absolute positioning

Fix using:

- SafeAreaView
- ScrollView
- KeyboardAvoidingView
- useSafeAreaInsets
- useWindowDimensions
- Responsive widths
- Text wrapping
- Proper bottom padding

Do not redesign working screens.

Preserve the Neumorphism UI.

==================================================
PHASE 11: AUTHENTICATION AUDIT
==================================================

Verify:

- Sign up
- Login
- Logout
- Session persistence
- Loading state
- Authentication redirect
- Invalid credentials
- Network failure
- User profile creation
- Duplicate account handling
- Password validation
- Forgot password if implemented
- Phone OTP if implemented

Do not use fake authentication.

Do not automatically log in a demo user unless clearly labelled.

Do not expose authentication tokens.

==================================================
PHASE 12: PROFILE AND UNIQUE ID AUDIT
==================================================

Verify:

- Real authenticated profile data
- Display name
- Email
- Profile image
- Edit Profile
- Profile update
- Logout
- SafeSphere unique ID

The SafeSphere ID must:

- Be unique.
- Be generated once.
- Remain stable.
- Be stored in the backend.
- Not expose the internal Firebase UID.
- Not regenerate on every render.

Verify:

- Copy ID
- Share ID
- Invalid ID handling
- Duplicate ID prevention

If backend uniqueness is missing:

Implement safe uniqueness enforcement using the existing backend.

==================================================
PHASE 13: GUARDIAN SYSTEM AUDIT
==================================================

Test using at least two test users when possible.

Verify:

User A:

→ Enters User B SafeSphere ID

→ Finds User B

→ Sends Guardian request

User B:

→ Receives request

→ Accepts or rejects request

After acceptance:

→ Guardian relationship becomes active

Verify:

- Self-connection prevention
- Invalid ID
- Nonexistent ID
- Duplicate request prevention
- Duplicate connection prevention
- Pending requests
- Accepted requests
- Rejected requests
- Guardian removal
- Blocked users
- Authorization rules

Do not automatically connect users without acceptance.

==================================================
PHASE 14: REAL-TIME LOCATION AUDIT
==================================================

Verify:

- Foreground permission
- Permission denied
- Permission blocked
- GPS disabled
- Initial location
- Real location updates
- Map marker
- Accuracy circle
- Heading
- Recenter
- Reverse geocoding
- Watcher cleanup

Do not use fake coordinates.

Do not hard-code:

Surat

Kalol

Gandhinagar

Delhi

or another location as the current location.

Check for duplicate:

Location.watchPositionAsync()

subscriptions.

Reuse one shared location service/store where appropriate.

Prevent:

- Multiple permission popups
- Memory leaks
- One-second battery-heavy updates
- Reverse geocoding on every GPS update

==================================================
PHASE 15: SAFE ROUTE AND LIVE TRACKING
==================================================

Verify:

- Real origin
- Destination search
- Route rendering
- Map markers
- Route polyline
- Navigation state
- Start journey
- Stop journey
- Live location updates
- Location sharing
- Guardian access
- End sharing

Do not show:

“Live tracking active”

unless location updates are actually running.

Do not show:

“Location shared”

unless backend sharing succeeds.

If a map provider key is missing:

Classify:

BLOCKED BY CONFIGURATION

Document the exact environment-variable name.

==================================================
PHASE 16: SOS AUDIT
==================================================

Verify the complete SOS workflow.

Required flow:

User holds SOS for 2 seconds.

If released before 2 seconds:

Cancel.

If held for complete 2 seconds:

1. Create one SOS incident.

2. Get the latest real location.

3. Update the backend.

4. Notify accepted Guardians.

5. Start emergency location updates.

6. Start evidence workflow separately if available.

Verify:

- Hold animation
- Hold cancellation
- Duplicate activation prevention
- Haptic feedback
- Loading state
- Backend success
- Backend failure
- Location success
- Location failure
- Guardian notification status
- Active SOS screen
- End SOS
- Cleanup

Do not display:

“Guardians notified”

unless notification delivery is confirmed.

Do not allow camera failure to block SOS.

==================================================
PHASE 17: CAMERA AND EMERGENCY EVIDENCE
==================================================

Verify:

- Camera permission
- Microphone permission
- Camera initialization
- Rear-camera recording
- Front-camera preference
- 15-second maximum duration
- Automatic stop
- Manual stop
- File existence
- Upload
- Upload progress
- Upload failure
- Retry
- Secure storage
- Temporary-file cleanup

Do not claim simultaneous front-and-back recording unless it is genuinely supported and tested.

If simultaneous dual-camera recording is unavailable:

Use the documented supported fallback.

Do not implement hidden recording.

Show visible recording status.

Do not block SOS when camera permission is denied.

==================================================
PHASE 18: AI ASSISTANT AUDIT
==================================================

Verify:

- AI input
- Send button
- Loading state
- AI response
- Multi-turn conversation
- Hindi
- Hinglish
- English
- Network failure
- Invalid API key
- Rate limit
- Provider quota
- Empty input
- Conversation cleanup

Do not expose AI API keys in React Native code.

Do not use:

EXPO_PUBLIC_OPENAI_API_KEY

or:

EXPO_PUBLIC_GEMINI_API_KEY

for permanent production secrets.

Use the existing secure backend.

If the backend or key is missing:

Classify:

BLOCKED BY CONFIGURATION

Do not show fake AI responses as real AI.

==================================================
PHASE 19: AI SAFETY ANALYSIS AUDIT
==================================================

Verify:

- Safety score
- Circular progress
- Category scores
- Risk breakdown
- Recommendations
- Buttons
- Navigation
- Loading state
- Error state

If values are demo values:

Display:

“Demo safety insights”

Do not claim that demo values are real AI predictions.

Verify score calculation.

Do not use random values.

==================================================
PHASE 20: ONLINE AI FAKE CALL AUDIT
==================================================

Verify:

- Fake Call setup
- Caller selection
- Language selection
- Call delay
- Incoming call
- Ringtone
- Answer
- Decline
- Active call
- Microphone
- AI connection
- Hindi conversation
- Hinglish conversation
- Multi-turn context
- Mute
- Speaker
- End Call
- Audio cleanup
- Network failure

Do not display:

“AI Connected”

unless a real AI voice session is connected.

If real-time AI requires an EAS Development Build:

Classify:

REQUIRES DEVELOPMENT BUILD

Do not pretend it works in Expo Go.

==================================================
PHASE 21: OFFLINE AI FAKE CALL AUDIT
==================================================

Verify:

- Offline speech model
- Local LLM
- Offline TTS
- Model installation
- Model file existence
- Model loading
- Hindi support
- Hinglish support
- Turn-based conversation
- Airplane mode
- Model cleanup
- Low-memory behavior

Do not claim the offline model works only because model names appear in the UI.

Verify real local inference.

If native local inference is not implemented:

Classify:

UI ONLY

or:

NOT IMPLEMENTED

Do not fake offline AI responses.

If the feature requires native modules:

Classify:

REQUIRES DEVELOPMENT BUILD

==================================================
PHASE 22: NOTIFICATION AUDIT
==================================================

Verify:

- Permission request
- Push token
- Token storage
- Guardian request notification
- SOS notification
- Notification tap
- Correct route opening
- Foreground notification
- Background notification
- Token refresh
- Invalid token cleanup

Do not send trusted emergency notifications only from the mobile frontend.

Use the existing secure backend/server.

Do not expose server notification credentials.

==================================================
PHASE 23: DATABASE AND BACKEND AUDIT
==================================================

Inspect the actual backend.

Verify:

- Database connection
- Authentication
- User profiles
- SafeSphere IDs
- Guardian requests
- Guardian connections
- SOS incidents
- Location updates
- Evidence metadata
- Notifications
- Storage
- Security rules

Check:

- Unauthorized reads
- Unauthorized writes
- Missing indexes
- Missing validation
- Missing ownership checks
- Public storage
- Public evidence URLs
- Client-trusted user IDs

Fix security issues using the existing backend.

Do not weaken security rules only to make the application work.

==================================================
PHASE 24: ENVIRONMENT VARIABLES
==================================================

Find every environment variable used by the project.

Create or update:

.env.example

Do not put real secrets inside:

.env.example

Document:

VARIABLE_NAME=

For every variable, state:

- Required or optional
- Frontend or backend
- Purpose
- Feature affected

Check for:

undefined

empty

incorrectly named

or exposed secrets.

Never commit:

- API keys
- Private keys
- Service-account files
- Database passwords
- Notification secrets

==================================================
PHASE 25: AUTOMATED TESTS
==================================================

Inspect the existing testing setup.

If tests already exist:

Run them.

Fix failing tests caused by real application bugs.

If no test setup exists:

Do not add a huge testing framework unnecessarily.

Create lightweight tests only for critical pure logic when compatible.

Prioritize tests for:

- Safety-score calculation
- SafeSphere ID validation
- Guardian request validation
- SOS state transitions
- Location accuracy classification
- Route helper functions
- Input validation

Do not pretend UI/device features are fully tested through unit tests.

==================================================
PHASE 26: BUILD VERIFICATION
==================================================

Verify:

npm install

npx tsc --noEmit

npx expo-doctor

npx expo export

Use Expo SDK 54-compatible commands.

If Android native folders exist:

Inspect them before running native commands.

Do not generate native folders unnecessarily.

Do not run destructive prebuild commands without checking project architecture.

Do not delete native changes.

==================================================
PHASE 27: AUTO-FIX RULES
==================================================

Automatically fix:

- TypeScript errors
- Broken imports
- Missing exports
- Invalid routes
- Buttons with missing actions
- Missing loading states
- Missing error states
- Missing cleanup
- Duplicate subscriptions
- Navigation errors
- Bottom-navbar overlap
- Safe-area issues
- Keyboard overlap
- Responsive-layout issues
- Invalid Expo SDK 54 APIs
- Incorrect permission handling
- Incorrect null handling
- Crashes caused by missing data
- Unhandled promise rejections
- Incorrect demo-data labels

Do not automatically invent:

- API keys
- Backend URLs
- Database credentials
- Push credentials
- Map-provider keys
- AI-provider keys
- Real user data

If external configuration is missing:

Keep the application stable.

Show a clear configuration error.

Document the required setup.

==================================================
PHASE 28: DO NOT HIDE PROBLEMS
==================================================

Do not solve errors by:

- Removing the feature
- Commenting out important code
- Returning fake success
- Adding empty catch blocks
- Using any everywhere
- Adding @ts-ignore everywhere
- Disabling TypeScript
- Disabling ESLint globally
- Removing security rules
- Making database data public
- Hard-coding fake data
- Hard-coding fake locations
- Hard-coding fake AI responses

Fix the root cause whenever possible.

==================================================
PHASE 29: MANUAL DEVICE TEST CHECKLIST
==================================================

Create a manual testing checklist for features that require a physical device.

Include:

LOCATION:

- Allow permission
- Deny permission
- Disable GPS
- Walk with the phone
- Verify marker movement
- Verify location cleanup

CAMERA:

- Allow camera
- Deny camera
- Record 15 seconds
- Stop manually
- Verify upload

MICROPHONE:

- Allow microphone
- Deny microphone
- Test Fake Call voice

SOS:

- Hold below 2 seconds
- Hold complete 2 seconds
- Verify only one incident
- Verify Guardian alert
- Verify location update
- End SOS

GUARDIAN:

- Create User A
- Create User B
- Search ID
- Send request
- Accept request
- Trigger test SOS

NOTIFICATIONS:

- Foreground
- Background
- App closed
- Tap notification

OFFLINE AI:

- Enable airplane mode
- Start offline call
- Ask Hindi question
- Verify local response

==================================================
FINAL VERIFIED REPORT
==================================================

After completing the audit and fixes, provide a detailed final report.

Create a table:

| Feature | Initial Status | Final Status | Fix Applied | Real or Demo | Expo Go Support | Development Build Required | Manual Test Required |

Include every discovered feature.

Then provide:

1. Overall project health percentage

2. Total features discovered

3. Fully working features

4. Partially working features

5. UI-only features

6. Broken features

7. Fixed features

8. Features blocked by configuration

9. Features requiring API keys

10. Features requiring backend deployment

11. Features requiring EAS Development Build

12. Features requiring a physical-device test

13. TypeScript result

14. Expo Doctor result

15. Build/export result

16. Files created

17. Files modified

18. Packages installed

19. Packages changed

20. Environment variables required

21. Security issues fixed

22. Remaining known limitations

23. Exact commands I need to run

24. Exact steps I need to complete manually

Do not report:

“All features are working”

unless every feature has actually been verified.

Use accurate statuses.

Clearly separate:

- Verified working
- Code-level verified
- Requires physical-device testing
- Requires external configuration
- Requires EAS Development Build

==================================================
FINAL REQUIREMENT
==================================================

Audit the complete existing SafeSphereAI project.

Fix every issue that can be safely fixed.

Keep:

Expo SDK 54

Do not upgrade Expo.

Do not create a new project.

Do not remove existing features.

Do not replace real functionality with mock functionality.

Do not claim success without verification.

Make the application stable, responsive, secure and as fully functional as the existing configuration allows.
# Project Documentation

## 1. Project Structure

### Root Directory
- **.env**: Stores environment variables like API keys (kept secret from git).
- **app.json**: Configuration file for Expo (app name, version, icon, etc.).
- **babel.config.js**: Configuration for Babel compiler (missing in file list but usually present/default).
- **package.json**: Lists project dependencies and scripts.
- **tsconfig.json**: Configuration for TypeScript compiler.

### /app (Screens & Routing)
- **_layout.tsx**: The main wrapper for the app; sets up providers (Auth, Theme, etc.) and navigation stack.
- **index.tsx**: The Home Screen; displays the expense list, summary, and main actions.
- **sign-in.tsx**: Login screen for existing users.
- **sign-up.tsx**: Registration screen for new users.
- **add-expense.tsx**: Screen to manually add a new expense.
- **camera.tsx**: Screen to capture receipts for OCR processing.
- **monthly-report.tsx**: Displays charts and summaries of expenses by month.
- **profile.tsx**: User profile settings, currency selection, and logout.
- **+not-found.tsx**: Fallback screen shown when a route doesn't exist.

### /components (Reusable UI)
- **ExpenseCard.tsx**: A component to display a single expense item in a list.
- **EditExpenseModal.tsx**: A modal popup for editing an existing expense.
- **BarChart.tsx**: A custom bar chart component for the monthly report.
- **CategoryFilter.tsx**: A component to filter expenses by category.

### /context (State Management)
- **AuthContext.tsx**: Manages user authentication state (login, signup, user object).
- **ExpenseContext.tsx**: Manages expense data (add, delete, update, fetch) and syncs with storage.
- **CurrencyContext.tsx**: Manages the selected currency symbol and formatting.
- **ThemeContext.tsx**: Manages light/dark mode preferences.

### /config (Configuration)
- **firebase.ts**: Initializes Firebase connection and Authentication service.

### /utils (Helper Functions)
- **storage.ts**: Handles saving and loading data from local device storage (AsyncStorage).
- **ocr.ts**: Handles image processing and communicating with Gemini API for receipt scanning.
- **currency.ts**: Defines currency types, symbols, and formatting helper functions.
- **csv.ts**: Generates CSV files for exporting expense data.

### /constants (Static Data)
- **categories.ts**: Defines the list of expense categories and their keywords.
- **colors.ts**: Defines the color palette for the application.

### /types (TypeScript Definitions)
- **expense.ts**: Defines the structure (interface) of an Expense object.
- **user.ts**: Defines the structure of a User profile.

---

## 2. Detailed Code Explanation

### 1. Configuration: `config/firebase.ts`

This file sets up the connection to the Firebase backend service.

**Step-by-Step Explanation:**

1.  **Imports**:
    -   `initializeApp`: Function to create the Firebase app instance.
    -   `getAuth`: Function to get the Authentication service instance.
2.  **Configuration Object (`firebaseConfig`)**:
    -   Contains keys like `apiKey`, `authDomain`, etc.
    -   These values are hardcoded strings (as per your latest request) to connect to your specific Firebase project "budget-buddy-pro".
3.  **App Initialization**:
    -   Checks `getApps().length === 0` to ensure we don't initialize the app twice (which would cause a crash).
    -   If not initialized, it calls `initializeApp(firebaseConfig)`.
    -   Otherwise, it uses the existing app with `getApp()`.
4.  **Auth Initialization**:
    -   `const auth = getAuth(app);`: Creates the authentication interface using the initialized app.
5.  **Exports**:
    -   Exports `auth` so other files (like `AuthContext`) can use it to log users in.
    -   Exports `app` as default.

### 2. Context: `context/AuthContext.tsx`

This file manages the user's login state throughout the app.

**Step-by-Step Explanation:**

1.  **Imports**:
    -   React hooks (`createContext`, `useState`, `useEffect`, etc.).
    -   Firebase auth functions (`createUserWithEmailAndPassword`, `signInWithEmailAndPassword`, `signOut`, `onAuthStateChanged`).
    -   `auth` from `../config/firebase`.
2.  **Types**:
    -   Defines `AuthContextType` interface: what data and functions are available to the rest of the app (e.g., `user`, `signIn`, `signUp`).
3.  **Context Creation**:
    -   `const AuthContext = createContext<AuthContextType | undefined>(undefined);`: Creates the context object.
4.  **AuthProvider Component**:
    -   This component wraps the entire app (in `_layout.tsx`) to provide auth data.
    -   **State**:
        -   `user`: Stores the current user object or `null`.
        -   `isLoading`: Boolean to show a loading spinner while checking login status.
    -   **Effect (`useEffect`)**:
        -   Runs once on mount.
        -   Calls `onAuthStateChanged(auth, ...)`: A Firebase listener that triggers whenever login state changes (login, logout, app open).
        -   Updates `user` state and sets `isLoading` to `false`.
    -   **Functions**:
        -   `signIn`: Calls Firebase's `signInWithEmailAndPassword`. Returns success or error message.
        -   `signUp`: Calls Firebase's `createUserWithEmailAndPassword`. Also updates the user's profile name.
        -   `signOut`: Calls Firebase's `signOut`.
    -   **Return**:
        -   Renders `<AuthContext.Provider>` passing all the state and functions to children.
5.  **Hook (`useAuth`)**:
    -   A helper function to easily access the context. Throws an error if used outside `AuthProvider`.

### 3. Context: `context/ExpenseContext.tsx`

This file manages the list of expenses and syncs them with storage.

**Step-by-Step Explanation:**

1.  **Imports**:
    -   React Query (`useQuery`, `useMutation`, `useQueryClient`): A powerful library for managing data fetching and caching.
    -   `storageUtils` from `../utils/storage`: Custom helpers to save/load from AsyncStorage.
    -   `useAuth`: To get the current `userId`.
2.  **ExpenseProvider Component**:
    -   **Auth Integration**: Gets `user` from `useAuth()`.
    -   **Query (`expensesQuery`)**:
        -   `queryKey: ['expenses', user?.id]`: Unique ID for this data. Changes when user changes.
        -   `queryFn`: Calls `storageUtils.getExpenses(user?.id)`. Fetches data from local storage for this specific user.
        -   `enabled: !!user?.id`: Only runs if a user is logged in.
    -   **Mutations** (Functions that change data):
        -   `addExpenseMutation`:
            -   Takes a new expense object.
            -   Generates a unique ID (`Date.now().toString()`).
            -   Adds it to the list and calls `storageUtils.saveExpenses`.
            -   `onSuccess`: Tells React Query to refresh the 'expenses' list so the UI updates immediately.
        -   `deleteExpenseMutation`: Removes an expense by ID and saves.
        -   `updateExpenseMutation`: Updates an existing expense and saves.
    -   **Return**:
        -   Provides `expenses` (the list), `isLoading`, and the action functions (`addExpense`, `deleteExpense`, etc.) to the app.

### 4. Context: `context/CurrencyContext.tsx`

Manages the selected currency (USD, INR, etc.).

**Step-by-Step Explanation:**

1.  **Imports**:
    -   `createContextHook`: A library helper to create the context and hook in one line (simpler syntax).
    -   `AsyncStorage`: To save the preference permanently.
2.  **Provider Logic**:
    -   **State**: `selectedCurrency` (default 'INR').
    -   **Load Effect**: On startup, reads `@budget_buddy_currency` from AsyncStorage and updates state.
    -   **setCurrency**: Saves the new selection to AsyncStorage and updates state.
    -   **formatCurrency**: A helper that takes a number and formats it with the correct symbol (e.g., 100 -> ₹100 or $100).
3.  **Return**:
    -   Exposes `currency` (code), `setCurrency`, and `formatCurrency`.

### 5. Utils: `utils/ocr.ts`

Handles the "Scan Receipt" functionality using Google Gemini AI.

**Step-by-Step Explanation:**

1.  **Imports**:
    -   `ImageManipulator`: To resize/compress images before sending (saves bandwidth/time).
2.  **Constants**:
    -   `GEMINI_API_KEY`: The secret key to access Google's API (hardcoded).
    -   `GEMINI_URL`: The API endpoint address.
3.  **`imageToBase64` Function**:
    -   Takes an image URI.
    -   Resizes it to max 1024px width (AI doesn't need 4K images).
    -   Compresses to JPEG 0.7 quality.
    -   Returns the base64 string (text representation of the image).
4.  **`extractReceiptData` Function**:
    -   **Prompt**: Defines a strict instruction for the AI: "You are an OCR system... return ONLY valid JSON...".
    -   **Payload**: Constructs the JSON body with the prompt and the base64 image.
    -   **Fetch**: Sends a POST request to Google Gemini API.
    -   **Parsing**:
        -   Extracts the text from the complex JSON response.
        -   Cleans up any markdown formatting (like ```json ... ```).
        -   Parses the text into a JavaScript object (`JSON.parse`).
    -   **Fallback**: If AI misses fields, it provides defaults (e.g., "Unknown Store").
    -   **Category Detection**: Calls `detectCategory` to guess the category based on the store name (e.g., "Starbucks" -> "Food").

### 6. Utils: `utils/storage.ts`

Handles saving data to the phone's internal storage.

**Step-by-Step Explanation:**

1.  **Constants**:
    -   `EXPENSES_KEY_PREFIX`: '@budget_buddy_expenses_'.
2.  **`getExpensesKey`**:
    -   Takes `userId`. Returns a unique key like `@budget_buddy_expenses_user123`. This ensures User A doesn't see User B's data.
3.  **`getExpenses`**:
    -   Reads the string from AsyncStorage using the user-specific key.
    -   Parses it from JSON string to an array of objects.
    -   Returns empty array `[]` if nothing is found.
4.  **`saveExpenses`**:
    -   Takes the array of expenses.
    -   Converts it to a JSON string (`JSON.stringify`).
    -   Writes it to AsyncStorage.

### 7. App: `app/_layout.tsx`

The entry point and "frame" of the application.

**Step-by-Step Explanation:**

1.  **Providers**:
    -   Wraps the app in multiple layers of Context Providers:
        -   `QueryClientProvider`: For React Query data fetching.
        -   `AuthProvider`: For user login state.
        -   `CurrencyProvider`: For currency settings.
        -   `ExpenseProvider`: For expense data.
        -   `ThemeProvider`: For dark/light mode.
        -   `GestureHandlerRootView`: For touch gestures (swiping).
2.  **Navigation (`Stack`)**:
    -   Defines the screens and their options (headers, titles).
    -   `screenOptions={{ headerShown: false }}`: Hides the default top bar for a custom look.
    -   Defines routes: `index` (Home), `sign-in`, `sign-up`, `add-expense`, etc.

### 8. App: `app/index.tsx` (Home Screen)

The main dashboard.

**Step-by-Step Explanation:**

1.  **Hooks**:
    -   `useAuth`: Checks if user is logged in. If not, redirects to `/sign-in`.
    -   `useExpenses`: Gets the list of expenses and the `deleteExpense` function.
    -   `useCurrency`: Gets the currency formatter.
2.  **Calculations**:
    -   `totalExpenses`: Sums up all expense amounts using `.reduce()`.
3.  **UI Structure**:
    -   **Header**: Shows "Budget Buddy" and a Profile icon (links to `/profile`).
    -   **Summary Card**: Displays the "Total Spent" with the formatted currency.
    -   **Action Buttons**:
        -   "Add Expense": Links to `/add-expense`.
        -   "Scan Receipt": Links to `/camera`.
        -   "Reports": Links to `/monthly-report`.
    -   **Recent Expenses List**:
        -   Uses `<FlatList>` to efficiently render the list of expenses.
        -   Renders each item using the `<ExpenseCard>` component.
        -   Shows "No expenses yet" if the list is empty.
    -   **Edit Modal**: Includes `<EditExpenseModal>` which is hidden by default but opens when an item is clicked.

### 9. App: `app/add-expense.tsx`

Screen to manually input data.

**Step-by-Step Explanation:**

1.  **State**:
    -   Manages local state for `amount`, `storeName`, `date`, `category`, and `notes`.
2.  **Currency Symbol**:
    -   Uses `CURRENCIES[currency].symbol` to show the correct symbol ($, ₹) next to the input.
3.  **Validation (`handleSave`)**:
    -   Checks if Amount and Store Name are filled.
    -   Checks if Amount is a valid number.
    -   Shows `Alert.alert` if invalid.
4.  **Submission**:
    -   Calls `addExpense` from context.
    -   On success, shows an alert and navigates back (`router.back()`).
5.  **UI**:
    -   Input fields for each piece of data.
    -   Category selector: Renders a grid of chips/buttons for each category.

### 10. App: `app/sign-in.tsx`

Login screen.

**Step-by-Step Explanation:**

1.  **State**:
    -   `email`, `password`, `showPassword` (toggle visibility).
2.  **Validation**:
    -   Checks if email is valid format (regex).
    -   Checks if password is not empty.
3.  **Action**:
    -   Calls `signIn(email, password)` from AuthContext.
    -   If successful, redirects to Home (`/`).
    -   If failed, sets an error message state which displays in red.
4.  **UI**:
    -   Uses `LinearGradient` for a nice green background.
    -   Inputs for Email and Password.
    -   "Sign Up" link at the bottom to switch to the registration screen.

### 11. App: `app/camera.tsx`

Camera screen for scanning receipts.

**Step-by-Step Explanation:**

1.  **Permissions**:
    -   `useCameraPermissions`: Asks user for permission to use camera. Shows a button to request if denied.
2.  **Camera View**:
    -   Uses `<CameraView>` from Expo.
    -   Shows a "Take Picture" button.
3.  **Capture Logic (`takePicture`)**:
    -   Calls `cameraRef.current.takePictureAsync()`.
    -   Pauses the camera preview.
    -   Calls `extractReceiptData(uri)` (the OCR utility).
4.  **Processing State**:
    -   Shows a loading indicator while OCR is running.
5.  **Result Handling**:
    -   Once OCR finishes, it redirects to `/add-expense` with the extracted data (amount, store, date) pre-filled as parameters.

### 12. App: `app/sign-up.tsx`

Registration screen for new users.

**Step-by-Step Explanation:**

1.  **State**:
    -   `name`, `email`, `password`, `confirmPassword`.
    -   `passwordStrength`: Calculates how strong the password is (length, numbers, special chars).
2.  **Validation**:
    -   Checks if passwords match.
    -   Checks if password meets strength requirements.
3.  **Action**:
    -   Calls `signUp(email, password, name)` from AuthContext.
    -   On success, automatically logs in and goes to Home.
4.  **UI**:
    -   Similar to Sign In but with extra fields.
    -   Shows a password strength bar (Red/Yellow/Green) dynamically.

### 13. App: `app/monthly-report.tsx`

Visualizes spending habits.

**Step-by-Step Explanation:**

1.  **Data Fetching**:
    -   `getMonthlyData()`: A helper from ExpenseContext that groups all expenses by month and then by category.
2.  **Current Month Logic**:
    -   `currentMonthData = monthlyData[0]`: Gets the most recent month.
    -   If no data, shows "No data available" empty state.
3.  **Chart Data Preparation**:
    -   Filters out categories with 0 spending.
    -   Calculates percentage for each category.
    -   Sorts by highest amount first.
4.  **UI**:
    -   **Total Card**: Big green card showing total spent this month.
    -   **Bar Chart**: Renders `<BarChart>` component.
    -   **Category List**: Lists each category with amount and percentage.
    -   **History**: Shows a simple list of previous months' totals.

### 14. App: `app/profile.tsx`

Settings and User Account management.

**Step-by-Step Explanation:**

1.  **Contexts**:
    -   Uses `AuthContext` (for user info, logout).
    -   Uses `ThemeContext` (to switch dark/light mode).
    -   Uses `CurrencyContext` (to change currency).
2.  **Theme Selector**:
    -   Three buttons: Light, Dark, System.
    -   Updates the global theme state when clicked.
3.  **Currency Picker**:
    -   Opens a `<Modal>` with a list of all currencies.
    -   When selected, updates the global currency preference.
4.  **Logout**:
    -   Shows a confirmation alert (`Alert.alert`) before logging out to prevent accidental clicks.

### 15. Component: `components/BarChart.tsx`

Custom chart to visualize data.

**Step-by-Step Explanation:**

1.  **Props**:
    -   Receives `data` (array of category, amount, percentage).
2.  **Calculation**:
    -   Finds `maxAmount` to scale the bars correctly.
    -   `barHeight = (amount / maxAmount) * CHART_HEIGHT`: Calculates pixel height relative to the tallest bar.
3.  **Rendering**:
    -   Maps through data and renders a vertical bar for each category.
    -   Sets background color based on the category color mapping.
    -   Shows the amount on top and category name below.

### 16. Component: `components/ExpenseCard.tsx`

Displays a single expense row.

**Step-by-Step Explanation:**

1.  **Props**:
    -   Receives `expense` object, `onEdit`, and `onDelete` functions.
2.  **UI**:
    -   **Icon**: Shows a category-specific icon (e.g., Shopping Bag for "Shopping").
    -   **Details**: Store name, date, and notes.
    -   **Amount**: Formatted currency on the right.
    -   **Actions**: Edit (Pencil) and Delete (Trash) buttons.

### 17. Component: `components/EditExpenseModal.tsx`

Popup form to modify an expense.

**Step-by-Step Explanation:**

1.  **Props**:
    -   `visible`: Controls if modal is shown.
    -   `expense`: The expense object to edit.
2.  **State**:
    -   Pre-fills the form state (`amount`, `store`, etc.) with the `expense` data when opened.
3.  **Save Logic**:
    -   Similar validation to Add Expense screen.
    -   Calls `updateExpenseMutation` to save changes.
    -   Closes modal on success.

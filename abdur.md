# 📘 Budget Buddy Pro - Project Guide

Welcome to **Budget Buddy Pro**! This is a mobile app that helps people track their money. You can add expenses manually or scan a receipt with the camera.

---

## 1. Project Overview & Structure 🏗️

### **What does this app do?**
-   **Track Money**: You can write down what you bought and how much it cost.
-   **Scan Receipts**: You can take a photo of a receipt, and the app uses "magic" (AI) to read the price and store name for you!
-   **See Reports**: It shows you a chart of where your money is going.
-   **Save Data**: It saves your data on your phone so it's there when you come back.

### **Project Tree 🌳**
Here are the important folders and files:

```text
BUDJET BUDDY PRO
├── app/                      <-- 📱 The Screens (Pages) of the app
│   ├── _layout.tsx           <-- 🚪 Main Entry: Sets up the "rules" and navigation
│   ├── index.tsx             <-- 🏠 Home Screen: The first thing you see
│   ├── add-expense.tsx       <-- ➕ Add Screen: Form to add a new expense
│   ├── camera.tsx            <-- 📸 Camera Screen: To take photos of receipts
│   ├── sign-in.tsx           <-- 🔐 Sign In: Login page
│   └── sign-up.tsx           <-- 📝 Sign Up: Register page
├── components/               <-- 🧩 Small building blocks (like charts)
├── context/                  <-- 🧠 The "Brain": Holds data for the whole app
│   ├── AuthContext.tsx       <-- 👤 Handles User Login info
│   └── ExpenseContext.tsx    <-- 💸 Handles the List of Expenses
├── utils/                    <-- 🛠️ Helper Tools
│   ├── storage.ts            <-- 💾 Saves data to the phone's memory
│   └── ocr.ts                <-- 🤖 AI Tool: Reads text from images
└── config/
    └── firebase.ts           <-- 🔥 Connects to Google Firebase (for login)
```

### **Key Files Explained**
-   **`app/_layout.tsx`**: The **Main Entry**. It wraps the whole app in "Providers" (like giving the app a brain) and sets up the navigation (how to move between screens).
-   **`app/index.tsx`**: The **Home Screen**. It shows your list of expenses and the total money spent this month.
-   **`context/AuthContext.tsx`**: Handles **Login**. It checks if you are signed in and remembers you.
-   **`context/ExpenseContext.tsx`**: Handles **Data**. It allows you to add, delete, or change expenses.
-   **`utils/ocr.ts`**: The **AI Reader**. It sends receipt photos to Google Gemini to read the text.

---

## 2. Detailed Explanations (Simple English) 🧸

Here we explain the code step-by-step, like a story.

### **Concepts to Know First:**
-   **State (`useState`)**: Think of this as the component's **short-term memory**. If `state` changes, the screen updates to show the new info.
-   **Props**: Like passing a **note** from a parent to a child. "Here, take this data and show it."
-   **Context (`useContext`)**: Like a **loudspeaker**. It broadcasts data (like "User is logged in!") to the whole app so any screen can hear it.
-   **Effect (`useEffect`)**: A **robot** that runs when something happens. "When the app starts, load the data."
-   **AsyncStorage**: A **notebook** inside the phone. Even if you close the app, what we write here stays written.

---

### 📂 `app/_layout.tsx` (The Setup)
This file is the "wrapper" for everything.

1.  **Imports**: We bring in tools we need.
    ```typescript
    import { AuthProvider } from '@/context/AuthContext';
    // ... other providers
    ```
    *   *Why?* We need to import the "Brains" (Contexts) to give them to the app.

2.  **`RootLayout` Function**:
    ```typescript
    export default function RootLayout() {
      return (
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <CurrencyProvider>
              <ExpenseProvider>
                 <Stack> ... </Stack>
              </ExpenseProvider>
            </CurrencyProvider>
          </AuthProvider>
        </QueryClientProvider>
      );
    }
    ```
    *   *What is this?* This is the **Sandwich**.
    *   We wrap the `<Stack>` (the screens) inside all these Providers.
    *   **`AuthProvider`**: "Hey app, listen to user login info!"
    *   **`ExpenseProvider`**: "Hey app, listen to the expense list!"
    *   **`Stack`**: This is the navigation system. It stacks screens on top of each other like cards.

---

### 📂 `app/index.tsx` (The Home Screen)
This is where the user lands.

1.  **Getting Data**:
    ```typescript
    const { expenses, deleteExpense } = useExpenses();
    const { currency } = useCurrency();
    ```
    *   *What is this?* We are using **Hooks** to grab data from the "Brain" (Context).
    *   We ask: "Give me the list of expenses" and "What currency are we using?"

2.  **`FlatList` (The List)**:
    ```typescript
    <FlatList
        data={currentExpenses}
        renderItem={renderExpenseItem}
        keyExtractor={(item) => item.id}
    />
    ```
    *   *What is this?* A scrolling list.
    *   **`data`**: The list of items to show.
    *   **`renderItem`**: A function that says "For every item in the list, draw this box."

3.  **Navigation Buttons**:
    ```typescript
    <TouchableOpacity onPress={() => router.push('/add-expense')}>
        <Plus color="#fff" />
    </TouchableOpacity>
    ```
    *   *What is this?* A button.
    *   **`onPress`**: "When I touch this..."
    *   **`router.push('/add-expense')`**: "...go to the 'Add Expense' screen."

---

### 📂 `context/ExpenseContext.tsx` (The Expense Brain)
This file manages the list of expenses.

1.  **`useQuery` (Fetching Data)**:
    ```typescript
    const expensesQuery = useQuery({
      queryKey: ['expenses', user?.id],
      queryFn: () => storageUtils.getExpenses(user?.id),
    });
    ```
    *   *What is this?* A smart tool that fetches data.
    *   It asks `storageUtils` to "Go get the expenses from the phone's notebook for this user."

2.  **`addExpenseMutation` (Adding Data)**:
    ```typescript
    const addExpenseMutation = useMutation({
      mutationFn: async (expense) => {
        // ... create new expense object
        await storageUtils.saveExpenses(updated, user.id);
      }
    });
    ```
    *   *What is this?* A function to **change** data.
    *   When we add an expense, it:
        1.  Creates a new expense object.
        2.  Adds it to the list.
        3.  **Saves it to the phone** (`storageUtils.saveExpenses`).

---

### 📂 `utils/storage.ts` (The Notebook)
This file talks to the phone's hard drive.

1.  **`AsyncStorage`**:
    ```typescript
    import AsyncStorage from '@react-native-async-storage/async-storage';
    ```
    *   *What is this?* The tool provided by React Native to save simple data permanently.

2.  **`saveExpenses`**:
    ```typescript
    await AsyncStorage.setItem(key, JSON.stringify(expenses));
    ```
    *   *What is this?*
    *   **`JSON.stringify`**: Turns the list of objects into a long text string (because AsyncStorage only understands text).
    *   **`setItem`**: Writes that text into the "notebook" under a specific name (`key`).

---

### 📂 `utils/ocr.ts` (The Magic Eye)
This file handles the receipt scanning.

1.  **`extractReceiptData`**:
    ```typescript
    const response = await fetch(GEMINI_URL, { ... });
    ```
    *   *What is this?* It sends the photo to **Google Gemini** (a smart AI).
    *   It asks Gemini: "Look at this picture and tell me the total amount, the store name, and the date."

2.  **Parsing the Answer**:
    ```typescript
    const result = await response.json();
    // ... clean up text ...
    return JSON.parse(textResponse);
    ```
    *   *What is this?* Gemini sends back a text message. We clean it up and turn it into a Javascript Object that our app can understand.

---

### 📂 `app/sign-in.tsx` & `app/sign-up.tsx` (The Doorway 🔐)
These are the screens where you log in or create a new account.

1.  **`useAuth` Hook**:
    ```typescript
    const { signIn, signUp } = useAuth();
    ```
    *   *What is this?* We grab the "keys" to the app from the Auth Context.
    *   **`signIn`**: A function to check your password and let you in.
    *   **`signUp`**: A function to create a new user for you.

2.  **`TextInput` (Typing Boxes)**:
    ```typescript
    <TextInput
        placeholder="Enter your email"
        onChangeText={setEmail}
        secureTextEntry={!showPassword}
    />
    ```
    *   *What is this?* A box where you can type.
    *   **`onChangeText`**: Every time you type a letter, it updates the `state` (memory) with the new text.
    *   **`secureTextEntry`**: Turns your password into dots (••••••) so no one can see it.

3.  **Validation (Checking Rules)**:
    *   Before we let you in, we check: "Did you type an email?", "Is the password long enough?".
    *   If not, we show an `Alert` (a pop-up message).

---

### 📂 `app/profile.tsx` (Your Settings ⚙️)
This is where you change how the app looks and works.

1.  **`useTheme` (Dark Mode)**:
    ```typescript
    const { theme, setTheme } = useTheme();
    ```
    *   *What is this?* It controls the colors.
    *   You can pick "Light" (bright like day) or "Dark" (cool like night). When you click the moon icon, it tells the whole app to switch colors.

2.  **`useCurrency` (Money Symbols)**:
    ```typescript
    const { setCurrency } = useCurrency();
    ```
    *   *What is this?* If you live in Europe, you want `€`. If in USA, `$`.
    *   This saves your choice so all numbers show the right symbol.

3.  **`signOut` (Leaving)**:
    ```typescript
    const handleSignOut = async () => {
        await signOut();
        router.replace('/sign-in');
    };
    ```
    *   *What is this?* It wipes your login info from the phone's memory and sends you back to the login screen.

---

### 📂 `app/monthly-report.tsx` (The Scoreboard 📊)
This screen shows you how much you spent.

1.  **`getMonthlyData` (Math Time)**:
    ```typescript
    const monthlyData = getMonthlyData();
    ```
    *   *What is this?* It asks the Expense Context to do some math.
    *   It groups all your expenses by month (e.g., "January", "February") and adds them up.

2.  **`BarChart` (The Picture)**:
    ```typescript
    <BarChart data={categoryData} />
    ```
    *   *What is this?* It draws a picture of your spending.
    *   It takes the numbers (like "Food: $50", "Travel: $20") and draws bars so you can easily see where your money went.

---

## 3. Navigation & Data Flow 🔄

### **How do I move around? (Navigation)**
1.  **Start**: You open the app.
2.  **Check**: `_layout.tsx` checks if you are logged in.
    *   **No?** -> Go to `sign-in.tsx`.
    *   **Yes?** -> Go to `index.tsx` (Home).
3.  **Home**: From Home, you can click buttons at the bottom:
    *   **"Add"** -> Opens `add-expense.tsx`.
    *   **"Scan"** -> Opens `camera.tsx`.
    *   **"Report"** -> Opens `monthly-report.tsx`.

### **How does data move? (Data Flow)**

**Example: Adding a Coffee Expense ☕**

1.  **User Action**: You tap "Add", type "Coffee", "$5", and click "Save".
2.  **Screen (`add-expense.tsx`)**: Calls the function `addExpense()` from the Context.
3.  **Context (`ExpenseContext.tsx`)**:
    *   Takes the new "Coffee" data.
    *   Adds it to the existing list.
    *   **Saves** the new list to `AsyncStorage` (so it's safe).
4.  **Update**: The Context tells the **Home Screen** (`index.tsx`): "Hey! The list changed!"
5.  **Home Screen**: Automatically re-draws itself to show the new "Coffee" expense in the list.

---

**That's it!** The app is just a loop of:
1.  **User does something** (clicks, types).
2.  **App updates data** (in Context).
3.  **App saves data** (to Storage).
4.  **Screens update** to show the new data.

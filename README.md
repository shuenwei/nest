# Nest - Splitting Bills With Friends, Now Simplified

Nest is a mobile-first progressive web application (PWA) designed to simplify the process of splitting bills with friends. It is designed to be used in mobile browsers, or can be installed on the device as a PWA for a more app-like experience with greater convenience.

**Try it now at [nest.shuenwei.dev](https://nest.shuenwei.dev)!**

---

## ❓ What Is Different About Nest?

Most existing bill-splitting apps, like Splitwise, only support equal splits, percentage splits, or fixed amounts. However, these options fail to simplify complex splitting processes such as splitting restaurant bills, where each person orders different items with varying prices, and thus incurring different amounts of GST, service charges, and discounts. As a result, users currently need to manually calculate each person’s share with a calculator before entering it into the app.

Nest automates this process:
- For each item, select the friends who consumed it.
- Nest automatically calculates their share, including GST, service charge and discounts.

Additionally, current applications lack currency conversion functionalities. Nest utilises a real-time exchange rate API (aligned closely with fee-less Mastercard/Visa travel card rates) to convert foreign currencies to Singapore Dollars, making it possible for settle-ups to be done via PayNow.

---

## 🔑 Key Features

### 1. Split Purchase  
Split simple expenses, similar to existing bill-splitting apps.

### 2. Split Restaurant Bills  
Users can enter receipt details manually, or upload an image of their receipt to the application to be scanned using Azure Document Intelligence API. If the receipt is in a foreign language, the user can translate the receipt‘s details into English using Google Cloud Translate API. The user will then select who consumed each item to automatically calculate the correct split, including GST, service charges, and discounts.

### 3. Split Recurring Transactions  
Track and automate recurring shared expenses like Spotify, Netflix, or YouTube Family subscriptions.

### 4. Settle Up  
Record transfers and payments between friends, even in foreign currencies.

### 5. Currency Conversion  
All Nest transactions support foreign currencies. Nest automatically converts them to Singapore Dollars using real-time exchange rates close to Mastercard/Visa travel card rates.

### 6. Telegram Integration  
All users on Nest are linked to their Telegram accounts via the Telegram bot API, allowing for transaction notifications via the Nest Telegram bot. This also allows for users to split bills with users who are not yet a Nest user just by entering their friend’s Telegram username. If the friend would like to view their detailed transaction history, they can register as a user on Nest. They will then be able to view all transactions associated with their Telegram username.

### 7. Offline Support  
The web app stores all assets and transaction data locally on the device, allowing the user to view past transactions offline and reduce loading times in cities where internet connectivity is slow or limited. However, adding and editing of transactions currently requires an active internet connection.

---

## 🛠️ Future Improvements

- **Selectable Home Currency**: Allow users to select a home currency to support non-Singaporean app users. Currently, the app settles all transactions in Singapore Dollars which cannot be changed.
- **Shareable Bill Split Pages**: Introduce shareable restaurant bill split pages which allow users part of the bill to self-select the items they consumed via a shared link, instead of requiring the payer to do it all, simplifying the bill split process.
- **Improved Offline Support**: Allow users to add and edit transactions offline, queuing them for upload upon an active internet connection.

---

## 📱 Technology Stack

**Frontend:**  
- React  
- TypeScript  
- Vite  
- Deployed on Vercel

**Backend:**  
- Node.js  
- Express.js  
- MongoDB  
- Deployed on Google Cloud Run

**APIs Used:**  
- Azure Document Intelligence for receipt scanning
- Google Cloud Translate for receipt translation
- Telegram Bot API for user authentication and transaction notifications

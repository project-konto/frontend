# KontoFrontend

A personal finance management web app built with Next.js and TypeScript

## Overview

KontoFrontend is a client application for managing your personal finances, featuring:

- Secure user authentication and session handling
- Dashboard with budget and transaction tracking
- Management of incomes, expenses, and transfers
- Visualizations and summary charts
- Bank statement import

## Tech Stack

- **Next.js** - React framework for server-side rendering and routing
- **TypeScript** - Static typing
- **React** - UI library
- **Redux Toolkit** - State management
- **Tailwind CSS** - UI styling

## Project Structure

TODO

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- [KontoApi](https://github.com/project-konto/backend) backend running

### Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/project-konto/frontend.git
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env.local` file in the project root and set the API endpoint:

   ```bash
   NEXT_PUBLIC_API_BASE_URL=http://localhost:5001
   ```

### Run

```bash
npm run dev
```

The app will be available at `http://localhost:3000` by default.

### Test

TODO

## API Endpoints

This frontend interacts with the [KontoApi](https://github.com/project-konto/backend). See the corresponding API documentation.

## Contributing

TODO

## License

Apache 2.0, see [LICENSE](LICENSE) for details

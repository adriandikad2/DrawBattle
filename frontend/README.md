# DrawBattle Frontend

This is the frontend application for DrawBattle, a multiplayer drawing and voting game.

## Environment Setup

Create a `.env` file with the following variables:

```
VITE_API_URL=https://drawbattle-sbd-be.vercel.app/api
VITE_CLOUDINARY_CLOUD_NAME=drawingbattle
```

For local development, use:
```
VITE_API_URL=http://localhost:5000/api
```

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

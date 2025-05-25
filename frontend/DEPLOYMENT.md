# Frontend Deployment to Vercel

This document provides instructions for deploying the frontend to Vercel and connecting it to the backend API.

## Setup Environment Variables

Make sure to set up the following environment variables in Vercel's deployment settings:

- `VITE_API_URL`: https://drawbattle-sbd-be.vercel.app/api
- `VITE_CLOUDINARY_CLOUD_NAME`: drawingbattle

## Deployment Steps

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set the root directory to `frontend`
4. Configure the build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add the environment variables mentioned above
6. Deploy

## CORS Configuration

If you encounter CORS issues, make sure the backend is properly configured to accept requests from your frontend domain.

## Testing

After deployment:
1. Test user authentication
2. Test room creation and joining
3. Verify all game functionalities work properly

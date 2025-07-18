# Deploy Instructions for ZenPress

## Web Deploy (Netlify + Railway)

### Frontend (Netlify)
1. Connect your GitHub repository to Netlify
2. Build settings:
   - Build command: `npm run build`
   - Publish directory: `build`
   - Environment variables:
     - `REACT_APP_BACKEND_URL`: [Your Railway backend URL]

### Backend (Railway)
1. Connect your GitHub repository to Railway
2. Environment variables:
   - `MONGO_URL`: [MongoDB Atlas connection string]
   - `JWT_SECRET`: [Your JWT secret]
   - `STRIPE_API_KEY`: [Your Stripe key]
   - `PIX_KEY`: [Your PIX key]
   - `CORS_ORIGINS`: [Your Netlify frontend URL]

## Mobile Deploy (Expo)

### Build APK
1. `cd /app/ZenPressExpo`
2. `expo build:android`
3. Upload to Google Play Console

### Google Play Console
1. Create new app
2. Upload APK to Internal Testing
3. Add test users
4. Publish for testing

## Post-Deploy Steps
1. Update CORS origins
2. Test all payment flows
3. Verify all API endpoints
4. Test mobile responsiveness
5. Verify multi-language support
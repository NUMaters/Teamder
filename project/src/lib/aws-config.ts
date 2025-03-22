import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.EXPO_PUBLIC_USER_POOL_ID as string,
      userPoolClientId: process.env.EXPO_PUBLIC_USER_POOL_CLIENT_ID as string,
      signUpVerificationMethod: 'code',
    }
  }
}); 
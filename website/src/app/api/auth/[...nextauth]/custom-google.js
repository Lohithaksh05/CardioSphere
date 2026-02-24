//api/auth/[...nextauth]/custom-google.js
export default {
  id: "google",
  name: "Google",
  scope: "email profile openid https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  authorizationUrl: "https://accounts.google.com/o/oauth2/auth?prompt=select_account",
  profileUrl: "https://www.googleapis.com/oauth2/v3/userinfo",
  profile(profile) {
    return {
      id: profile.sub,
      name: profile.name,
      email: profile.email,
      image: profile.picture,
    };
  },
};

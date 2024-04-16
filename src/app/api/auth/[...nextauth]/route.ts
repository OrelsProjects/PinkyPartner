import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_AUTH_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET as string,
    }),
  ],
  session: {
    strategy: "jwt", // This is the default value
  },
  callbacks: {
    async session({ session }: { session: any }) {
      // if (!session.user.bla) {
      //   console.log('add bla');
      //   session.user.bla = 'new';
      //   session.user.another = '21';
      // }
      return session;
    },
    async signIn(user: any) {
      try {
        // Fetch additional user data from your database based on email
        console.log("email ", user.user.email);
        // const res = await getDocs(
        //   query(volunteersCol, where("email", "==", user.user.email), limit(1))
        // );
        let additionalUserData = {};
        // if (res.docs.length > 0) {
        //   additionalUserData = { ...res.docs[0].data(), id: res.docs[0].id };
        // }
        // console.log(additionalUserData);

        // Merge additional data into the user object
        return {
          ...user,
          ...additionalUserData,
          // redirect: '/profile',
        };
      } catch (e) {
        console.log(e);
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

import { AuthOptions, Session } from "next-auth";
import { AdapterUser } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import prisma from "./app/api/_db/db";
import { hash } from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { InvalidCredentialsError } from "./models/errors/InvalidCredentialsError";
import { UnknownUserError } from "./models/errors/UnknownUserError";
import UserAlreadyExistsError from "./models/errors/UserAlreadyExistsError";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_AUTH_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET as string,
    }),
    AppleProvider({
      clientId: process.env.APPLE_ID as string,
      clientSecret: process.env.APPLE_SECRET as string,
    }),
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: "Credentials",
      // `credentials` is used to generate a form on the sign in page.
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        displayName: { label: "Display Name", type: "text" },
        isSignIn: { label: "Sign In", type: "hidden", value: "true" },
      },
      async authorize(credentials, req) {
        if (!credentials) {
          throw new Error("Unknown errror");
        }

        const hashedPassword = await hash(credentials.password, 10);

        const user = await prisma.appUser.findFirst({
          where: {
            email: credentials.email,
          },
        });
        if (credentials.isSignIn === "true") {
          if (user) {
            const isValid = hashedPassword === user.password;
            if (!isValid) {
              throw new InvalidCredentialsError();
            }
            return user;
          } else {
            throw new UnknownUserError();
          }
        } else {
          if (user) {
            throw new UserAlreadyExistsError();
          }
          try {
            const newUser = await prisma.appUser.create({
              data: {
                displayName: credentials.displayName,
                email: credentials.email,
                password: hashedPassword,
                userId: uuidv4(),
              },
            });
            // set userId to be newUser.userId
            await prisma.appUser.update({
              where: {
                email: credentials.email,
              },
              data: {
                userId: newUser.id,
              },
            });
            return newUser;
          } catch (e) {
            console.log(e);
            throw e;
          }
        }
      },
    }),
  ],
  session: {
    strategy: "jwt", // This is the default value
  },
  callbacks: {
    async session({
      session,
      token,
      user,
    }: {
      session: Session;
      token: JWT;
      user: AdapterUser;
    }) {
      const isUserInDB = await prisma.appUser.findFirst({
        where: {
          userId: token.sub,
        },
        select: {
          userId: true,
        },
      });

      if (!isUserInDB) {
        throw new UnknownUserError();
      }
      if (session?.user) {
        session.user.userId = token.sub;
      }
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

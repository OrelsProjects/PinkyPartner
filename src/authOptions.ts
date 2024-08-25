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
import { generateReferalCode } from "./app/api/_utils/referralCode";
import { cookies } from "next/headers";
import loggerServer from "./loggerServer";
import { ReferralOptions } from "global";
import { createWeeksContractObligations } from "./app/api/contract/_utils/contractUtils";
import { MAX_PARTICIPANTS_IN_CONTRACT } from "./lib/utils";

const getName = (name?: string, email?: string) => {
  if (name) {
    return name;
  }
  // if it's a private apple email, we can't get the name, then we set a default name: RandomPinky[0-9]{4}
  if (email?.includes("privaterelay.appleid.com")) {
    return "RandomPinky" + Math.floor(Math.random() * 10000);
  }
  return email?.split("@")?.[0] || "";
};

const getReferralOptions = (): ReferralOptions => {
  const referralCode = cookies().get("referralCode")?.value;
  const contractId = cookies().get("contractId")?.value;
  return {
    referralCode,
    contractId,
  };
};

const clearReferralCode = () => {
  cookies().set("referralCode", "", {
    expires: new Date(0),
  });
};

const clearContractId = () => {
  cookies().set("contractId", "", {
    expires: new Date(0),
  });
};

export const createNewUserContract = async (userId: string, contractId: string) => {
  const currentUserContracts = await prisma.userContract.findMany({
    where: {
      contractId,
    },
  });
  if (currentUserContracts.length >= MAX_PARTICIPANTS_IN_CONTRACT) {
    return;
  }

  const existingUserContract = await prisma.userContract.findFirst({
    where: {
      userId,
      contractId,
    },
  });

  if (existingUserContract) {
    return;
  }

  const { contract } = await prisma.userContract.create({
    data: {
      userId,
      contractId,
      optOutOn: null,
    },
    include: {
      contract: true,
    },
  });
  const contractObligations = await prisma.contractObligation.findMany({
    where: {
      contractId,
    },
    include: {
      obligation: true,
    },
  });

  await createWeeksContractObligations(
    contractObligations.map(({ obligation }) => obligation),
    contract,
    [userId],
  );
};

export const authOptions: AuthOptions = {
  cookies: {
    csrfToken: {
      name: "next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "none",
        path: "/",
        secure: true,
      },
    },
    pkceCodeVerifier: {
      name: "next-auth.pkce.code_verifier",
      options: {
        httpOnly: true,
        sameSite: "none",
        path: "/",
        secure: true,
      },
    },
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_AUTH_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET as string,
    }),
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID as string,
      clientSecret: process.env.APPLE_CLIENT_SECRET as string,
      async profile(profile, tokens) {
        // Here's the data that we'll get from Apple, using the response_mode: "form_post".
        const data = {
          iss: profile.iss,
          aud: profile.aud,
          exp: profile.exp,
          iat: profile.iat,
          sub: profile.sub,
          at_hash: profile.at_hash,
          email: profile.email,
          email_verified: profile.email_verified,
          is_private_email: profile.is_private_email,
          auth_time: profile.auth_time,
          nonce_supported: profile.nonce_supported,
          nonce: profile.nonce,
          name: profile.name,
          picture: profile.picture,
          emailName: profile.emailName,
          emailVerified: profile.emailVerified,
          isPrivateEmail: profile.isPrivateEmail,
          authTime: profile.authTime,
          nonceSupported: profile.nonceSupported,
        };

        loggerServer.info("Apple profile", profile.sub, {
          data: {
            profile: JSON.stringify(profile),
            tokens: JSON.stringify(tokens),
            data: JSON.stringify(data),
          },
        });

        return {
          id: profile.sub,
          name: profile.name?.firstName || profile.name?.lastName,
          email: profile.email,
          image: profile.picture,
        };
      },
      authorization: {
        params: {
          response_mode: "form_post", // this means that the response will be sent as a form post instead of a JSON response, so in order to get the user data we need to parse the body. We'll do it in the profile function
          // include in scope the email, first and last name
          scope: "name email",
          redirect_uri: "https://www.pinkypartner.com/api/auth/callback/apple",
        },
      },
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
        referralCode: { label: "Referred by", type: "text" },
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
                displayName: getName(
                  credentials.displayName,
                  credentials.email,
                ),
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
            const data: {
              userId: string;
              referralCode: string;
              options?: ReferralOptions;
            } = {
              userId: newUser.id,
              referralCode: generateReferalCode(newUser.id),
            };

            const referralOptions: ReferralOptions = getReferralOptions();
            data.options = referralOptions;

            const appUserMetadata = await prisma.appUserMetadata.create({
              data,
            });
            clearReferralCode();
            return { ...newUser, meta: appUserMetadata };
          } catch (e: any) {
            loggerServer.error("Error creating user", "new_user", { error: e });
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
      try {
        let userInDB = await prisma.appUser.findFirst({
          where: {
            userId: token.sub,
          },
          include: {
            meta: true,
            settings: true,
          },
        });
        if (session?.user) {
          if (
            session?.user.image &&
            session.user.image !== userInDB?.photoURL
          ) {
            await prisma.appUser.update({
              where: {
                userId: token.sub,
              },
              data: {
                photoURL: session.user.image,
              },
            });
            session.user.name =
              userInDB?.displayName || session.user.name || "Random Pinky";
          }

          if (!session.user.meta) {
            session.user.meta = {
              referralCode: "",
              pushToken: "",
            };
          }
          session.user.userId = token.sub!;
          session.user.meta = {
            referralCode: userInDB?.meta?.referralCode || "",
            pushToken: userInDB?.meta?.pushToken || "",
            onboardingCompleted: userInDB?.meta?.onboardingCompleted || false,
          };
          session.user.settings = userInDB?.settings || {
            showNotifications: true,
            soundEffects: true,
          };
        }

        if (!session.user.meta.referralCode) {
          try {
            const referralCode = generateReferalCode(session.user.userId);
            await prisma.appUserMetadata.update({
              where: {
                userId: token.sub,
              },
              data: {
                referralCode,
              },
            });
            session.user.meta.referralCode = referralCode;
          } catch (e: any) {
            loggerServer.error(
              "Error updating referral code",
              session.user.userId,
              {
                error: e,
              },
            );
          }
        }

        const referralOptions: ReferralOptions = getReferralOptions();
        if (referralOptions.contractId) {
          await createNewUserContract(
            session.user.userId,
            referralOptions.contractId,
          );
          clearContractId();
        }
        return session;
      } catch (e: any) {
        loggerServer.error("Error creating user", "new_user", { error: e });
        return session;
      }
    },
    async signIn(session: any) {
      try {
        loggerServer.info("Sign in", session.user.id, {
          data: {
            session: JSON.stringify(session),
          },
        });
        let additionalUserData = {};
        let userInDB = await prisma.appUser.findFirst({
          where: {
            userId: session.user.id,
          },
          include: {
            meta: true,
          },
        });

        if (!userInDB) {
          const referralOptions: ReferralOptions = getReferralOptions();
          const newUser = await prisma.appUser.create({
            data: {
              userId: session.user.id,
              email: session.user.email || "",
              photoURL: session.user.image || "",
              displayName: getName(session.user.name, session.user.email),
              meta: {
                create: {
                  referredBy: referralOptions.referralCode,
                  referralCode: generateReferalCode(session.user.id),
                },
              },
              settings: {
                create: {
                  showNotifications: true,
                  soundEffects: true,
                },
              },
            },
          });
          additionalUserData = { ...newUser };
          clearReferralCode();
        }

        return {
          ...session,
          ...additionalUserData,
        };
      } catch (e: any) {
        loggerServer.error("Error signing in", session.user.id, { error: e });
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

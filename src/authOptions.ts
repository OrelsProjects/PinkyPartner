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

const createNewUserContract = async (userId: string, contractId: string) => {
  const currentUserContracts = await prisma.contract.findMany({
    where: {
      contractId,
    },
  });
  if (currentUserContracts.length > 1) {
    return;
  }
  const { contract } = await prisma.userContract.create({
    data: {
      userId,
      contractId,
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
      authorization: {
        params: {
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
      loggerServer.info("Session", session.user.userId, {
        data: {
          session: JSON.stringify(session),
          token: JSON.stringify(token),
          user: JSON.stringify(user),
        },
      });
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
        if (session?.user.image !== userInDB?.photoURL) {
          await prisma.appUser.update({
            where: {
              userId: token.sub,
            },
            data: {
              photoURL: session.user.image,
            },
          });
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
      }
      clearContractId();
      return session;
    },
    async signIn(session: any) {
      try {
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
              displayName: session.user.name || "",
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

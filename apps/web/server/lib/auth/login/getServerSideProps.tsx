import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import { verifyTotpLoginJwt } from "@calcom/features/auth/lib/signJwt";
import { getSafeRedirectUrl } from "@calcom/lib/getSafeRedirectUrl";
import prisma from "@calcom/prisma";
import { IS_GOOGLE_LOGIN_ENABLED } from "@server/lib/constants";
import type { GetServerSidePropsContext } from "next";
import { getCsrfToken } from "next-auth/react";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { req, query } = context;

  const session = await getServerSession({ req });

  let totpEmail = null;
  if (context.query.totp) {
    totpEmail = await verifyTotpLoginJwt(context.query.totp as string);
    if (!totpEmail) {
      return {
        redirect: {
          destination: "/auth/error?error=Invalid%20JWT%3A%20Please%20try%20again",
          permanent: false,
        },
      };
    }
  }

  if (session) {
    const { callbackUrl } = query;

    if (callbackUrl) {
      try {
        const destination = getSafeRedirectUrl(callbackUrl as string);
        if (destination) {
          return {
            redirect: {
              destination,
              permanent: false,
            },
          };
        }
      } catch (e) {
        console.warn(e);
      }
    }

    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const userExists = await prisma.user.findFirst({ select: { id: true } });
  if (!userExists) {
    // Proceed to new onboarding to create first admin user
    return {
      redirect: {
        destination: "/auth/setup",
        permanent: false,
      },
    };
  }
  return {
    props: {
      csrfToken: await getCsrfToken(context),
      isGoogleLoginEnabled: IS_GOOGLE_LOGIN_ENABLED,
      isOutlookLoginEnabled: false,
      totpEmail,
    },
  };
}

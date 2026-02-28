import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
  ],

  pages: {
    signIn: '/auth/signin',
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        await dbConnect();

        const email = user.email;
        if (!email) return false;

        // Find-or-create user in MongoDB
        let dbUser = await User.findOne({ email }).lean();

        if (!dbUser) {
          dbUser = await User.create({
            email,
            displayName: user.name || email.split('@')[0],
            role: 'student',
            level: 'Medical Student',
            stats: {
              totalSolved: 0,
              currentStreak: 0,
              longestStreak: 0,
              rank: 100,
            },
            systemMastery: new Map(),
          });
        }

        return true;
      } catch (error) {
        console.error('Error in signIn callback:', error);
        return false;
      }
    },

    async jwt({ token, user }) {
      if (user?.email) {
        try {
          await dbConnect();
          const dbUser = await User.findOne({ email: user.email })
            .select('_id displayName role level')
            .lean();

          if (dbUser) {
            token.userId = String(dbUser._id);
            token.displayName = dbUser.displayName;
            token.role = dbUser.role;
            token.level = dbUser.level;
          }
        } catch (error) {
          console.error('Error in jwt callback:', error);
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.userId as string;
        session.user.displayName = token.displayName as string;
        session.user.role = token.role as string;
        session.user.level = token.level as string;
      }
      return session;
    },
  },

  session: {
    strategy: 'jwt',
  },
});

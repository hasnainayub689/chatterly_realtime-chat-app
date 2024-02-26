import { NextAuthOptions } from 'next-auth'  // Importing NextAuthOptions type from next-auth library
import { UpstashRedisAdapter } from '@next-auth/upstash-redis-adapter' // Importing UpstashRedisAdapter from next-auth/upstash-redis-adapter
import { db } from './db' // Importing database connection from './db'
import GoogleProvider from 'next-auth/providers/google' // Importing GoogleProvider from next-auth/providers/google
import { fetchRedis } from '@/helpers/redis' // Importing fetchRedis function from '@/helpers/redis'

// Function to retrieve Google OAuth credentials from environment variables
function getGoogleCredentials() {
    const clientId = process.env.GOOGLE_CLIENT_ID // Retrieving Google client ID from environment variable
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET // Retrieving Google client secret from environment variable

    // Checking if client ID is missing
    if (!clientId || clientId.length === 0) {
        throw new Error('Missing GOOGLE_CLIENT_ID') // Throwing error if client ID is missing
    }

    // Checking if client secret is missing
    if (!clientSecret || clientSecret.length === 0) {
        throw new Error('Missing GOOGLE_CLIENT_SECRET') // Throwing error if client secret is missing
    }

    // Returning the retrieved credentials
    return { clientId, clientSecret }
}

// Configuration options for NextAuth
export const authOptions: NextAuthOptions = {
    adapter: UpstashRedisAdapter(db), // Setting up Upstash Redis adapter with the provided database connection
    session: {
        strategy: 'jwt', // Using JWT strategy for sessions
    },

    pages: {
        signIn: '/login', // Customizing the sign-in page URL
    },

    // Configuring Google OAuth provider
    providers: [
        GoogleProvider({
            clientId: getGoogleCredentials().clientId, // Providing Google client ID
            clientSecret: getGoogleCredentials().clientSecret, // Providing Google client secret
        }),
    ],

    // Callback functions for token and session handling
    callbacks: {
        // Callback function to manipulate JSON Web Tokens
        async jwt({ token, user }) {
            // Retrieving user data from Redis cache based on token ID
            const dbUserResult = (await fetchRedis('get', `user:${token.id}`)) as
                | string
                | null

            // If user data is not found in cache
            if (!dbUserResult) {
                // If user object exists, update token ID
                if (user) {
                    token.id = user!.id
                }

                return token // Returning the token
            }

            // Parsing user data from Redis cache
            const dbUser = JSON.parse(dbUserResult) as User

            // Returning token with updated user information
            return {
                id: dbUser.id,
                name: dbUser.name,
                email: dbUser.email,
                picture: dbUser.image,
            }
        },

        // Callback function to manipulate session data
        async session({ session, token }) {
            // If token exists, update session user data
            if (token) {
                session.user.id = token.id
                session.user.name = token.name
                session.user.email = token.email
                session.user.image = token.picture
            }

            return session // Returning the session
        },

        // Callback function to handle redirection after authentication
        redirect() {
            return '/dashboard' // Redirecting to the dashboard page
        },
    },
}

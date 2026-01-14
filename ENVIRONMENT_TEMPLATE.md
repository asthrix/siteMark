# ============================================================================
# SiteMark ENVIRONMENT VARIABLES
# ============================================================================
# Copy this file to .env.local and fill in your values

# ----------------------------------------------------------------------------
# Supabase Configuration
# Get these from: https://supabase.com/dashboard/project/_/settings/api
# ----------------------------------------------------------------------------
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# ----------------------------------------------------------------------------
# Database URLs (from Supabase Database Settings)
# ----------------------------------------------------------------------------
# Connection pooler URL (Transaction mode for serverless)
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true

# Direct connection (for migrations - Session mode)
DIRECT_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres

# ----------------------------------------------------------------------------
# App Configuration
# ----------------------------------------------------------------------------
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ----------------------------------------------------------------------------
# External APIs (Optional)
# ----------------------------------------------------------------------------
# Microlink API key for enhanced screenshot capture (free tier available)
# MICROLINK_API_KEY=your-api-key

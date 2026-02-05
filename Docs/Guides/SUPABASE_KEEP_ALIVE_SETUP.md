# Supabase Keep-Alive Setup Guide

This guide explains how to prevent your Supabase instance from pausing due to
inactivity (7 days) by using a GitHub Actions workflow that automatically pings
your database every 5 days.

## 📋 Overview

- **Problem**: Supabase pauses free-tier databases after 7 days of inactivity
- **Solution**: Automated workflow that runs every 5 days to keep the database
  active
- **Components**:
   - API health check endpoint
   - GitHub Actions workflow

---

## 🛠️ Implementation Steps

### Step 1: Create the Keep-Alive API Endpoint

Create a new file: `app/api/keep-alive/route.ts`

```typescript
// ============================================
// Keep-Alive API Route
// Simple endpoint to keep Supabase active
// ============================================

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export async function GET() {
   try {
      // Create Supabase client
      const supabase = createClient(
         process.env.NEXT_PUBLIC_SUPABASE_URL!,
         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );

      // Perform a simple query to keep the database active
      const { data, error } = await supabase
         .from("clients") // Using clients table for a simple count query
         .select("id", { count: "exact", head: true });

      if (error) {
         console.error("Keep-alive query error:", error);
         return NextResponse.json(
            {
               status: "error",
               message: "Failed to ping Supabase",
               error: error.message,
               timestamp: new Date().toISOString(),
            },
            { status: 500 },
         );
      }

      return NextResponse.json({
         status: "success",
         message: "Supabase is active",
         timestamp: new Date().toISOString(),
      });
   } catch (error) {
      console.error("Keep-alive error:", error);
      return NextResponse.json(
         {
            status: "error",
            message: "Unexpected error",
            timestamp: new Date().toISOString(),
         },
         { status: 500 },
      );
   }
}
```

**Note**: Replace `"clients"` with any existing table in your database.

---

### Step 2: Create the GitHub Actions Workflow

Create a new file: `.github/workflows/supabase-keep-alive.yml`

```yaml
name: Keep Supabase Active

# Run every 5 days to prevent Supabase from pausing after 7 days of inactivity
on:
   schedule:
      # Runs at 00:00 UTC every 5 days
      - cron: "0 0 */5 * *"
   # Allow manual trigger
   workflow_dispatch:

jobs:
   keep-alive:
      runs-on: ubuntu-latest

      steps:
         - name: Ping Keep-Alive Endpoint
           run: |
              echo "Pinging Supabase keep-alive endpoint..."
              response=$(curl -s -o response.json -w "%{http_code}" ${{ secrets.KEEP_ALIVE_URL }}/api/keep-alive)
              echo "HTTP Status: $response"

              if [ $response -eq 200 ]; then
                echo "✅ Supabase is active!"
                cat response.json
              else
                echo "⚠️ Keep-alive check returned status $response"
                cat response.json
                exit 1
              fi

         - name: Log Execution
           if: always()
           run: |
              echo "Workflow executed at: $(date)"
              echo "Next run will be in approximately 5 days"
```

---

### Step 3: Deploy Your Application

Deploy your application to your hosting platform (Vercel, Netlify, etc.) and
ensure:

1. ✅ The deployment is successful
2. ✅ Environment variables are configured:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

### Step 4: Test the API Endpoint

Before setting up the workflow, verify your endpoint works:

```bash
# Replace with your actual deployment URL
curl https://your-app-domain.com/api/keep-alive
```

Expected response:

```json
{
   "status": "success",
   "message": "Supabase is active",
   "timestamp": "2026-02-05T12:00:00.000Z"
}
```

---

### Step 5: Configure GitHub Secrets

1. Go to your GitHub repository
2. Navigate to: **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Add the following secret:

   | Name             | Value                         |
   | ---------------- | ----------------------------- |
   | `KEEP_ALIVE_URL` | `https://your-app-domain.com` |

   **Important**:
   - Do NOT include `/api/keep-alive` in the secret
   - Do NOT add a trailing slash
   - Use your production URL (e.g., `https://your-app.vercel.app`)

---

### Step 6: Test the Workflow

1. Go to your GitHub repository
2. Click the **"Actions"** tab
3. Select **"Keep Supabase Active"** from the left sidebar
4. Click **"Run workflow"** button (top right)
5. Click the green **"Run workflow"** button in the dropdown
6. Wait for the workflow to complete
7. Click on the workflow run to view logs

---

## 📊 Viewing Workflow Logs

### How to Check Logs:

1. **Go to GitHub Repository** → **Actions tab**
2. **Click "Keep Supabase Active"** workflow
3. **Select a workflow run** from the list
4. **Click the "keep-alive" job** to expand
5. **Click each step** to view detailed logs

### What to Look For:

✅ **Success**:

```
HTTP Status: 200
✅ Supabase is active!
{"status":"success","message":"Supabase is active","timestamp":"..."}
```

❌ **Failure**:

```
HTTP Status: 500
⚠️ Keep-alive check returned status 500
{"status":"error","message":"Failed to ping Supabase",...}
```

---

## 🔄 Workflow Schedule

- **Frequency**: Every 5 days
- **Schedule**: 00:00 UTC (midnight)
- **Purpose**: Run before the 7-day inactivity threshold
- **Manual Trigger**: Available via "Run workflow" button

---

## 🔧 Troubleshooting

### Issue: Workflow fails with exit code 1

**Possible Causes**:

1. `KEEP_ALIVE_URL` secret not set or incorrect
2. Application not deployed or URL is wrong
3. Environment variables missing in deployment
4. Table name in API endpoint doesn't exist

**Solutions**:

1. Verify `KEEP_ALIVE_URL` in GitHub secrets
2. Test endpoint manually: `curl https://your-app.com/api/keep-alive`
3. Check deployment platform environment variables
4. Update table name in `route.ts` to match your database

### Issue: API returns 500 error

**Possible Causes**:

1. Supabase credentials missing in deployment
2. Table doesn't exist
3. Database connection issue

**Solutions**:

1. Verify env vars in your deployment platform:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Change table name in the API route to an existing table
3. Check Supabase dashboard for connection issues

### Issue: Workflow not running automatically

**Possible Causes**:

1. Repository is private and GitHub Actions is disabled
2. Workflow file has syntax errors

**Solutions**:

1. Check repository settings → Actions → Enable workflows
2. Validate YAML syntax in the workflow file

---

## 📝 Customization

### Change Schedule Frequency

Edit the cron expression in `.github/workflows/supabase-keep-alive.yml`:

```yaml
schedule:
   # Every 3 days at 2 AM UTC
   - cron: "0 2 */3 * *"

   # Every 6 days at midnight UTC
   - cron: "0 0 */6 * *"

   # Every Monday at 9 AM UTC
   - cron: "0 9 * * 1"
```

### Use a Different Table

Update the table name in `app/api/keep-alive/route.ts`:

```typescript
const { data, error } = await supabase
   .from("your_table_name") // Change this
   .select("id", { count: "exact", head: true });
```

### Add Authentication

If you want to protect the endpoint:

```typescript
export async function GET(request: Request) {
   const authHeader = request.headers.get("authorization");
   const token = authHeader?.replace("Bearer ", "");

   if (token !== process.env.KEEP_ALIVE_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
   }

   // ... rest of the code
}
```

Then update the workflow:

```yaml
- name: Ping Keep-Alive Endpoint
  run: |
     response=$(curl -s -o response.json -w "%{http_code}" \
       -H "Authorization: Bearer ${{ secrets.KEEP_ALIVE_SECRET }}" \
       "${{ secrets.KEEP_ALIVE_URL }}/api/keep-alive")
```

---

## ✅ Verification Checklist

- [ ] API endpoint created at `app/api/keep-alive/route.ts`
- [ ] Workflow file created at `.github/workflows/supabase-keep-alive.yml`
- [ ] Application deployed successfully
- [ ] Environment variables configured in deployment platform
- [ ] API endpoint tested manually and returns 200
- [ ] `KEEP_ALIVE_URL` secret added to GitHub
- [ ] Workflow tested manually and succeeds
- [ ] Workflow logs verified

---

## 📚 Additional Resources

- [GitHub Actions Cron Syntax](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#schedule)
- [Supabase Pausing Policy](https://supabase.com/docs/guides/platform/going-into-prod#pausing)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

## 🎯 Summary

This setup ensures your Supabase instance remains active by:

1. Creating a lightweight API endpoint that performs a simple database query
2. Scheduling a GitHub Actions workflow to ping this endpoint every 5 days
3. Preventing the 7-day inactivity pause on free-tier Supabase instances

The solution is automated, requires no manual intervention, and has minimal
impact on your database resources.

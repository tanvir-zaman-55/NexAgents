Check the status of the Chef development environment.

Perform these checks:
1. Check if the Vite dev server is running on port 5173
2. Check if Convex dev is running
3. Check the Convex deployment status
4. Show any recent errors from the logs

Use these commands:
- `lsof -i :5173` to check Vite server
- `pgrep -f "convex dev"` to check Convex process
- `curl -s http://127.0.0.1:5173` to test the UI
- `npx convex function-spec` to verify Convex deployment

Present the results in a clear, actionable format.

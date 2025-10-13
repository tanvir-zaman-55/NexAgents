View Chef application logs to help debug issues.

Show logs from:
1. **Vite Dev Server**: Check the terminal running `pnpm run dev`
2. **Convex Dev**: Check the terminal running `npx convex dev`
3. **Browser Console**: Instruct user to open browser DevTools at http://127.0.0.1:5173
4. **Convex Dashboard**: Open with `npx convex dashboard` and check the Logs tab

Look for:
- Error messages (especially HTTP 404, 500, etc.)
- Warning messages about environment variables
- Connection issues with Convex
- WebContainer boot issues

Present the most recent and relevant log entries.

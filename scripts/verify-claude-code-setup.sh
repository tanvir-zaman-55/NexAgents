#!/bin/bash
# Verify Claude Code integration setup

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Chef + Claude Code Integration Verification"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

ERRORS=0
WARNINGS=0

# Check 1: Claude CLI installed
echo "1️⃣  Checking Claude Code CLI installation..."
if command -v claude &> /dev/null; then
  CLAUDE_PATH=$(which claude)
  echo "   ✅ Claude CLI found: $CLAUDE_PATH"
else
  echo "   ❌ Claude CLI not found"
  echo "      Install: npm install -g @anthropic-ai/claude-code"
  ERRORS=$((ERRORS + 1))
fi
echo ""

# Check 2: Authentication
echo "2️⃣  Checking Claude Code authentication..."
if command -v claude &> /dev/null; then
  if claude auth status &> /dev/null; then
    echo "   ✅ Authenticated with Claude Code"
  else
    echo "   ❌ Not authenticated"
    echo "      Login: claude auth login"
    ERRORS=$((ERRORS + 1))
  fi
else
  echo "   ⏭️  Skipped (CLI not installed)"
fi
echo ""

# Check 3: Node modules
echo "3️⃣  Checking required npm packages..."
if [ -d "node_modules/@anthropic-ai/claude-agent-sdk" ]; then
  echo "   ✅ @anthropic-ai/claude-agent-sdk installed"
else
  echo "   ❌ @anthropic-ai/claude-agent-sdk not found"
  echo "      Install: pnpm install"
  ERRORS=$((ERRORS + 1))
fi
echo ""

# Check 4: Environment configuration
echo "4️⃣  Checking environment configuration..."
if [ -f ".env.local" ]; then
  echo "   ✅ .env.local exists"

  if grep -q "USE_CLAUDE_AGENT_SDK=1" .env.local; then
    echo "   ✅ USE_CLAUDE_AGENT_SDK=1 is set"
  else
    echo "   ⚠️  USE_CLAUDE_AGENT_SDK not enabled"
    echo "      Enable: ./scripts/toggle-claude-code.sh enable"
    WARNINGS=$((WARNINGS + 1))
  fi
else
  echo "   ❌ .env.local not found"
  ERRORS=$((ERRORS + 1))
fi
echo ""

# Check 5: Integration files
echo "5️⃣  Checking integration files..."
if [ -f "app/lib/.server/llm/claude-agent-sdk.ts" ]; then
  echo "   ✅ claude-agent-sdk.ts exists"
else
  echo "   ❌ claude-agent-sdk.ts missing"
  ERRORS=$((ERRORS + 1))
fi

if [ -f "app/lib/.server/llm/convex-agent.ts" ]; then
  echo "   ✅ convex-agent.ts exists"
else
  echo "   ❌ convex-agent.ts missing"
  ERRORS=$((ERRORS + 1))
fi
echo ""

# Check 6: Test Claude CLI execution
echo "6️⃣  Testing Claude CLI execution..."
if command -v claude &> /dev/null; then
  TEST_OUTPUT=$(claude --version 2>&1)
  if [ $? -eq 0 ]; then
    echo "   ✅ Claude CLI executes successfully"
    echo "      Version: $TEST_OUTPUT"
  else
    echo "   ❌ Claude CLI execution failed"
    echo "      Output: $TEST_OUTPUT"
    ERRORS=$((ERRORS + 1))
  fi
else
  echo "   ⏭️  Skipped (CLI not installed)"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo "✅ All checks passed! Chef is ready to use Claude Code."
  echo ""
  echo "Quick start:"
  echo "1. Enable integration: ./scripts/toggle-claude-code.sh enable"
  echo "2. Start Chef: pnpm run dev"
  echo "3. Start Convex: npx convex dev (in another terminal)"
  echo "4. Open http://127.0.0.1:5173"
  echo "5. Select 'Anthropic' provider in settings"
  echo "6. Build apps with Claude Code!"
  exit 0
elif [ $ERRORS -eq 0 ]; then
  echo "⚠️  Setup mostly complete with $WARNINGS warning(s)"
  echo ""
  echo "Review warnings above and enable integration when ready."
  exit 0
else
  echo "❌ Setup incomplete: $ERRORS error(s), $WARNINGS warning(s)"
  echo ""
  echo "Please fix the errors above before using Claude Code integration."
  exit 1
fi

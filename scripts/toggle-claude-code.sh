#!/bin/bash
# Toggle Claude Code integration for Chef

ENV_FILE=".env.local"

if [ ! -f "$ENV_FILE" ]; then
  echo "❌ Error: $ENV_FILE not found"
  echo "Please run this script from the Chef project root"
  exit 1
fi

# Check current status
if grep -q "^USE_CLAUDE_AGENT_SDK=1" "$ENV_FILE"; then
  ENABLED=true
else
  ENABLED=false
fi

# Parse command
CMD="${1:-status}"

case "$CMD" in
  enable)
    if [ "$ENABLED" = true ]; then
      echo "✅ Claude Code integration is already enabled"
    else
      echo "USE_CLAUDE_AGENT_SDK=1" >> "$ENV_FILE"
      echo "✅ Claude Code integration enabled!"
      echo ""
      echo "Next steps:"
      echo "1. Restart Chef: pnpm run dev"
      echo "2. Restart Convex: npx convex dev"
      echo "3. Select 'Anthropic' in Chef settings"
      echo "4. Start building! Claude Code will handle AI generation"
    fi
    ;;

  disable)
    if [ "$ENABLED" = false ]; then
      echo "ℹ️  Claude Code integration is already disabled"
    else
      # Remove the line
      sed -i '/^USE_CLAUDE_AGENT_SDK=1/d' "$ENV_FILE"
      echo "✅ Claude Code integration disabled"
      echo ""
      echo "Chef will now use API calls (Anthropic/OpenAI/Google)"
      echo "Make sure you have API keys configured in $ENV_FILE"
    fi
    ;;

  status)
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  Claude Code Integration Status"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    if [ "$ENABLED" = true ]; then
      echo "Status: ✅ ENABLED"
      echo "Engine: Claude Code CLI"
    else
      echo "Status: ❌ DISABLED"
      echo "Engine: Direct API calls"
    fi

    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  Environment Check"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    # Check Claude CLI
    if command -v claude &> /dev/null; then
      CLAUDE_PATH=$(which claude)
      echo "Claude CLI: ✅ Found at $CLAUDE_PATH"

      # Check authentication
      if claude auth status &> /dev/null; then
        echo "Auth Status: ✅ Authenticated"
      else
        echo "Auth Status: ❌ Not authenticated"
        echo "             Run: claude auth login"
      fi
    else
      echo "Claude CLI: ❌ Not found"
      echo "            Run: npm install -g @anthropic-ai/claude-code"
    fi

    echo ""

    # Check API keys
    if grep -q "ANTHROPIC_API_KEY" "$ENV_FILE"; then
      echo "API Key:    ✅ Anthropic API key configured"
    else
      echo "API Key:    ⚠️  No Anthropic API key (required if integration disabled)"
    fi

    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    if [ "$ENABLED" = true ]; then
      echo "To disable: ./scripts/toggle-claude-code.sh disable"
    else
      echo "To enable:  ./scripts/toggle-claude-code.sh enable"
    fi
    ;;

  *)
    echo "Usage: $0 {enable|disable|status}"
    echo ""
    echo "Commands:"
    echo "  enable   - Use Claude Code CLI for AI generation"
    echo "  disable  - Use direct API calls (Anthropic/OpenAI/Google)"
    echo "  status   - Show current configuration"
    exit 1
    ;;
esac

#!/bin/bash
# SkillForge Deployment & Testing Script

echo "================================"
echo "SkillForge Deployment Tester"
echo "================================"
echo ""

# Configuration
BACKEND_URL="${BACKEND_URL:-https://skillforge-api.onrender.com}"
FRONTEND_URL="${FRONTEND_URL:-https://skillforge-web.onrender.com}"

echo "Backend URL: $BACKEND_URL"
echo "Frontend URL: $FRONTEND_URL"
echo ""

# Test 1: Backend Health Check
echo "[TEST 1] Backend Health Check..."
HEALTH=$(curl -s "$BACKEND_URL/api/health")
if echo "$HEALTH" | grep -q "SkillForge API is running"; then
    echo "✅ Backend is running and healthy"
    echo "   Response: $HEALTH"
else
    echo "❌ Backend health check failed"
    exit 1
fi
echo ""

# Test 2: CORS Check
echo "[TEST 2] CORS Configuration Check..."
CORS_TEST=$(curl -s -I -X OPTIONS "$BACKEND_URL/api/auth/register" \
  -H "Origin: $FRONTEND_URL" \
  -H "Access-Control-Request-Method: POST" 2>&1)
if echo "$CORS_TEST" | grep -q "200\|204"; then
    echo "✅ CORS is properly configured"
else
    echo "⚠️  CORS might have issues (check response headers)"
fi
echo ""

# Test 3: Register Endpoint (Fallback)
echo "[TEST 3] Testing /auth/register endpoint (Fallback)..."
REGISTER_FALLBACK=$(curl -s -X POST "$BACKEND_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User Fallback",
    "email": "test-fallback-'$(date +%s)'@example.com",
    "password": "TestPass123!",
    "university": "Test University",
    "major_semester": "CS - 3rd",
    "interests": "Development",
    "country": "USA",
    "target_role": "Developer",
    "year": 3,
    "skill_level": "Intermediate",
    "preferred_stack": "MERN",
    "internship_timeline": "6 months"
  }')
if echo "$REGISTER_FALLBACK" | grep -q "access_token"; then
    echo "✅ Fallback registration endpoint works"
    echo "   Got access token: $(echo $REGISTER_FALLBACK | grep -o 'access_token' | head -1)"
else
    echo "❌ Fallback registration failed"
    echo "   Response: $REGISTER_FALLBACK"
fi
echo ""

# Test 4: Register Endpoint (API prefix)
echo "[TEST 4] Testing /api/auth/register endpoint (API prefix)..."
REGISTER_API=$(curl -s -X POST "$BACKEND_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User API",
    "email": "test-api-'$(date +%s)'@example.com",
    "password": "TestPass123!",
    "university": "Test University",
    "major_semester": "CS - 3rd",
    "interests": "Development",
    "country": "USA",
    "target_role": "Developer",
    "year": 3,
    "skill_level": "Intermediate",
    "preferred_stack": "MERN",
    "internship_timeline": "6 months"
  }')
if echo "$REGISTER_API" | grep -q "access_token"; then
    echo "✅ API registration endpoint works"
    echo "   Got access token: $(echo $REGISTER_API | grep -o 'access_token' | head -1)"
else
    echo "❌ API registration failed"
    echo "   Response: $REGISTER_API"
fi
echo ""

# Test 5: Frontend HTTP Status
echo "[TEST 5] Frontend Deployment Status..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL")
if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "404" ]; then
    echo "✅ Frontend is accessible (HTTP $HTTP_STATUS)"
else
    echo "❌ Frontend returned unexpected status: $HTTP_STATUS"
fi
echo ""

echo "================================"
echo "Testing Complete!"
echo "================================"
echo ""
echo "Summary:"
echo "- Backend: $BACKEND_URL"
echo "- Frontend: $FRONTEND_URL"
echo ""
echo "Next steps:"
echo "1. Visit $FRONTEND_URL in your browser"
echo "2. Try to register a new account"
echo "3. Check browser DevTools (F12) → Network tab"
echo "4. Verify requests are going to the correct backend URL"

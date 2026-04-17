#!/usr/bin/env bash
# Seed IDs: userA=17 blogA=14 userB=18 blogB=15 userC=19 blogC=16
#           catDev=16 catDesign=17 catDaily=18 catPhoto=19
#           postA1=32 postA2=33 postA3=34 postB1=35 postC1=36
#           commentB=15 replyA=16 commentC=17
#           likeB=18 likeC=19 likeA=20
#           noti1=14 noti2=15

BASE="http://localhost:3000"
COOKIE_A="/tmp/za_a.jar"
COOKIE_B="/tmp/za_b.jar"
PASS=0
FAIL=0
RESULTS=()

rm -f "$COOKIE_A" "$COOKIE_B"

run() {
  local name="$1" expected="$2" method="$3" url="$4" cookie="$5" body="$6"
  local curl_args=(-s -o /tmp/za_resp.txt -w "%{http_code}" -X "$method" "$BASE$url")
  [ -n "$cookie" ] && curl_args+=(-b "$cookie" -c "$cookie")
  [ -n "$body" ] && curl_args+=(-H "Content-Type: application/json" -d "$body")
  local code
  code=$(curl "${curl_args[@]}")
  local snippet
  snippet=$(head -c 180 /tmp/za_resp.txt | tr -d '\n')
  if [ "$code" = "$expected" ]; then
    echo "✅ $name → $code"
    RESULTS+=("PASS|$name|$code"); PASS=$((PASS+1))
  else
    echo "❌ $name → $code (expected $expected)"
    echo "   body: $snippet"
    RESULTS+=("FAIL|$name|$code (exp $expected)|$snippet"); FAIL=$((FAIL+1))
  fi
}

login() {
  local email="$1" jar="$2"
  local csrf
  csrf=$(curl -s -c "$jar" "$BASE/api/auth/csrf" | sed -E 's/.*"csrfToken":"([^"]+)".*/\1/')
  curl -s -b "$jar" -c "$jar" -X POST "$BASE/api/auth/callback/credentials" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    --data-urlencode "csrfToken=$csrf" --data-urlencode "email=$email" \
    --data-urlencode "password=password123" --data-urlencode "redirect=false" \
    --data-urlencode "json=true" -o /dev/null
  echo "   [login $email] $(curl -s -b "$jar" "$BASE/api/auth/session" | head -c 80)"
}

echo "=== 0. 서버 준비 ==="
for i in $(seq 1 30); do
  curl -s -o /dev/null -w "%{http_code}" "$BASE/api/auth/csrf" | grep -q 200 && { echo "   OK"; break; }
  sleep 2
done

echo ""
echo "=== 1. 공개 엔드포인트 ==="
run "GET /api/posts"                     200 GET "/api/posts"
run "GET /api/posts?page=1&limit=2"      200 GET "/api/posts?page=1&limit=2"
run "GET /api/blogs/14"                  200 GET "/api/blogs/14"
run "GET /api/blogs/14?category_id=16"   200 GET "/api/blogs/14?category_id=16"
run "GET /api/blogs/abc (invalid id)"    400 GET "/api/blogs/abc"
run "GET /api/blogs/9999 (not found)"    404 GET "/api/blogs/9999"
run "GET /api/blogs/14/categories"       200 GET "/api/blogs/14/categories"
run "GET /api/posts/32"                  200 GET "/api/posts/32"
run "GET /api/posts/9999 (not found)"    404 GET "/api/posts/9999"
run "GET /api/users/17/profile"          200 GET "/api/users/17/profile"
run "GET /api/users/abc/profile (bad)"   400 GET "/api/users/abc/profile"
run "GET /api/users/9999/profile"        404 GET "/api/users/9999/profile"

echo ""
echo "=== 2. signup ==="
run "POST /api/auth/signup (missing)"   400 POST "/api/auth/signup" "" '{}'
run "POST /api/auth/signup (duplicate)" 409 POST "/api/auth/signup" "" '{"email":"testa@example.com","password":"p","name":"x","nickname":"userA","blogTitle":"t","urlSlug":"x"}'
run "POST /api/auth/signup (new)"       201 POST "/api/auth/signup" "" '{"email":"newtest@example.com","password":"password123","name":"새유저","nickname":"newtest","blogTitle":"새 블로그","urlSlug":"new-test"}'

echo ""
echo "=== 3. 인증 필요 (미로그인) ==="
run "GET /api/universe (401)"                 401 GET  "/api/universe"
run "GET /api/feeds/universe (401)"           401 GET  "/api/feeds/universe"
run "GET /api/users/17/notifications (401)"   401 GET  "/api/users/17/notifications"
run "GET /api/blogs/profile (401)"            401 GET  "/api/blogs/profile"
run "POST /api/posts (401)"                   401 POST "/api/posts" "" '{"title":"x","content":"y"}'
run "POST /api/posts/32/comments (401)"       401 POST "/api/posts/32/comments" "" '{"content":"x","parentId":null}'
run "POST /api/posts/32/likes (401)"          401 POST "/api/posts/32/likes"
run "POST /api/neighbors/15 (401)"            401 POST "/api/neighbors/15"
run "PUT /api/blogs/14/categories (401)"      401 PUT  "/api/blogs/14/categories" "" '{"categories":[]}'
run "POST /api/blogs/14/categories (401)"     401 POST "/api/blogs/14/categories"
run "PUT /api/categories/16 (401)"            401 PUT  "/api/categories/16" "" '{"name":"x"}'
run "DELETE /api/categories/16 (401)"         401 DELETE "/api/categories/16"
run "PUT /api/posts/32 (401)"                 401 PUT  "/api/posts/32" "" '{"title":"x"}'
run "DELETE /api/posts/32 (401)"              401 DELETE "/api/posts/32"
run "PUT /api/comments/15 (401)"              401 PUT  "/api/comments/15" "" '{"content":"x"}'
run "DELETE /api/comments/15 (401)"           401 DELETE "/api/comments/15"
run "DELETE /api/likes/18 (401)"              401 DELETE "/api/likes/18"
run "PUT /api/notifications/14 (401)"         401 PUT  "/api/notifications/14"
run "DELETE /api/notifications/14 (401)"      401 DELETE "/api/notifications/14"

echo ""
echo "=== 4. 로그인 ==="
login "testa@example.com" "$COOKIE_A"
login "testb@example.com" "$COOKIE_B"

echo ""
echo "=== 5. 인증 GET ==="
run "GET /api/blogs/profile (A)"             200 GET "/api/blogs/profile" "$COOKIE_A"
run "GET /api/universe (A)"                  200 GET "/api/universe" "$COOKIE_A"
run "GET /api/feeds/universe (A)"            200 GET "/api/feeds/universe" "$COOKIE_A"
run "GET /api/users/17/notifications (A)"    200 GET "/api/users/17/notifications" "$COOKIE_A"

echo ""
echo "=== 6. 포스트 생성/수정/삭제 ==="
run "POST /api/posts (A, draft)"       201 POST "/api/posts" "$COOKIE_A" '{"title":"새 글","content":"내용","status":"draft","categoryId":16}'
run "POST /api/posts (A, missing)"     400 POST "/api/posts" "$COOKIE_A" '{"title":""}'
run "PUT /api/posts/32 (A, own)"       200 PUT "/api/posts/32" "$COOKIE_A" '{"title":"수정됨","content":"c","categoryId":16,"status":"published"}'
run "PUT /api/posts/35 (A, other)"     403 PUT "/api/posts/35" "$COOKIE_A" '{"title":"x","content":"y","categoryId":null,"status":"draft"}'

echo ""
echo "=== 7. 댓글 ==="
run "POST /api/posts/32/comments (A)"    201 POST "/api/posts/32/comments" "$COOKIE_A" '{"content":"새 댓글","parentId":null}'
run "POST /api/posts/32/comments (bad)"  400 POST "/api/posts/32/comments" "$COOKIE_A" '{"content":"reply","parentId":"abc"}'
run "PUT /api/comments/15 (B own)"       200 PUT "/api/comments/15" "$COOKIE_B" '{"content":"수정된 댓글"}'
run "PUT /api/comments/15 (A other)"     403 PUT "/api/comments/15" "$COOKIE_A" '{"content":"x"}'
run "DELETE /api/comments/17 (A other)"  403 DELETE "/api/comments/17" "$COOKIE_A"

echo ""
echo "=== 8. 공감 ==="
run "POST /api/posts/36/likes (A)"          201 POST "/api/posts/36/likes" "$COOKIE_A"
run "POST /api/posts/32/likes (B dup)"      409 POST "/api/posts/32/likes" "$COOKIE_B"

echo ""
echo "=== 9. 이웃 ==="
run "POST /api/neighbors/16 (A)"             201 POST "/api/neighbors/16" "$COOKIE_A"
run "POST /api/neighbors/16 (A dup)"         409 POST "/api/neighbors/16" "$COOKIE_A"
run "POST /api/neighbors/14 (A self)"        400 POST "/api/neighbors/14" "$COOKIE_A"
run "POST /api/neighbors/9999 (not found)"   404 POST "/api/neighbors/9999" "$COOKIE_A"

echo ""
echo "=== 10. 알림 ==="
run "PUT /api/notifications/14 (A own)"          200 PUT    "/api/notifications/14" "$COOKIE_A"
run "PUT /api/notifications/14 (B other)"        403 PUT    "/api/notifications/14" "$COOKIE_B"
run "PUT /api/notifications/99999 (not found)"   404 PUT    "/api/notifications/99999" "$COOKIE_A"
run "DELETE /api/notifications/15 (A own)"       200 DELETE "/api/notifications/15" "$COOKIE_A"

echo ""
echo "=== 11. 카테고리 ==="
run "POST /api/blogs/14/categories (A)"      201 POST "/api/blogs/14/categories" "$COOKIE_A"
run "PUT /api/blogs/14/categories (A)"       200 PUT  "/api/blogs/14/categories" "$COOKIE_A" '{"categories":[{"id":16,"orderIndex":1},{"id":17,"orderIndex":0}]}'
run "PUT /api/categories/17 (A own)"         200 PUT  "/api/categories/17" "$COOKIE_A" '{"name":"디자인 수정","type":"default","parentId":null,"isRepresentative":false}'
run "PUT /api/categories/18 (A other)"       403 PUT  "/api/categories/18" "$COOKIE_A" '{"name":"x","parentId":null,"isRepresentative":false}'
run "DELETE /api/categories/17 (A own)"      200 DELETE "/api/categories/17" "$COOKIE_A"

echo ""
echo "=== 12. 삭제 계열 ==="
run "DELETE /api/likes/18 (B own)"           200 DELETE "/api/likes/18" "$COOKIE_B"
run "DELETE /api/likes/20 (A own postB1)"    200 DELETE "/api/likes/20" "$COOKIE_A"
run "DELETE /api/posts/34 (A draft own)"     200 DELETE "/api/posts/34" "$COOKIE_A"

echo ""
echo "=============================="
echo "✅ PASS: $PASS    ❌ FAIL: $FAIL"
echo "=============================="
if [ "$FAIL" -gt 0 ]; then
  echo ""
  echo "--- 실패한 테스트 ---"
  for r in "${RESULTS[@]}"; do
    case "$r" in FAIL*) echo "$r" ;; esac
  done
fi

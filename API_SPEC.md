# Zero:om API 명세서

---

## API 명세서: 회원가입

### 1. 기본 정보

- **Method:** `POST`
- **Endpoint:** `/api/auth/signup`
- **Content-Type:** `application/json`
- **인증:** 불필요
- **설명:** 새로운 사용자와 블로그를 동시에 생성합니다.

---

### 2. Request Body

| **파라미터명** | **타입** | **필수 여부** | **설명** |
| --- | --- | --- | --- |
| `email` | `string` | **필수** | 이메일 주소 |
| `password` | `string` | **필수** | 비밀번호 (bcrypt 해싱 저장) |
| `name` | `string` | **필수** | 이름 |
| `nickname` | `string` | **필수** | 닉네임 (고유) |
| `blogTitle` | `string` | 선택 | 블로그 제목 |
| `urlSlug` | `string` | 선택 | 블로그 URL 슬러그 (고유) |
| `birthdate` | `string` | 선택 | 생년월일 (ISO 날짜 형식) |

---

### 3. Response (응답)

**성공 (201 Created)**

- 사용자 및 블로그 생성에 성공했을 때 반환합니다.

```json
{
  "message": "User created successfully",
  "userId": "1"
}
```

**실패 (400 Bad Request)**

- 필수 필드가 누락되었을 때 반환합니다.

```json
{
  "message": "Missing required fields"
}
```

**실패 (409 Conflict)**

- 이메일 또는 닉네임이 이미 존재할 때 반환합니다.

```json
{
  "message": "Email or nickname already exists"
}
```

**실패 (500 Internal Server Error)**

- 서버 내부 오류 발생 시 반환합니다.

```json
{
  "message": "Failed to create user",
  "error": "에러 메시지"
}
```

---

---

## API 명세서: 사용자 프로필 조회

### 1. 기본 정보

- **Method:** `GET`
- **Endpoint:** `/api/users/{userId}/profile`
- **Content-Type:** `application/json`
- **인증:** 불필요
- **설명:** 특정 사용자의 프로필 정보(이름, 닉네임, 프로필 이미지, 블로그 정보)를 조회합니다.

---

### 2. Path Parameter

| **파라미터명** | **타입** | **필수 여부** | **설명** |
| --- | --- | --- | --- |
| `userId` | `number` | **필수** | 조회할 사용자의 고유 ID |

---

### 3. Response (응답)

**성공 (200 OK)**

- 사용자 프로필 조회에 성공했을 때 반환합니다.

```json
{
  "message": "프로필 조회 완료!",
  "data": {
    "name": "홍길동",
    "nickname": "gildong",
    "profile_img": "https://example.com/image.png",
    "blog": {
      "title": "길동의 개발 블로그",
      "url_slug": "gildong-dev"
    }
  }
}
```

**실패 (400 Bad Request)**

- `userId`가 숫자가 아닌 경우 반환합니다.

```json
{
  "message": "유효하지 않은 ID입니다."
}
```

**실패 (404 Not Found)**

- 해당 ID의 사용자가 존재하지 않을 때 반환합니다.

```json
{
  "message": "사용자가 존재하지 않습니다."
}
```

**실패 (500 Internal Server Error)**

- 서버 내부 오류 발생 시 반환합니다.

```json
{
  "message": "프로필 조회 실패..."
}
```

---

---

## API 명세서: 내 프로필 조회

### 1. 기본 정보

- **Method:** `GET`
- **Endpoint:** `/api/blogs/profile`
- **Content-Type:** `application/json`
- **인증:** 필요 (NextAuth 세션)
- **설명:** 로그인한 사용자 본인의 프로필 및 블로그 기본 정보를 조회합니다.

---

### 2. Request Parameter

없음

---

### 3. Response (응답)

**성공 (200 OK)**

- 프로필 조회에 성공했을 때 반환합니다.

```json
{
  "message": "기본 정보 조회 완료!",
  "data": {
    "name": "홍길동",
    "nickname": "gildong",
    "birthdate": "1995-03-15T00:00:00.000Z",
    "profile_img": "https://example.com/image.png",
    "email": "gildong@example.com",
    "blog": {
      "title": "길동의 블로그",
      "url_slug": "gildong-blog",
      "description": "개발 일기"
    }
  }
}
```

**실패 (401 Unauthorized)**

- 로그인하지 않은 상태에서 요청 시 반환합니다.

```json
{
  "message": "로그인이 필요합니다."
}
```

**실패 (404 Not Found)**

- 세션의 사용자 ID에 해당하는 사용자가 없을 때 반환합니다.

```json
{
  "message": "사용자를 찾을 수 없습니다."
}
```

**실패 (500 Internal Server Error)**

- 서버 내부 오류 발생 시 반환합니다.

```json
{
  "message": "기본 정보 조회 실패..."
}
```

---

---

## API 명세서: 내 프로필 수정

### 1. 기본 정보

- **Method:** `PUT`
- **Endpoint:** `/api/blogs/profile`
- **Content-Type:** `application/json`
- **인증:** 필요 (NextAuth 세션)
- **설명:** 로그인한 사용자의 프로필 및 블로그 정보를 수정합니다. 모든 필드는 선택이며 전달된 필드만 업데이트됩니다.

---

### 2. Request Body

| **파라미터명** | **타입** | **필수 여부** | **설명** |
| --- | --- | --- | --- |
| `name` | `string` | 선택 | 이름 |
| `nickname` | `string` | 선택 | 별명 (고유) |
| `profileImg` | `string` | 선택 | 프로필 이미지 URL |
| `blogTitle` | `string` | 선택 | 블로그 제목 |
| `urlSlug` | `string` | 선택 | 블로그 URL 슬러그 (고유) |
| `description` | `string` | 선택 | 블로그 소개 |
| `currentPassword` | `string` | 조건부 | 현재 비밀번호 (`newPassword` 전송 시 필수) |
| `newPassword` | `string` | 선택 | 새 비밀번호 |

---

### 3. Response (응답)

**성공 (200 OK)**

- 프로필 수정에 성공했을 때 반환합니다.

```json
{
  "message": "프로필 수정 완료!",
  "data": {
    "user": {
      "name": "홍길동",
      "nickname": "gildong_new",
      "profile_img": "https://example.com/new.png",
      "email": "gildong@example.com"
    },
    "blog": {
      "title": "새 블로그명",
      "url_slug": "new-slug",
      "description": "새 소개"
    }
  }
}
```

**실패 (400 Bad Request)**

- 비밀번호 변경 시 현재 비밀번호가 누락되었거나 일치하지 않을 때 반환합니다.

```json
{
  "message": "현재 비밀번호를 입력해주세요."
}
```

```json
{
  "message": "현재 비밀번호가 일치하지 않습니다."
}
```

**실패 (401 Unauthorized)**

- 로그인하지 않은 상태에서 요청 시 반환합니다.

```json
{
  "message": "로그인이 필요합니다."
}
```

**실패 (409 Conflict)**

- 닉네임 또는 블로그 주소가 이미 사용 중일 때 반환합니다.

```json
{
  "message": "이미 사용 중인 별명입니다."
}
```

```json
{
  "message": "이미 사용 중인 블로그 주소입니다."
}
```

**실패 (500 Internal Server Error)**

- 서버 내부 오류 발생 시 반환합니다.

```json
{
  "message": "프로필 수정 실패..."
}
```

---

---

## API 명세서: 게시글 목록 조회

### 1. 기본 정보

- **Method:** `GET`
- **Endpoint:** `/api/posts`
- **Content-Type:** `application/json`
- **인증:** 불필요
- **설명:** 발행된(`published`) 게시글을 페이지네이션하여 조회합니다. 블로그, 카테고리, 태그 정보를 포함합니다.

---

### 2. Query Parameter

| **파라미터명** | **타입** | **필수 여부** | **기본값** | **설명** |
| --- | --- | --- | --- | --- |
| `page` | `number` | 선택 | `1` | 조회할 페이지 번호 |
| `limit` | `number` | 선택 | `10` | 한 페이지당 게시글 수 |

---

### 3. Response (응답)

**성공 (200 OK)**

- 게시글 목록 조회에 성공했을 때 반환합니다. 게시글 내용은 200자까지 잘려서 반환됩니다.

```json
{
  "success": true,
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalCount": 42,
    "totalPages": 5
  },
  "posts": [
    {
      "id": "1",
      "title": "첫 번째 글",
      "content": "본문 미리보기 200자...",
      "status": "published",
      "viewCount": 15,
      "publishedAt": "2026-04-10T12:00:00.000Z",
      "author": "gildong",
      "blog": {
        "title": "길동의 블로그",
        "slug": "gildong-blog"
      },
      "category": "개발",
      "tags": ["JavaScript", "React"]
    }
  ]
}
```

**실패 (500 Internal Server Error)**

- 서버 내부 오류 발생 시 반환합니다.

```json
{
  "success": false,
  "error": "게시글을 불러오는데 실패했습니다."
}
```

---

---

## API 명세서: 게시글 작성

### 1. 기본 정보

- **Method:** `POST`
- **Endpoint:** `/api/posts`
- **Content-Type:** `application/json`
- **인증:** 필요 (NextAuth 세션)
- **설명:** 새 게시글을 작성합니다. 로그인한 사용자의 블로그에 자동으로 연결됩니다.

---

### 2. Request Body

| **파라미터명** | **타입** | **필수 여부** | **설명** |
| --- | --- | --- | --- |
| `title` | `string` | **필수** | 게시글 제목 |
| `content` | `string` | **필수** | 게시글 본문 |
| `categoryId` | `number` | 선택 | 카테고리 ID (`null`이면 미분류) |
| `representativeImageId` | `number` | 선택 | 대표 이미지 ID |
| `status` | `string` | 선택 | `"draft"` 또는 `"published"` |

---

### 3. Response (응답)

**성공 (201 Created)**

- 게시글 생성에 성공했을 때 반환합니다.

```json
{
  "message": "포스팅에 성공했습니다.",
  "post": {
    "id": "1",
    "blog_id": "1",
    "category_id": "3",
    "title": "새 글",
    "content": "본문 내용",
    "status": "published",
    "published_at": "2026-04-17T12:00:00.000Z",
    "created_at": "2026-04-17T12:00:00.000Z"
  }
}
```

**실패 (400 Bad Request)**

- 제목 또는 내용이 누락되었을 때 반환합니다.

```json
{
  "message": "필수 항목(제목, 내용)이 누락되었습니다."
}
```

**실패 (401 Unauthorized)**

- 로그인하지 않은 상태에서 요청 시 반환합니다.

```json
{
  "message": "로그인이 필요합니다."
}
```

**실패 (500 Internal Server Error)**

- 서버 내부 오류 발생 시 반환합니다.

```json
{
  "message": "포스팅에 실패했습니다."
}
```

---

---

## API 명세서: 임시저장 목록 조회

### 1. 기본 정보

- **Method:** `GET`
- **Endpoint:** `/api/posts/drafts`
- **Content-Type:** `application/json`
- **인증:** 필요 (세션 쿠키)
- **설명:** 로그인한 사용자의 임시저장(draft) 게시글 목록을 조회합니다. 최근 수정순으로 정렬됩니다.

---

### 2. Query Parameters

| **파라미터명** | **타입** | **필수 여부** | **설명** |
| --- | --- | --- | --- |
| `page` | `number` | 선택 | 페이지 번호 (기본값: 1) |
| `limit` | `number` | 선택 | 페이지당 항목 수 (기본값: 10) |

---

### 3. Response

#### 성공 (200)

```json
{
  "success": true,
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalCount": 1,
    "totalPages": 1
  },
  "drafts": [
    {
      "id": "37",
      "title": "임시 게시글 제목",
      "contentPreview": "본문 미리보기 (최대 200자)",
      "category": {
        "id": "16",
        "name": "카테고리명"
      },
      "createdAt": "2026-04-16T07:46:53.311Z",
      "updatedAt": "2026-04-16T07:46:53.311Z"
    }
  ]
}
```

#### 실패 — 인증 없음 (401)

```json
{
  "message": "로그인이 필요합니다."
}
```

#### 실패 — 블로그 없음 (404)

```json
{
  "message": "블로그 정보가 없습니다."
}
```

#### 실패 — 서버 오류 (500)

```json
{
  "message": "임시저장 목록 조회 실패..."
}
```

---

## API 명세서: 게시글 상세 조회

### 1. 기본 정보

- **Method:** `GET`
- **Endpoint:** `/api/posts/{postId}`
- **Content-Type:** `application/json`
- **인증:** 불필요
- **설명:** 특정 게시글의 상세 정보와 같은 카테고리의 글 목록을 함께 조회합니다.

---

### 2. Path Parameter

| **파라미터명** | **타입** | **필수 여부** | **설명** |
| --- | --- | --- | --- |
| `postId` | `number` | **필수** | 조회할 게시글의 고유 ID |

### 3. Query Parameter

| **파라미터명** | **타입** | **필수 여부** | **기본값** | **설명** |
| --- | --- | --- | --- | --- |
| `page` | `number` | 선택 | `1` | 글 목록 페이지 번호 |
| `limit` | `number` | 선택 | `5` | 한 페이지당 글 수 |

---

### 4. Response (응답)

**성공 (200 OK)**

- 게시글 상세 조회에 성공했을 때 반환합니다.

```json
{
  "success": true,
  "post": {
    "id": "1",
    "blog_id": "1",
    "category_id": "3",
    "title": "글 제목",
    "content": "본문 전체",
    "status": "published",
    "view_count": 10,
    "published_at": "2026-04-10T12:00:00.000Z",
    "likes": [],
    "comments": []
  },
  "postList": {
    "pagination": {
      "page": 1,
      "limit": 5,
      "totalCount": 20,
      "totalPage": 4
    },
    "data": [
      {
        "id": "2",
        "title": "다른 글",
        "_count": { "comments": 3 }
      }
    ]
  }
}
```

**실패 (404 Not Found)**

- 해당 ID의 게시글이 존재하지 않을 때 반환합니다.

```json
{
  "message": "게시물이 존재하지 않습니다."
}
```

**실패 (500 Internal Server Error)**

- 서버 내부 오류 발생 시 반환합니다.

```json
{
  "message": "게시물 조회 실패..."
}
```

---

---

## API 명세서: 게시글 수정

### 1. 기본 정보

- **Method:** `PUT`
- **Endpoint:** `/api/posts/{postId}`
- **Content-Type:** `application/json`
- **인증:** 필요 (NextAuth 세션, 본인 글만 수정 가능)
- **설명:** 특정 게시글의 제목, 내용, 카테고리, 상태 등을 수정합니다.

---

### 2. Path Parameter

| **파라미터명** | **타입** | **필수 여부** | **설명** |
| --- | --- | --- | --- |
| `postId` | `number` | **필수** | 수정할 게시글의 고유 ID |

### 3. Request Body

| **파라미터명** | **타입** | **필수 여부** | **설명** |
| --- | --- | --- | --- |
| `title` | `string` | 선택 | 게시글 제목 |
| `content` | `string` | 선택 | 게시글 본문 |
| `categoryId` | `number \| null` | 선택 | 카테고리 ID (`null`이면 미분류) |
| `representativeImageId` | `number` | 선택 | 대표 이미지 ID |
| `status` | `string` | 선택 | `"draft"` 또는 `"published"` |

---

### 4. Response (응답)

**성공 (200 OK)**

- 게시글 수정에 성공했을 때 반환합니다.

```json
{
  "message": "게시물 수정에 성공했습니다.",
  "post": {
    "id": "1",
    "title": "수정된 제목",
    "content": "수정된 내용",
    "status": "published"
  }
}
```

**실패 (400 Bad Request)**

- 수정할 게시글을 찾을 수 없거나 카테고리가 유효하지 않을 때 반환합니다.

```json
{
  "message": "수정할 게시물을 찾을 수 없습니다."
}
```

**실패 (401 Unauthorized)**

```json
{
  "message": "로그인이 필요합니다."
}
```

**실패 (403 Forbidden)**

- 본인의 게시글이 아닌 경우 반환합니다.

```json
{
  "message": "수정 권한이 없습니다."
}
```

**실패 (500 Internal Server Error)**

```json
{
  "message": "게시물 수정에 실패했습니다."
}
```

---

---

## API 명세서: 게시글 삭제

### 1. 기본 정보

- **Method:** `DELETE`
- **Endpoint:** `/api/posts/{postId}`
- **Content-Type:** `application/json`
- **인증:** 필요 (NextAuth 세션, 본인 글만 삭제 가능)
- **설명:** 특정 게시글을 삭제합니다. 관련 댓글, 공감, 태그 매핑도 Cascade로 함께 삭제됩니다.

---

### 2. Path Parameter

| **파라미터명** | **타입** | **필수 여부** | **설명** |
| --- | --- | --- | --- |
| `postId` | `number` | **필수** | 삭제할 게시글의 고유 ID |

---

### 3. Response (응답)

**성공 (200 OK)**

```json
{
  "message": "게시물 삭제 완료!"
}
```

**실패 (400 Bad Request)**

```json
{
  "message": "삭제할 게시물을 찾을 수 없습니다."
}
```

**실패 (401 Unauthorized)**

```json
{
  "message": "로그인이 필요합니다."
}
```

**실패 (403 Forbidden)**

```json
{
  "message": "삭제 권한이 없습니다."
}
```

**실패 (500 Internal Server Error)**

```json
{
  "message": "게시물 삭제 실패..."
}
```

---

---

## API 명세서: 블로그 메인 정보 조회

### 1. 기본 정보

- **Method:** `GET`
- **Endpoint:** `/api/blogs/{blogId}`
- **Content-Type:** `application/json`
- **인증:** 불필요
- **설명:** 특정 블로그의 메인 정보(제목)와 게시글 목록을 페이지네이션하여 조회합니다. 카테고리별 필터링을 지원합니다.

---

### 2. Path Parameter

| **파라미터명** | **타입** | **필수 여부** | **설명** |
| --- | --- | --- | --- |
| `blogId` | `number` | **필수** | 조회할 블로그의 고유 ID |

### 3. Query Parameter

| **파라미터명** | **타입** | **필수 여부** | **기본값** | **설명** |
| --- | --- | --- | --- | --- |
| `category_id` | `number` | 선택 | 전체 | 카테고리 ID로 필터링 |
| `page` | `number` | 선택 | `1` | 페이지 번호 |
| `limit` | `number` | 선택 | `5` | 한 페이지당 게시글 수 |

---

### 4. Response (응답)

**성공 (200 OK)**

```json
{
  "message": "블로그 메인 정보 조회 성공!",
  "postList": {
    "pagination": {
      "page": 1,
      "limit": 5,
      "totalCount": 30,
      "totalPage": 6
    },
    "data": {
      "title": "길동의 블로그",
      "posts": [
        {
          "id": "1",
          "title": "글 제목",
          "content": "본문",
          "published_at": "2026-04-10T12:00:00.000Z",
          "comments": [],
          "likes": []
        }
      ]
    }
  }
}
```

**실패 (400 Bad Request)**

- `blogId`가 숫자가 아닌 경우 반환합니다.

```json
{
  "message": "blogId가 유효하지 않습니다."
}
```

**실패 (404 Not Found)**

```json
{
  "message": "블로그가 존재하지 않습니다."
}
```

**실패 (500 Internal Server Error)**

```json
{
  "message": "블로그 메인 정보 조회 실패..."
}
```

---

---

## API 명세서: 카테고리 목록 조회

### 1. 기본 정보

- **Method:** `GET`
- **Endpoint:** `/api/blogs/{blogId}/categories`
- **Content-Type:** `application/json`
- **인증:** 불필요
- **설명:** 특정 블로그의 카테고리 목록을 순서(`order_index`)에 따라 조회합니다.

---

### 2. Path Parameter

| **파라미터명** | **타입** | **필수 여부** | **설명** |
| --- | --- | --- | --- |
| `blogId` | `number` | **필수** | 조회할 블로그의 고유 ID |

---

### 3. Response (응답)

**성공 (200 OK)**

```json
{
  "success": true,
  "categories": [
    {
      "id": "1",
      "parent_id": null,
      "name": "개발",
      "type": "default",
      "is_representative": true,
      "order_index": 0,
      "created_at": "2026-04-01T00:00:00.000Z"
    },
    {
      "id": "2",
      "parent_id": "1",
      "name": "JavaScript",
      "type": "default",
      "is_representative": false,
      "order_index": 1,
      "created_at": "2026-04-01T00:00:00.000Z"
    }
  ]
}
```

**실패 (500 Internal Server Error)**

```json
{
  "success": false,
  "error": "카테고리를 불러오는데 실패했습니다."
}
```

---

---

## API 명세서: 카테고리 순서 변경

### 1. 기본 정보

- **Method:** `PUT`
- **Endpoint:** `/api/blogs/{blogId}/categories`
- **Content-Type:** `application/json`
- **인증:** 필요 (NextAuth 세션)
- **설명:** 특정 블로그의 카테고리 순서를 일괄 변경합니다.

---

### 2. Path Parameter

| **파라미터명** | **타입** | **필수 여부** | **설명** |
| --- | --- | --- | --- |
| `blogId` | `number` | **필수** | 블로그의 고유 ID |

### 3. Request Body

| **파라미터명** | **타입** | **필수 여부** | **설명** |
| --- | --- | --- | --- |
| `categories` | `array` | **필수** | `{ id: number, orderIndex: number }` 객체 배열 |

요청 예시:

```json
{
  "categories": [
    { "id": 1, "orderIndex": 1 },
    { "id": 2, "orderIndex": 0 }
  ]
}
```

---

### 4. Response (응답)

**성공 (200 OK)**

```json
{
  "message": "카테고리 순서 변경 완료!",
  "blogId": 1
}
```

**실패 (400 Bad Request)**

```json
{
  "message": "blogId가 유효하지 않습니다."
}
```

**실패 (401 Unauthorized)**

```json
{
  "message": "로그인이 필요합니다."
}
```

**실패 (404 Not Found)**

```json
{
  "message": "블로그가 존재하지 않습니다."
}
```

**실패 (500 Internal Server Error)**

```json
{
  "message": "카테고리 순서 변경 실패..."
}
```

---

---

## API 명세서: 카테고리 생성

### 1. 기본 정보

- **Method:** `POST`
- **Endpoint:** `/api/blogs/{blogId}/categories`
- **Content-Type:** `application/json`
- **인증:** 필요 (NextAuth 세션)
- **설명:** 특정 블로그에 "새 카테고리"라는 기본 이름으로 카테고리를 생성합니다. 순서는 기존 최대값 + 1로 자동 설정됩니다.

---

### 2. Path Parameter

| **파라미터명** | **타입** | **필수 여부** | **설명** |
| --- | --- | --- | --- |
| `blogId` | `number` | **필수** | 카테고리를 추가할 블로그 ID |

---

### 3. Response (응답)

**성공 (201 Created)**

```json
{
  "message": "카테고리 생성 완료!",
  "category": {
    "id": "5",
    "blog_id": "1",
    "parent_id": null,
    "name": "새 카테고리",
    "type": "default",
    "is_representative": false,
    "order_index": 3,
    "created_at": "2026-04-17T12:00:00.000Z"
  }
}
```

**실패 (401 Unauthorized)**

```json
{
  "message": "로그인이 필요합니다."
}
```

**실패 (500 Internal Server Error)**

```json
{
  "message": "카테고리 생성 실패..."
}
```

---

---

## API 명세서: 카테고리 수정

### 1. 기본 정보

- **Method:** `PUT`
- **Endpoint:** `/api/categories/{categoryId}`
- **Content-Type:** `application/json`
- **인증:** 필요 (NextAuth 세션, 본인 블로그 카테고리만 수정 가능)
- **설명:** 카테고리의 이름, 타입, 상위 카테고리, 대표 카테고리 여부를 수정합니다.

---

### 2. Path Parameter

| **파라미터명** | **타입** | **필수 여부** | **설명** |
| --- | --- | --- | --- |
| `categoryId` | `number` | **필수** | 수정할 카테고리의 고유 ID |

### 3. Request Body

| **파라미터명** | **타입** | **필수 여부** | **설명** |
| --- | --- | --- | --- |
| `name` | `string` | 선택 | 카테고리 이름 |
| `type` | `string` | 선택 | 카테고리 타입 (`"default"` 등) |
| `parentId` | `number \| null` | 선택 | 상위 카테고리 ID |
| `isRepresentative` | `boolean` | 선택 | 대표 카테고리 여부 |

---

### 4. Response (응답)

**성공 (200 OK)**

```json
{
  "message": "카테고리 수정 완료!",
  "category": {
    "id": "3",
    "blog_id": "1",
    "parent_id": null,
    "name": "수정된 카테고리",
    "type": "default",
    "is_representative": false,
    "order_index": 1,
    "created_at": "2026-04-01T00:00:00.000Z"
  }
}
```

**실패 (400 Bad Request)**

```json
{
  "message": "수정할 카테고리를 찾을 수 없습니다."
}
```

**실패 (401 Unauthorized)**

```json
{
  "message": "로그인이 필요합니다."
}
```

**실패 (403 Forbidden)**

- 본인 블로그의 카테고리가 아닌 경우 반환합니다.

```json
{
  "message": "수정 권한이 없습니다."
}
```

**실패 (500 Internal Server Error)**

```json
{
  "message": "카테고리 수정 실패..."
}
```

---

---

## API 명세서: 카테고리 삭제

### 1. 기본 정보

- **Method:** `DELETE`
- **Endpoint:** `/api/categories/{categoryId}`
- **Content-Type:** `application/json`
- **인증:** 필요 (NextAuth 세션, 본인 블로그 카테고리만 삭제 가능)
- **설명:** 카테고리를 삭제합니다. 하위 카테고리도 Cascade로 함께 삭제됩니다. 해당 카테고리의 게시글은 미분류(`category_id = null`)로 변경됩니다.

---

### 2. Path Parameter

| **파라미터명** | **타입** | **필수 여부** | **설명** |
| --- | --- | --- | --- |
| `categoryId` | `number` | **필수** | 삭제할 카테고리의 고유 ID |

---

### 3. Response (응답)

**성공 (200 OK)**

```json
{
  "message": "카테고리 삭제가 완료되었습니다."
}
```

**실패 (400 Bad Request)**

```json
{
  "message": "삭제할 카테고리를 찾을 수 없습니다."
}
```

**실패 (401 Unauthorized)**

```json
{
  "message": "로그인이 필요합니다."
}
```

**실패 (403 Forbidden)**

```json
{
  "message": "삭제 권한이 없습니다."
}
```

**실패 (500 Internal Server Error)**

```json
{
  "message": "카테고리 삭제에 실패했습니다."
}
```

---

---

## API 명세서: 댓글 목록 조회

### 1. 기본 정보

- **Method:** `GET`
- **Endpoint:** `/api/posts/{postId}/comments`
- **Content-Type:** `application/json`
- **인증:** 불필요
- **설명:** 특정 게시글의 댓글을 페이지네이션하여 조회합니다. 최상위 댓글 기준으로 페이지네이션되며, 각 댓글의 대댓글(children)이 함께 반환됩니다. 삭제된 댓글은 `content`가 `null`로 반환됩니다.

---

### 2. Path Parameter

| **파라미터명** | **타입** | **필수 여부** | **설명** |
| --- | --- | --- | --- |
| `postId` | `number` | **필수** | 댓글을 조회할 게시글의 고유 ID |

### 3. Query Parameter

| **파라미터명** | **타입** | **필수 여부** | **기본값** | **설명** |
| --- | --- | --- | --- | --- |
| `page` | `number` | 선택 | `1` | 페이지 번호 |
| `limit` | `number` | 선택 | `20` | 한 페이지당 최상위 댓글 수 |

---

### 4. Response (응답)

**성공 (200 OK)**

- 댓글 조회에 성공했을 때 반환합니다.

```json
{
  "success": true,
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalCount": 5,
    "totalPages": 1
  },
  "comments": [
    {
      "id": "7",
      "content": "좋은 글입니다.",
      "isDeleted": false,
      "createdAt": "2026-04-17T12:00:00.000Z",
      "updatedAt": "2026-04-17T12:00:00.000Z",
      "user": {
        "id": "2",
        "nickname": "userB",
        "profileImg": "https://example.com/b.png"
      },
      "children": [
        {
          "id": "8",
          "content": "감사합니다!",
          "isDeleted": false,
          "createdAt": "2026-04-17T12:01:00.000Z",
          "updatedAt": "2026-04-17T12:01:00.000Z",
          "user": {
            "id": "1",
            "nickname": "userA",
            "profileImg": "https://example.com/a.png"
          }
        }
      ]
    }
  ]
}
```

**실패 (400 Bad Request)**

- `postId`가 유효하지 않을 때 반환합니다.

```json
{
  "message": "Path Parameter가 유효하지 않습니다."
}
```

**실패 (404 Not Found)**

- 해당 ID의 게시글이 존재하지 않을 때 반환합니다.

```json
{
  "message": "게시물이 존재하지 않습니다."
}
```

**실패 (500 Internal Server Error)**

- 서버 내부 오류 발생 시 반환합니다.

```json
{
  "message": "댓글 조회 실패..."
}
```

---

---

## API 명세서: 댓글 작성

### 1. 기본 정보

- **Method:** `POST`
- **Endpoint:** `/api/posts/{postId}/comments`
- **Content-Type:** `application/json`
- **인증:** 필요 (NextAuth 세션)
- **설명:** 특정 게시글에 댓글 또는 대댓글을 작성합니다. 댓글 작성 시 게시글 작성자 또는 부모 댓글 작성자에게 알림이 자동 생성됩니다.

---

### 2. Path Parameter

| **파라미터명** | **타입** | **필수 여부** | **설명** |
| --- | --- | --- | --- |
| `postId` | `number` | **필수** | 댓글을 작성할 게시글 ID |

### 3. Request Body

| **파라미터명** | **타입** | **필수 여부** | **설명** |
| --- | --- | --- | --- |
| `content` | `string` | **필수** | 댓글 내용 |
| `parentId` | `number \| null` | **필수** | 상위 댓글 ID (`null`이면 최상위 댓글) |

---

### 4. Response (응답)

**성공 (201 Created)**

```json
{
  "message": "댓글 생성 성공!",
  "commentId": "10",
  "notificationId": "5"
}
```

**성공 (201 Created)** — 부모 댓글 작성자가 탈퇴한 경우

```json
{
  "message": "댓글 생성 성공! (알림 발송 대상 없음)",
  "commentId": "10"
}
```

**실패 (400 Bad Request)**

- 필수 항목 누락 또는 `parentId`가 유효하지 않을 때 반환합니다.

```json
{
  "message": "필수 항목(내용)이 누락되었습니다."
}
```

```json
{
  "message": "상위 댓글 ID 항목이 유효하지 않습니다."
}
```

**실패 (401 Unauthorized)**

```json
{
  "message": "로그인이 필요합니다."
}
```

**실패 (500 Internal Server Error)**

```json
{
  "message": "댓글 생성 실패..."
}
```

---

---

## API 명세서: 댓글 수정

### 1. 기본 정보

- **Method:** `PUT`
- **Endpoint:** `/api/comments/{commentId}`
- **Content-Type:** `application/json`
- **인증:** 필요 (NextAuth 세션, 본인 댓글만 수정 가능)
- **설명:** 특정 댓글의 내용을 수정합니다.

---

### 2. Path Parameter

| **파라미터명** | **타입** | **필수 여부** | **설명** |
| --- | --- | --- | --- |
| `commentId` | `number` | **필수** | 수정할 댓글의 고유 ID |

### 3. Request Body

| **파라미터명** | **타입** | **필수 여부** | **설명** |
| --- | --- | --- | --- |
| `content` | `string` | **필수** | 수정할 댓글 내용 |

---

### 4. Response (응답)

**성공 (200 OK)**

```json
{
  "message": "댓글 수정 완료!",
  "comment": {
    "id": "7",
    "content": "수정된 댓글",
    "updated_at": "2026-04-17T12:00:00.000Z"
  }
}
```

**실패 (400 Bad Request)**

```json
{
  "message": "수정할 댓글을 찾을 수 없습니다."
}
```

**실패 (401 Unauthorized)**

```json
{
  "message": "로그인이 필요합니다."
}
```

**실패 (403 Forbidden)**

```json
{
  "message": "수정 권한이 없습니다."
}
```

**실패 (500 Internal Server Error)**

```json
{
  "message": "댓글 수정 실패..."
}
```

---

---

## API 명세서: 댓글 삭제

### 1. 기본 정보

- **Method:** `DELETE`
- **Endpoint:** `/api/comments/{commentId}`
- **Content-Type:** `application/json`
- **인증:** 필요 (NextAuth 세션, 본인 댓글만 삭제 가능)
- **설명:** 특정 댓글을 삭제합니다. 하위 대댓글도 Cascade로 함께 삭제됩니다.

---

### 2. Path Parameter

| **파라미터명** | **타입** | **필수 여부** | **설명** |
| --- | --- | --- | --- |
| `commentId` | `number` | **필수** | 삭제할 댓글의 고유 ID |

---

### 3. Response (응답)

**성공 (200 OK)**

```json
{
  "message": "댓글 삭제 완료!"
}
```

**실패 (400 Bad Request)**

```json
{
  "message": "삭제할 댓글을 찾을 수 없습니다."
}
```

**실패 (401 Unauthorized)**

```json
{
  "message": "로그인이 필요합니다."
}
```

**실패 (403 Forbidden)**

```json
{
  "message": "삭제 권한이 없습니다."
}
```

**실패 (500 Internal Server Error)**

```json
{
  "message": "댓글 삭제 실패..."
}
```

---

---

## API 명세서: 공감 생성

### 1. 기본 정보

- **Method:** `POST`
- **Endpoint:** `/api/posts/{postId}/likes`
- **Content-Type:** `application/json`
- **인증:** 필요 (NextAuth 세션)
- **설명:** 특정 게시글에 공감을 추가합니다. 게시글 작성자에게 알림이 자동 생성됩니다.

---

### 2. Path Parameter

| **파라미터명** | **타입** | **필수 여부** | **설명** |
| --- | --- | --- | --- |
| `postId` | `number` | **필수** | 공감할 게시글의 고유 ID |

---

### 3. Response (응답)

**성공 (201 Created)**

```json
{
  "message": "공감 생성 완료!",
  "likeId": "5"
}
```

**실패 (401 Unauthorized)**

```json
{
  "message": "로그인이 필요합니다."
}
```

**실패 (409 Conflict)**

- 이미 공감한 게시글에 중복 요청한 경우 반환합니다.

```json
{
  "message": "이미 공감한 게시물입니다."
}
```

**실패 (500 Internal Server Error)**

```json
{
  "message": "공감 생성 실패..."
}
```

---

---

## API 명세서: 공감 삭제

### 1. 기본 정보

- **Method:** `DELETE`
- **Endpoint:** `/api/likes/{likeId}`
- **Content-Type:** `application/json`
- **인증:** 필요 (NextAuth 세션, 본인 공감만 삭제 가능)
- **설명:** 특정 공감을 삭제(취소)합니다.

---

### 2. Path Parameter

| **파라미터명** | **타입** | **필수 여부** | **설명** |
| --- | --- | --- | --- |
| `likeId` | `number` | **필수** | 삭제할 공감의 고유 ID |

---

### 3. Response (응답)

**성공 (200 OK)**

```json
{
  "message": "공감 삭제 성공!"
}
```

**실패 (400 Bad Request)**

```json
{
  "message": "공감이 존재하지 않습니다."
}
```

**실패 (401 Unauthorized)**

```json
{
  "message": "로그인이 필요합니다."
}
```

**실패 (403 Forbidden)**

```json
{
  "message": "공감 삭제 권한이 없습니다."
}
```

**실패 (500 Internal Server Error)**

```json
{
  "message": "공감 삭제 실패..."
}
```

---

---

## API 명세서: 이웃 추가

### 1. 기본 정보

- **Method:** `POST`
- **Endpoint:** `/api/neighbors/{toBlogId}`
- **Content-Type:** `application/json`
- **인증:** 필요 (NextAuth 세션)
- **설명:** 특정 블로그를 이웃(유니버스)으로 추가합니다. 상대에게 알림이 자동 생성되며, 상대가 이미 나를 추가한 상태라면 "친구" 알림이 양쪽에 생성됩니다.

---

### 2. Path Parameter

| **파라미터명** | **타입** | **필수 여부** | **설명** |
| --- | --- | --- | --- |
| `toBlogId` | `number` | **필수** | 이웃 추가할 블로그의 고유 ID |

---

### 3. Response (응답)

**성공 (201 Created)**

```json
{
  "message": "이웃 설정 완료!",
  "relationId": "3",
  "toBlogNotiId": "10",
  "fromBlogNotiId": "11"
}
```

> `fromBlogNotiId`는 상대가 이미 나를 추가한 상태(상호 친구)일 때만 포함됩니다.

**실패 (400 Bad Request)**

- 자기 자신을 이웃 추가하려는 경우 반환합니다.

```json
{
  "message": "자기 자신을 이웃추가할 수 없습니다."
}
```

**실패 (401 Unauthorized)**

```json
{
  "message": "로그인이 필요합니다."
}
```

**실패 (404 Not Found)**

```json
{
  "message": "상대 블로그 정보가 없습니다."
}
```

**실패 (409 Conflict)**

- 이미 이웃 설정된 블로그에 중복 요청한 경우 반환합니다.

```json
{
  "message": "이미 이웃 설정된 블로그입니다."
}
```

**실패 (500 Internal Server Error)**

```json
{
  "message": "이웃 설정 실패..."
}
```

---

---

## API 명세서: 이웃 목록 조회

### 1. 기본 정보

- **Method:** `GET`
- **Endpoint:** `/api/neighbors`
- **Content-Type:** `application/json`
- **인증:** 필요 (세션 쿠키)
- **설명:** 로그인한 사용자가 발견한 이웃 블로그 목록을 조회합니다. 상대가 나를 발견했는지 여부(상호 여부)를 포함합니다.

---

### 2. Query Parameters

| **파라미터명** | **타입** | **필수 여부** | **설명** |
| --- | --- | --- | --- |
| `page` | `number` | 선택 | 페이지 번호 (기본값: 1) |
| `limit` | `number` | 선택 | 페이지당 항목 수 (기본값: 20) |
| `filter` | `string` | 선택 | `"mutual"` (상호), `"one-way"` (일방향), 미지정 시 전체 |

---

### 3. Response

#### 성공 (200)

```json
{
  "success": true,
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalCount": 2,
    "totalPages": 1
  },
  "neighbors": [
    {
      "relationId": "1",
      "isMutual": true,
      "discoveredAt": "2026-04-16T07:47:00.585Z",
      "blog": {
        "id": "2",
        "title": "상대 블로그 제목",
        "urlSlug": "user-b",
        "description": "블로그 설명",
        "user": {
          "id": "3",
          "nickname": "userB",
          "profileImg": null
        }
      }
    }
  ]
}
```

#### 실패 — 인증 없음 (401)

```json
{
  "message": "로그인이 필요합니다."
}
```

#### 실패 — 블로그 없음 (404)

```json
{
  "message": "사용자 블로그 정보가 없습니다."
}
```

#### 실패 — 서버 오류 (500)

```json
{
  "message": "이웃 목록 조회 실패..."
}
```

---

## API 명세서: 이웃 삭제

### 1. 기본 정보

- **Method:** `DELETE`
- **Endpoint:** `/api/neighbors/{toBlogId}`
- **Content-Type:** `application/json`
- **인증:** 필요 (NextAuth 세션)
- **설명:** 특정 블로그와의 이웃 관계를 삭제합니다. 본인이 추가한 이웃 관계(`from_blog_id = 내 블로그`)만 삭제할 수 있습니다.

---

### 2. Path Parameter

| **파라미터명** | **타입** | **필수 여부** | **설명** |
| --- | --- | --- | --- |
| `toBlogId` | `number` | **필수** | 이웃 관계를 해제할 상대 블로그의 고유 ID |

---

### 3. Response (응답)

**성공 (200 OK)**

```json
{
  "message": "이웃 삭제 완료!"
}
```

**실패 (400 Bad Request)**

- `toBlogId`가 유효하지 않을 때 반환합니다.

```json
{
  "message": "Path Parameter가 유효하지 않습니다."
}
```

**실패 (401 Unauthorized)**

```json
{
  "message": "로그인이 필요합니다."
}
```

**실패 (404 Not Found)**

- 이웃 관계가 존재하지 않거나, 사용자 블로그 정보가 없을 때 반환합니다.

```json
{
  "message": "이웃 관계가 존재하지 않습니다."
}
```

**실패 (500 Internal Server Error)**

```json
{
  "message": "이웃 삭제 실패..."
}
```

---

---

## API 명세서: 알림 읽음 처리

### 1. 기본 정보

- **Method:** `PUT`
- **Endpoint:** `/api/notifications/{notificationId}`
- **Content-Type:** `application/json`
- **인증:** 필요 (NextAuth 세션, 본인 알림만 수정 가능)
- **설명:** 특정 알림을 읽음 상태로 변경합니다.

---

### 2. Path Parameter

| **파라미터명** | **타입** | **필수 여부** | **설명** |
| --- | --- | --- | --- |
| `notificationId` | `number` | **필수** | 읽음 처리할 알림의 고유 ID |

---

### 3. Response (응답)

**성공 (200 OK)**

```json
{
  "message": "알림 읽음 처리 완료!"
}
```

**실패 (400 Bad Request)**

- `notificationId`가 유효하지 않을 때 반환합니다.

```json
{
  "message": "유효하지 않은 ID입니다."
}
```

**실패 (401 Unauthorized)**

```json
{
  "message": "로그인이 필요합니다."
}
```

**실패 (403 Forbidden)**

```json
{
  "message": "알림 변경 권한이 없습니다."
}
```

**실패 (404 Not Found)**

```json
{
  "message": "알림이 존재하지 않습니다."
}
```

**실패 (500 Internal Server Error)**

```json
{
  "message": "알림 읽음 처리 실패..."
}
```

---

---

## API 명세서: 알림 삭제

### 1. 기본 정보

- **Method:** `DELETE`
- **Endpoint:** `/api/notifications/{notificationId}`
- **Content-Type:** `application/json`
- **인증:** 필요 (NextAuth 세션, 본인 알림만 삭제 가능)
- **설명:** 특정 알림을 삭제합니다.

---

### 2. Path Parameter

| **파라미터명** | **타입** | **필수 여부** | **설명** |
| --- | --- | --- | --- |
| `notificationId` | `number` | **필수** | 삭제할 알림의 고유 ID |

---

### 3. Response (응답)

**성공 (200 OK)**

```json
{
  "message": "알림 삭제 완료!"
}
```

**실패 (400 Bad Request)**

```json
{
  "message": "유효하지 않은 ID입니다."
}
```

**실패 (401 Unauthorized)**

```json
{
  "message": "로그인이 필요합니다."
}
```

**실패 (403 Forbidden)**

```json
{
  "message": "알림 삭제 권한이 없습니다."
}
```

**실패 (404 Not Found)**

```json
{
  "message": "알림이 존재하지 않습니다."
}
```

**실패 (500 Internal Server Error)**

```json
{
  "message": "알림 삭제 실패..."
}
```

---

---

## API 명세서: 내 알림 목록 조회

### 1. 기본 정보

- **Method:** `GET`
- **Endpoint:** `/api/users/{userId}/notifications`
- **Content-Type:** `application/json`
- **인증:** 필요 (NextAuth 세션)
- **설명:** 로그인한 사용자의 알림 목록을 페이지네이션하여 조회합니다. 읽지 않은 알림이 먼저 표시되고, 같은 그룹 내에서는 최신순으로 정렬됩니다.

---

### 2. Query Parameter

| **파라미터명** | **타입** | **필수 여부** | **기본값** | **설명** |
| --- | --- | --- | --- | --- |
| `page` | `number` | 선택 | `1` | 페이지 번호 |
| `limit` | `number` | 선택 | `10` | 한 페이지당 알림 수 |

---

### 3. Response (응답)

**성공 (200 OK)**

```json
{
  "success": true,
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalCount": 25,
    "totalPages": 3,
    "unreadCount": 5
  },
  "notifications": [
    {
      "id": "1",
      "userId": "7",
      "actorId": "8",
      "actorName": "유저B",
      "actorNickname": "userB",
      "type": "COMMENT",
      "targetUrl": "/20",
      "message": "userB님이 첫 번째 글에 댓글을 남겼습니다.",
      "isRead": false,
      "createdAt": "2026-04-17T12:00:00.000Z"
    }
  ]
}
```

> 알림 타입(`type`): `COMMENT` (댓글), `LIKE` (공감), `REPLY` (대댓글), `NEIGHBOR` (이웃 추가)

**실패 (401 Unauthorized)**

```json
{
  "message": "로그인이 필요합니다."
}
```

**실패 (500 Internal Server Error)**

```json
{
  "message": "내 소식 조회 실패..."
}
```

---

---

## API 명세서: 유니버스 새 글 조회

### 1. 기본 정보

- **Method:** `GET`
- **Endpoint:** `/api/feeds/universe`
- **Content-Type:** `application/json`
- **인증:** 필요 (NextAuth 세션)
- **설명:** 로그인한 사용자가 이웃으로 추가한 블로그들의 최신 게시글을 조회합니다.

---

### 2. Query Parameter

| **파라미터명** | **타입** | **필수 여부** | **기본값** | **설명** |
| --- | --- | --- | --- | --- |
| `limit` | `number` | 선택 | `10` | 가져올 게시글 수 |

---

### 3. Response (응답)

**성공 (200 OK)**

```json
{
  "success": true,
  "status": 200,
  "posts": [
    {
      "title": "이웃의 글 제목",
      "content": "글 내용",
      "published_at": "2026-04-16T12:00:00.000Z",
      "representative_image_id": 0,
      "blog_title": "이웃의 블로그",
      "writer_nickname": "neighbor1"
    }
  ]
}
```

**실패 (401 Unauthorized)**

```json
{
  "message": "로그인이 필요합니다."
}
```

**실패 (404 Not Found)**

- 로그인한 사용자의 블로그가 없을 때 반환합니다.

```json
{
  "message": "블로그 정보가 없습니다."
}
```

**실패 (500 Internal Server Error)**

```json
{
  "message": "피드 조회 실패..."
}
```

---

---

## API 명세서: 유니버스(이웃) 정보 조회

### 1. 기본 정보

- **Method:** `GET`
- **Endpoint:** `/api/universe`
- **Content-Type:** `application/json`
- **인증:** 필요 (NextAuth 세션)
- **설명:** 로그인한 사용자가 이웃으로 추가한 사용자들의 이름, 닉네임, 프로필 이미지를 조회합니다.

---

### 2. Request Parameter

없음

---

### 3. Response (응답)

**성공 (200 OK)**

```json
{
  "message": "유니버스 정보 조회 성공!",
  "data": [
    {
      "name": "유저B",
      "nickname": "userB",
      "profile_img": "https://example.com/b.png"
    }
  ]
}
```

**실패 (401 Unauthorized)**

```json
{
  "message": "로그인이 필요합니다."
}
```

**실패 (500 Internal Server Error)**

```json
{
  "message": "유니버스 정보 조회 실패..."
}
```

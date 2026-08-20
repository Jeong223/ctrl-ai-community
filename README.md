# Ctrl + AI 동호회 워크스페이스

공지, 정보공유, 프로젝트 진행사항, 모임 일정과 익명 회원 구성을 Supabase 공용 DB에서 함께 조회하고 관리하는 Next.js 내부 커뮤니티입니다. GitHub 저장소를 Vercel의 Import Project로 가져오면 무료 플랜 기준으로 배포할 수 있습니다.

## 기술 구성

- Next.js 16 App Router, React 19, TypeScript, Tailwind CSS
- Supabase Postgres, Row Level Security(RLS), `@supabase/supabase-js`
- 회원·관리자 쿠키 권한을 서버에서 검증하는 Next.js Route Handler
- 서명된 HttpOnly 쿠키 기반 회원/관리자 역할
- Node.js 24.x, npm, `package-lock.json`

게시판과 설정 데이터는 브라우저 `localStorage`에 저장하지 않습니다. `localStorage`는 다크모드 같은 UI 설정에만 사용합니다.

## 1. Supabase 프로젝트 준비

1. [Supabase Dashboard](https://supabase.com/dashboard)에서 새 프로젝트를 만듭니다.
2. 프로젝트의 SQL Editor를 엽니다.
3. [supabase/schema.sql](supabase/schema.sql)의 전체 내용을 먼저 실행합니다.
4. 이어서 [supabase/seed.sql](supabase/seed.sql)의 전체 내용을 실행합니다.
5. Project Settings → API에서 Project URL, anon key, service role key를 확인합니다.

`schema.sql`은 다음 테이블을 만듭니다.

| 테이블 | 용도 |
| --- | --- |
| `notices` | 공지사항 |
| `knowledge_posts` | 정보공유 글과 태그·링크 |
| `project_rooms` | 프로젝트 방, 체크리스트, 자료, 회의 메모 |
| `project_updates` | 프로젝트별 진행사항 |
| `gatherings` | 모임 일정과 참석자 |
| `members` | 익명 회원 활동 프로필 |
| `site_settings` | 대시보드와 동호회 소개 편집 문구 |

모든 테이블에는 RLS가 활성화됩니다. `anon`과 `authenticated`에는 `SELECT`만 허용하며 INSERT/UPDATE/DELETE 정책은 만들지 않습니다. 홈페이지의 DB 조회·쓰기 작업은 모두 세션 역할을 확인한 서버 Route Handler가 서버 전용 service role 클라이언트로 수행하며, 브라우저에서 DB를 직접 호출하지 않습니다.

> `SUPABASE_SERVICE_ROLE_KEY`는 RLS를 우회할 수 있는 비밀키입니다. 브라우저 코드, GitHub, 화면 캡처 또는 `NEXT_PUBLIC_` 환경변수에 절대 넣지 마세요.

## 2. 로컬 환경변수와 실행

```powershell
npm install
Copy-Item .env.example .env.local
```

`.env.local`에 실제 값을 입력합니다.

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<Supabase anon key>
SUPABASE_SERVICE_ROLE_KEY=<Supabase service role key>
INVITE_CODE=<회원 접속코드>
MEMBER_PIN_SUFFIX=<개인 회원 코드의 서버 전용 접미부>
ADMIN_ACCESS_CODE=<관리자 접속코드>
AUTH_SECRET=<32자 이상의 충분히 긴 무작위 문자열>
```

PowerShell에서 `AUTH_SECRET`을 만드는 예시입니다.

```powershell
$randomBytes = New-Object byte[] 48
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($randomBytes)
[Convert]::ToBase64String($randomBytes)
```

실행:

```powershell
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다. Supabase 변수가 없으면 익명 예시 화면과 설정 오류 알림은 표시되지만 DB 조회·저장은 동작하지 않습니다. 실제 DB 검증 전에는 반드시 세 Supabase 변수를 설정해야 합니다.

## 3. 인증과 권한

- `INVITE_CODE`로 접속: 개인 식별 없이 전체 페이지 조회, 정보공유 글 작성, 프로젝트 방 생성, 프로젝트 진행사항 추가
- `<회원 이름><MEMBER_PIN_SUFFIX>`로 접속: 공용 회원 권한에 더해 본인 프로필의 관심 분야·AI 도구·참여 프로젝트·한 줄 소개 수정. `MEMBER_PIN_SUFFIX`가 없으면 `INVITE_CODE`를 접미부로 사용
- `ADMIN_ACCESS_CODE`로 접속: 모든 관리 화면과 공용 DB 생성·수정·삭제
- 잘못된 코드: `401` 응답 및 메인 페이지 접근 차단
- 역할 쿠키: `AUTH_SECRET`으로 서명한 HttpOnly 쿠키, 7일 유효

실제 접속코드와 개인 코드 접미부는 README나 Git 추적 파일에 기록하지 말고 `.env.local`과 배포 환경변수에만 보관하세요. 무료 Vercel URL은 인터넷에서 접근 가능하므로 충분히 긴 임의 값을 사용하고 회원 외부에 공개하지 않는 편이 안전합니다. 모든 회원에게 같은 접미부를 사용하면 이름을 아는 회원이 다른 사람의 코드를 추측할 수 있으므로, 이 방식은 간단한 내부 접근 제어이며 강한 사용자별 인증은 아닙니다.

## 4. 검증 명령

```powershell
npm run lint
npm run typecheck
npm run build
npm audit
```

Supabase 연결 후에는 다음도 확인합니다.

1. 공용 회원 코드, 개인 회원 코드와 관리자 코드의 역할이 서로 다른지 확인합니다.
2. 관리자 창에서 테스트 공지를 작성합니다.
3. 다른 브라우저 또는 시크릿 창에 회원 코드로 접속해 새 공지가 보이는지 확인합니다.
4. 프로젝트 방과 진행사항, 모임 일정, 회원정보를 각각 저장하고 새로고침 후 유지되는지 확인합니다.
5. 브라우저 개발자 도구의 Application → Local Storage에 게시판·회원·프로젝트 데이터가 없는지 확인합니다.
6. 테스트 레코드를 삭제하고 두 브라우저 모두에서 삭제 결과를 확인합니다.

## 5. GitHub 저장소 준비

아직 Git 저장소가 아니라면 프로젝트 루트에서 아래 명령을 실행합니다. `<YOUR_REPOSITORY_URL>`은 본인의 빈 GitHub 저장소 주소로 바꿉니다.

```powershell
git init
git add .
git commit -m "Prepare Ctrl AI community for Supabase and Vercel"
git branch -M main
git remote add origin <YOUR_REPOSITORY_URL>
git push -u origin main
```

push 전에 다음 항목이 Git에 포함되지 않았는지 확인합니다.

- `.env.local` 및 `.env.*` 실제 값
- `.next/`, `node_modules/`, `.vercel/`
- service role key와 `AUTH_SECRET`
- 실제 회원 이름, 연락처, 이메일, 사번, 계좌번호
- 카카오톡 대화 원문 또는 개인 첨부파일

`.gitignore`는 `.env*`를 제외하고 변수명만 있는 `.env.example`만 허용하도록 설정되어 있습니다.

## 6. Vercel Import Project 배포

1. [Vercel New Project](https://vercel.com/new)에서 GitHub 저장소를 선택하고 Import합니다.
2. Framework Preset은 `Next.js`, 저장소 루트가 이 폴더라면 Root Directory는 `./`로 둡니다.
3. Build Command는 기본값 또는 `npm run build`를 사용합니다. Install Command와 Output Directory는 자동 감지를 사용합니다.
4. Project Settings → Environment Variables에 아래 값을 등록합니다.

| 이름 | 공개 여부 | 값 |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | 공개 가능 | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 공개 가능 | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | 서버 비밀 | Supabase service role key |
| `INVITE_CODE` | 서버 비밀 | `<회원 접속코드>` |
| `MEMBER_PIN_SUFFIX` | 서버 비밀·선택 | `<개인 회원 코드의 서버 전용 접미부>`; 없으면 `INVITE_CODE` 사용 |
| `ADMIN_ACCESS_CODE` | 서버 비밀 | `<관리자 접속코드>` |
| `AUTH_SECRET` | 서버 비밀 | 32자 이상의 무작위 문자열 |

Production에 필수로 적용하고, Preview에서도 테스트하려면 Preview에도 별도로 적용합니다. 환경변수를 바꾼 뒤에는 새 배포가 필요합니다.

5. Deploy를 누르고 완료 후 회원·관리자 코드와 공용 DB 반영을 검증합니다.

프로젝트 이름을 `ctrl-ai-community`로 정하고 이름이 사용 가능하면 예상 주소는 다음과 같습니다.

```text
https://ctrl-ai-community.vercel.app
```

일반 형식은 `https://프로젝트명.vercel.app`이며 실제 주소는 배포 결과에서 확인합니다.

공식 참고 문서:

- [Supabase Next.js quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Vercel environment variables](https://vercel.com/docs/environment-variables)
- [Vercel Git deployments](https://vercel.com/docs/git)

## 페이지와 공용 데이터

- `/` — 공용 DB의 공지·프로젝트·정보글·모임·회원 통계, 관리자 문구 편집
- `/notices`, `/notices/[id]` — 공지 목록·검색·상세·관리
- `/knowledge`, `/knowledge/[id]` — 정보공유 검색·상세·관리
- `/projects`, `/projects/[id]` — 프로젝트와 진행사항·체크리스트·자료·회의 메모
- `/gatherings` — 예정/지난 모임 및 일정 관리
- `/members` — 익명 회원 활동 정보 관리
- `/about` — 소개 페이지 전체 문구 관리

seed에는 `회원 A`부터 `회원 J`까지의 익명 예시와 일반화한 활동 내용만 들어 있습니다. 실제 개인정보나 원문을 seed에 추가하지 마세요.

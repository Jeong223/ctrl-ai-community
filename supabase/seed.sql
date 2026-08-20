-- Anonymous, non-sensitive starter data. Run after schema.sql.
insert into public.notices (id, title, content, category, pinned, author, created_at) values
('10000000-0000-4000-8000-000000000001', 'Ctrl + AI 동호회 운영 안내', '정기모임과 프로젝트 기록은 공용 게시판에서 확인합니다. 공개 가능한 동호회 활동 정보만 작성해 주세요.', '회칙', true, '운영진', '2026-05-20T09:00:00+09:00'),
('10000000-0000-4000-8000-000000000002', '6월 정기모임 안내', '6월 정기모임에서는 AI 활용 사례를 나누고 향후 활동 주제를 함께 정합니다.', '정기모임', false, '운영진', '2026-06-02T09:00:00+09:00'),
('10000000-0000-4000-8000-000000000003', '2차 정기모임 안내', '두 번째 정기모임에서 정보공유 게시판 운영 방향과 실습 주제를 논의합니다.', '정기모임', false, '운영진', '2026-06-23T09:00:00+09:00'),
('10000000-0000-4000-8000-000000000004', 'AI 지원비 운영방식 안내', '교육, AI 도구, 행사 참가 등에 활용할 지원비의 신청 및 공유 기준을 안내합니다.', '지원비', false, '운영진', '2026-07-05T09:00:00+09:00'),
('10000000-0000-4000-8000-000000000005', '3차 정기모임 안내', '프로젝트 주제 확정과 팀별 킥오프를 진행합니다. 관심 아이디어를 하나씩 준비해 주세요.', '정기모임', true, '운영진', '2026-07-28T09:00:00+09:00'),
('10000000-0000-4000-8000-000000000006', 'AI 미니 프로젝트 팀 구성 및 주제 선정 안내', '10명의 회원을 3명, 3명, 4명으로 나누어 미니 프로젝트를 시작합니다.', '프로젝트', true, '운영진', '2026-08-12T09:00:00+09:00'),
('10000000-0000-4000-8000-000000000007', 'AI 행사/교육 정보 공유 안내', '참여할 만한 AI 행사와 교육 정보는 정보공유 게시판에 요약과 링크를 남겨 주세요.', '교육', false, '운영진', '2026-08-15T09:00:00+09:00'),
('10000000-0000-4000-8000-000000000008', '신규회원 회칙 공유 안내', '서로의 시도와 의견을 존중하고 개인정보 없이 활동 기록을 공유하는 기본 회칙을 확인해 주세요.', '회칙', false, '운영진', '2026-08-18T09:00:00+09:00')
on conflict (id) do update set title = excluded.title, content = excluded.content, category = excluded.category, pinned = excluded.pinned, author = excluded.author;

insert into public.knowledge_posts (id, title, content, tags, links, author, created_at) values
('20000000-0000-4000-8000-000000000001', '좋은 프롬프트를 기록하는 간단한 방법', '목표, 맥락, 제약, 출력 형식을 함께 적고 결과와 수정 이유를 짧게 남겨 보세요.', array['프롬프트', '업무활용'], array[]::text[], '회원 A', '2026-08-10T10:00:00+09:00'),
('20000000-0000-4000-8000-000000000002', '미니 프로젝트 주제 정하기', '한 달 안에 작게 완성할 수 있고 팀원 모두가 확인할 수 있는 결과물을 기준으로 주제를 좁혀 봅니다.', array['프로젝트', '아이디어'], array[]::text[], '회원 B', '2026-08-14T10:00:00+09:00'),
('20000000-0000-4000-8000-000000000003', 'AI 도구 비교 기록 양식', '같은 입력과 평가 기준으로 결과, 걸린 시간, 장단점을 비교하면 다음 선택에 도움이 됩니다.', array['AI도구', '기록'], array[]::text[], '회원 C', '2026-08-17T10:00:00+09:00')
on conflict (id) do update set title = excluded.title, content = excluded.content, tags = excluded.tags, links = excluded.links, author = excluded.author;

insert into public.project_rooms (id, name, description, members, status, goal, next_action, resources, checklist, meeting_notes, created_at) values
('30000000-0000-4000-8000-000000000001', '1조 프로젝트', 'AI를 활용한 업무와 생활 속 작은 문제 해결 아이디어를 탐색합니다.', array['회원 A', '회원 B', '회원 C'], '아이디어', 'AI를 활용한 미니 프로젝트 주제 선정', '각자 후보 주제 한 가지 준비', '[]', '[{"id":"check-1-1","label":"후보 주제 준비","done":false}]', '', '2026-08-12T10:00:00+09:00'),
('30000000-0000-4000-8000-000000000002', '2조 프로젝트', '개인 관심사와 취미에 적용할 수 있는 AI 프로젝트를 기획합니다.', array['회원 D', '회원 E', '회원 F'], '아이디어', 'AI를 활용한 개인/취미/생활 프로젝트 기획', '공통 관심사 세 가지 정리', '[]', '[{"id":"check-2-1","label":"공통 관심사 정리","done":false}]', '', '2026-08-12T10:10:00+09:00'),
('30000000-0000-4000-8000-000000000003', '3조 프로젝트', '콘텐츠나 간단한 서비스로 발전시킬 수 있는 아이디어를 구체화합니다.', array['회원 G', '회원 H', '회원 I', '회원 J'], '아이디어', 'AI를 활용한 콘텐츠 또는 서비스 아이디어 구체화', '사용자와 해결 문제 한 문장으로 정의', '[]', '[{"id":"check-3-1","label":"사용자와 문제 정의","done":false}]', '', '2026-08-12T10:20:00+09:00')
on conflict (id) do update set name = excluded.name, description = excluded.description, members = excluded.members, status = excluded.status, goal = excluded.goal, next_action = excluded.next_action, resources = excluded.resources, checklist = excluded.checklist, meeting_notes = excluded.meeting_notes;

insert into public.project_updates (id, project_id, title, content, created_at) values
('40000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', '팀 구성 완료', '3명의 팀원과 첫 논의 주제를 확인했습니다.', '2026-08-13T10:00:00+09:00'),
('40000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000002', '관심 분야 수집', '각자 관심 있는 생활 프로젝트 분야를 공유했습니다.', '2026-08-14T10:00:00+09:00'),
('40000000-0000-4000-8000-000000000003', '30000000-0000-4000-8000-000000000003', '아이디어 초안', '콘텐츠와 서비스 아이디어 후보를 정리했습니다.', '2026-08-15T10:00:00+09:00')
on conflict (id) do update set title = excluded.title, content = excluded.content;

insert into public.gatherings (id, title, date, time, place, memo, attendees, created_at) values
('50000000-0000-4000-8000-000000000001', '프로젝트 킥오프 모임', '2026-08-28', '18:30', '사내 회의 공간', '팀별 주제 후보와 다음 행동을 공유합니다.', array['회원 A', '회원 D', '회원 G'], '2026-08-12T09:00:00+09:00'),
('50000000-0000-4000-8000-000000000002', '9월 정기모임', '2026-09-24', '18:30', '장소 협의', '프로젝트 중간 결과와 AI 활용 사례를 나눕니다.', array[]::text[], '2026-08-18T09:00:00+09:00')
on conflict (id) do update set title = excluded.title, date = excluded.date, time = excluded.time, place = excluded.place, memo = excluded.memo, attendees = excluded.attendees;

insert into public.members (id, name, role, interest, ai_tools, projects, bio, initials, color, created_at) values
('60000000-0000-4000-8000-000000000001', '회원 A', '소프트웨어', 'AI 자동화', array['ChatGPT', 'Codex'], array['1조 프로젝트'], '작은 자동화를 빠르게 실험합니다.', 'A', 'blue', '2026-05-01T09:00:00+09:00'),
('60000000-0000-4000-8000-000000000002', '회원 B', '디자인', '생성형 디자인', array['ChatGPT'], array['1조 프로젝트'], '아이디어를 시각적인 결과로 연결합니다.', 'B', 'violet', '2026-05-01T09:01:00+09:00'),
('60000000-0000-4000-8000-000000000003', '회원 C', 'CAD', '설계 보조', array['ChatGPT'], array['1조 프로젝트'], '반복 설계 작업의 개선점을 탐색합니다.', 'C', 'cyan', '2026-05-01T09:02:00+09:00'),
('60000000-0000-4000-8000-000000000004', '회원 D', '품질', '문서 분석', array['ChatGPT'], array['2조 프로젝트'], '근거가 분명한 분석과 기록에 관심이 있습니다.', 'D', 'pink', '2026-05-01T09:03:00+09:00'),
('60000000-0000-4000-8000-000000000005', '회원 E', '마케팅', '콘텐츠 기획', array['ChatGPT'], array['2조 프로젝트'], '고객 관점의 메시지를 함께 만듭니다.', 'E', 'orange', '2026-05-01T09:04:00+09:00'),
('60000000-0000-4000-8000-000000000006', '회원 F', '운영', '업무 효율화', array['ChatGPT'], array['2조 프로젝트'], '팀이 지속할 수 있는 운영 방식을 고민합니다.', 'F', 'emerald', '2026-05-01T09:05:00+09:00'),
('60000000-0000-4000-8000-000000000007', '회원 G', '기획', '서비스 아이디어', array['ChatGPT'], array['3조 프로젝트'], '문제와 사용자를 명확하게 정의합니다.', 'G', 'indigo', '2026-05-01T09:06:00+09:00'),
('60000000-0000-4000-8000-000000000008', '회원 H', '콘텐츠', 'AI 콘텐츠', array['ChatGPT'], array['3조 프로젝트'], '배운 내용을 이해하기 쉽게 나눕니다.', 'H', 'sky', '2026-05-01T09:07:00+09:00'),
('60000000-0000-4000-8000-000000000009', '회원 I', '데이터', '데이터 시각화', array['ChatGPT', 'Codex'], array['3조 프로젝트'], '데이터에서 의미 있는 흐름을 찾습니다.', 'I', 'teal', '2026-05-01T09:08:00+09:00'),
('60000000-0000-4000-8000-000000000010', '회원 J', '기타', 'AI 학습', array['ChatGPT'], array['3조 프로젝트'], '새로운 도구를 직접 써보며 배웁니다.', 'J', 'amber', '2026-05-01T09:09:00+09:00')
on conflict (id) do update set name = excluded.name, role = excluded.role, interest = excluded.interest, ai_tools = excluded.ai_tools, projects = excluded.projects, bio = excluded.bio, initials = excluded.initials, color = excluded.color;

insert into public.site_settings (key, value) values
('dashboard', $json${"kicker":"Ctrl + AI Workspace","titleLine1":"함께 배우고, 실험하고,","titleHighlight":"새로운 가능성을 만듭니다.","description":"정보는 모으고, 아이디어는 나누고, 프로젝트는 끝까지. Ctrl + AI의 모든 활동을 한곳에서 이어가세요.","monthlyFocus":"미니 프로젝트 시작하기"}$json$::jsonb),
('about', $json${"pageEyebrow":"About us","pageTitle":"동호회 소개","pageDescription":"AI에 대한 호기심을 동료와 나누고, 배움이 실제 결과물로 이어지는 공간입니다.","heroEyebrow":"Ctrl + AI Community","heroTitleLine1":"호기심을 연결하면","heroTitleLine2":"새로운 가능성이 됩니다.","heroDescription":"다양한 직무가 모여 AI를 배우고, 활용 경험을 나누고, 함께 만들며 성장하는 내부 커뮤니티입니다.","values":[{"id":"capability","title":"AI 활용 역량","description":"도구를 직접 써보고 일과 일상에 적용하는 힘을 기릅니다."},{"id":"knowledge","title":"지식의 연결","description":"흘러가는 정보를 다시 찾을 수 있는 경험과 자료로 남깁니다."},{"id":"action","title":"작은 실행","description":"완벽한 계획보다 작게 만들고 빠르게 배우는 프로젝트를 지향합니다."},{"id":"growth","title":"함께 성장","description":"직무와 숙련도에 관계없이 서로의 관점과 시도를 존중합니다."}],"directionEyebrow":"How we work","directionTitleLine1":"배움이 멈추지 않는","directionTitleLine2":"운영 방식","directionDescription":"정해진 답보다 함께 탐색하는 과정을 소중히 여깁니다.","directions":[{"id":"monthly","title":"월 1회 정기모임","description":"새로운 AI 활용 사례와 프로젝트 진행상황을 나눕니다."},{"id":"learning","title":"AI 교육과 실습","description":"필요한 주제를 함께 정하고 직접 따라 해보는 시간을 엽니다."},{"id":"projects","title":"개인·팀 프로젝트","description":"업무뿐 아니라 취미와 개인 관심사를 자유롭게 탐구합니다."},{"id":"sharing","title":"활용 사례 공유","description":"성공뿐 아니라 시행착오도 다음 시도를 위한 지식으로 남깁니다."}],"longTermTitle":"장기 목표 · 함께 만든 결과물을 Ctrl + AI의 이름으로","longTermDescription":"다양한 직무가 경계를 넘어 협업하고, 배움이 실제 결과물로 이어지는 경험을 만듭니다.","footerCards":[{"id":"participation","title":"누구나 참여","description":"AI 경험이 많지 않아도 괜찮습니다. 배우고 싶은 마음이면 충분합니다."},{"id":"recording","title":"기록하고 공유","description":"좋은 정보와 프로젝트의 맥락을 구성원 모두가 다시 찾을 수 있게 남깁니다."}]}$json$::jsonb)
on conflict (key) do update set value = excluded.value;

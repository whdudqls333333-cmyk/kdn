-- ============================================================
-- KDN 게시판 Supabase Schema
-- Supabase 대시보드 > SQL Editor에서 전체 실행
-- ============================================================

-- 1. profiles (auth.users 미러링)
create table public.profiles (
  id         uuid references auth.users on delete cascade primary key,
  email      text not null,
  created_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "프로필 전체 공개"
  on public.profiles for select using (true);

create policy "본인 프로필 생성"
  on public.profiles for insert with check (auth.uid() = id);

create policy "본인 프로필 수정"
  on public.profiles for update using (auth.uid() = id);

-- 회원가입 시 profiles 자동 생성 트리거
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. posts
create table public.posts (
  id         uuid default gen_random_uuid() primary key,
  title      text not null,
  content    text not null,
  author_id  uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now() not null
);

alter table public.posts enable row level security;

create policy "게시글 전체 공개"
  on public.posts for select using (true);

create policy "로그인 사용자 게시글 작성"
  on public.posts for insert with check (auth.uid() = author_id);

create policy "작성자만 게시글 수정"
  on public.posts for update using (auth.uid() = author_id);

create policy "작성자만 게시글 삭제"
  on public.posts for delete using (auth.uid() = author_id);

-- 3. comments
create table public.comments (
  id         uuid default gen_random_uuid() primary key,
  post_id    uuid references public.posts(id) on delete cascade not null,
  content    text not null,
  author_id  uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now() not null
);

alter table public.comments enable row level security;

create policy "댓글 전체 공개"
  on public.comments for select using (true);

create policy "로그인 사용자 댓글 작성"
  on public.comments for insert with check (auth.uid() = author_id);

create policy "작성자만 댓글 삭제"
  on public.comments for delete using (auth.uid() = author_id);

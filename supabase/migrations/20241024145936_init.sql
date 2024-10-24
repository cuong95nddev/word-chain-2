-- Enable UUID extension
create
extension if not exists "uuid-ossp";

-- Create user profiles table
create table public.user_profiles
(
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    username     text unique not null,
    display_name text,
    total_games  integer default 0,
    total_wins   integer default 0,
    total_score  integer default 0,
    created_at   timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at   timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create games table
create table public.games
(
    id uuid default uuid_generate_v4() primary key,
    created_at   timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at   timestamp with time zone default timezone('utc'::text, now()) not null,
    host_id uuid references auth.users(id) on delete cascade,
    status       text not null default 'waiting' check (status in ('waiting', 'playing', 'finished')),
    settings jsonb not null default '{
        "max_players": 4,
        "time_limit": 30,
        "min_word_length": 2,
        "max_word_length": 10,
        "language": "vi",
        "allow_repeat_words": false,
        "points_per_letter": 10,
        "bonus_points": {
            "long_word": 20,
            "quick_answer": 15,
            "streak": 25
        }
    }'::jsonb,
    players jsonb not null default '[]'::jsonb,
    words jsonb not null default '[]'::jsonb,
    current_player_id uuid,
    winner_id uuid references auth.users(id) on delete set null,
    last_word_at timestamp with time zone,
    round        integer       default 1
);

-- Create game_participants table for easy querying
create table public.game_participants
(
    id uuid default uuid_generate_v4() primary key,
    game_id uuid references public.games(id) on delete cascade,
    user_id uuid references auth.users(id) on delete cascade,
    score        integer default 0,
    words_played integer default 0,
    joined_at    timestamp with time zone default timezone('utc'::text, now()) not null,
    left_at      timestamp with time zone,
    is_winner    boolean default false,
    unique (game_id, user_id)
);

-- Create game_words table for word history
create table public.game_words
(
    id uuid default uuid_generate_v4() primary key,
    game_id uuid references public.games(id) on delete cascade,
    user_id uuid references auth.users(id) on delete cascade,
    word          text not null,
    score         integer,
    played_at     timestamp with time zone default timezone('utc'::text, now()) not null,
    is_valid      boolean default true,
    response_time integer -- thời gian phản hồi tính bằng giây
);

-- Create game_chats table
create table public.game_chats
(
    id uuid default uuid_generate_v4() primary key,
    game_id uuid references public.games(id) on delete cascade,
    user_id uuid references auth.users(id) on delete cascade,
    message    text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create or replace function to update updated_at column
create
or
replace function update_updated_at_column()
returns trigger as $$
begin new.updated_at = now();
return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger update_user_profiles_updated_at
    before update
    on public.user_profiles
    for each row
    execute function update_updated_at_column();

create trigger update_games_updated_at
    before update
    on public.games
    for each row
    execute function update_updated_at_column();

-- Create indexes
create index idx_user_profiles_username on public.user_profiles (username);
create index idx_games_status on public.games (status);
create index idx_game_participants_game_id on public.game_participants (game_id);
create index idx_game_participants_user_id on public.game_participants (user_id);
create index idx_game_words_game_id on public.game_words (game_id);
create index idx_game_chats_game_id on public.game_chats (game_id);

-- Create function to update user stats after game
create
or
replace function update_user_stats()
returns trigger as $$
begin
    -- Update winner stats
    if new.status = 'finished' and new.winner_id is not null then
update public.user_profiles
set total_games = total_games + 1,
    total_wins  = total_wins + 1,
    total_score = total_score + (select score
                                 from public.game_participants
                                 where game_id = new.id
                                   and user_id = new.winner_id)
where user_id = new.winner_id;

-- Update other participants stats
update public.user_profiles
set total_games = total_games + 1,
    total_score = total_score + (select score
                                 from public.game_participants
                                 where game_id = new.id
                                   and user_id = user_profiles.user_id)
where user_id in (select user_id
                  from public.game_participants
                  where game_id = new.id
                    and user_id != new.winner_id);
end if;
return new;
end;
$$ language plpgsql;

-- Create trigger for updating user stats
create trigger update_user_stats_after_game
    after update of status on public.games
    for each row when
    (old.status != 'finished' and new.status = 'finished')
execute function update_user_stats();

-- Enable realtime for games table
alter table public.games replica identity full;
alter
publication supabase_realtime add table public.games;

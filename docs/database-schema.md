# Lifebud Database Schema
Supabase manages login accounts separately in `auth.users`.

Lifebud has:
- 5 main data tables
- 3 collection membership tables

## profiles
Each authenticated Lifebud account has one profile.

- id: uuid, primary key
  - references auth.users.id
  - on delete cascade
- name: text, optional
- bio: text, optional
- image_url: text, optional
- created_at: timestamp with time zone, defaults to now
- updated_at: timestamp with time zone, defaults to now

## life_log_entries
Each row represents one Life Log entry belonging to one user.

- id: uuid, primary key
- user_id: uuid
  - references profiles.id
  - on delete cascade
  - index on user_id for faster user-specific queries
- title: text, optional
- text: text, optional
- image_url: text, optional
- is_featured: boolean, defaults to false
- created_at: timestamp with time zone, defaults to now
- updated_at: timestamp with time zone, defaults to now

## goals
Each row represents one goal belonging to one user.

- id: uuid, primary key
- user_id: uuid
  - references profiles.id
  - on delete cascade
  - index on user_id for faster user-specific queries
- text: text, required
- category: text, must be: small, big, or milestone
- is_featured: boolean, defaults to false
- created_at: timestamp with time zone, defaults to now
- updated_at: timestamp with time zone, defaults to now

## accomplishments
Each row represents one completed goal belonging to one user.

- id: uuid, primary key
- user_id: uuid
  - references profiles.id
  - on delete cascade
  - index on user_id for faster user-specific queries
- text: text, required
- category: text, must be: small, big, or milestone
- is_featured: boolean, defaults to false
- created_at: timestamp with time zone
  - represents when the original goal was created
- completed_at: timestamp with time zone, defaults to now
- updated_at: timestamp with time zone, defaults to now

## collections
Each row represents one custom collection belonging to one user.

- id: uuid, primary key
- user_id: uuid
  - references profiles.id
  - on delete cascade
  - index on user_id for faster user-specific queries
- name: text, required
- created_at: timestamp with time zone, defaults to now
- updated_at: timestamp with time zone, defaults to now

## life_log_collection_memberships
Connects Life Log entries to collections.

- life_log_entry_id: uuid
  - references life_log_entries.id
  - on delete cascade
- collection_id: uuid
  - references collections.id
  - on delete cascade
- primary key:
  - life_log_entry_id + collection_id

The combined primary key prevents the same entry from being added to the same collection twice.

## goal_collection_memberships
Connects goals to collections.

- goal_id: uuid
  - references goals.id
  - on delete cascade
- collection_id: uuid
  - references collections.id
  - on delete cascade
- primary key:
  - goal_id + collection_id

The combined primary key prevents the same goal from being added to the same collection twice.

## accomplishment_collection_memberships
Connects accomplishments to collections.

- accomplishment_id: uuid
  - references accomplishments.id
  - on delete cascade
- collection_id: uuid
  - references collections.id
  - on delete cascade
- primary key:
  - accomplishment_id + collection_id

The combined primary key prevents the same accomplishment from being added to the same collection twice.
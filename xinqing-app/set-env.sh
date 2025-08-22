#!/bin/bash

echo "🔧 设置 Vercel 环境变量..."

# 设置环境变量的值
SUPABASE_URL="https://qiqxttoczkaoanwfwbxn.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpcXh0dG9jemthb2Fud2Z3YnhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NDUyNDgsImV4cCI6MjA3MTQyMTI0OH0.AedP8DVCr3j_-LB9B71Yj5sy6BaWPYc7jdzAonygIn4"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpcXh0dG9jemthb2Fud2Z3YnhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NDUyNDgsImV4cCI6MjA3MTQyMTI0OH0.AedP8DVCr3j_-LB9B71Yj5sy6BaWPYc7jdzAonygIn4"

echo "设置 REACT_APP_SUPABASE_URL..."
echo "$SUPABASE_URL" | vercel env add REACT_APP_SUPABASE_URL production

echo "设置 REACT_APP_SUPABASE_ANON_KEY..."
echo "$SUPABASE_ANON_KEY" | vercel env add REACT_APP_SUPABASE_ANON_KEY production

echo "设置 REACT_APP_SUPABASE_SERVICE_ROLE_KEY..."
echo "$SUPABASE_SERVICE_ROLE_KEY" | vercel env add REACT_APP_SUPABASE_SERVICE_ROLE_KEY production

echo "✅ 环境变量设置完成！"
echo "现在运行: vercel --prod"
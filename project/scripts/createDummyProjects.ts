import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// 正しいパスで.envファイルを読み込む
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase credentials are not properly configured');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const dummyProjects = [
  {
    title: 'AIチャットボット開発プロジェクト',
    school: '東京大学',
    image_url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995',
    location: '東京都',
    description: '自然言語処理を活用したチャットボットの開発プロジェクトです。ユーザーの質問に適切に回答できるAIシステムを構築します。',
    team_size: '3-4名',
    duration: '3ヶ月',
    budget: '〜30万円/月',
    status: 'active'
  },
  {
    title: 'モバイルアプリ開発プロジェクト',
    school: '早稲田大学',
    image_url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c',
    location: '東京都',
    description: 'フィットネスアプリの開発プロジェクトです。ユーザーの運動記録を管理し、パーソナライズされたトレーニングプランを提供します。',
    team_size: '5-6名',
    duration: '4ヶ月',
    budget: '〜50万円/月',
    status: 'active'
  },
  {
    title: 'Web3.0ブロックチェーン開発',
    school: '慶應義塾大学',
    image_url: 'https://images.unsplash.com/photo-1620321023374-d1a68fbc720d',
    location: '東京都',
    description: 'ブロックチェーン技術を活用した分散型アプリケーションの開発プロジェクトです。NFTマーケットプレイスの構築を目指します。',
    team_size: '7-10名',
    duration: '6ヶ月',
    budget: '〜100万円/月',
    status: 'active'
  },
  {
    title: 'IoTセンサーネットワーク構築',
    school: '東京工業大学',
    image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475',
    location: '東京都',
    description: '環境モニタリングのためのIoTセンサーネットワークを構築するプロジェクトです。データ収集と分析システムを開発します。',
    team_size: '3-4名',
    duration: '3ヶ月',
    budget: '〜40万円/月',
    status: 'active'
  },
  {
    title: 'AR/VR教育アプリ開発',
    school: '筑波大学',
    image_url: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac',
    location: '茨城県',
    description: 'AR/VR技術を活用した教育アプリケーションの開発プロジェクトです。インタラクティブな学習体験を提供します。',
    team_size: '5-6名',
    duration: '4ヶ月',
    budget: '〜60万円/月',
    status: 'active'
  },
];

async function createDummyProjects() {
  try {
    // テストユーザーとしてログイン
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'sirime2351develop@gmail.com',
      password: 'rio0501',
    });

    if (authError) {
      throw new Error(`認証エラー: ${authError.message}`);
    }

    if (!authData.user) {
      throw new Error('ユーザーが見つかりません');
    }

    // プロジェクトを挿入
    for (const project of dummyProjects) {
      const { data, error } = await supabase
        .from('projects')
        .insert([
          {
            owner_id: authData.user.id,
            ...project,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating project:', error);
      } else {
        console.log('Created project:', data.title);
      }
    }

    console.log('All dummy projects created successfully');
  } catch (error) {
    console.error('Error:', error);
  }
}

createDummyProjects(); 
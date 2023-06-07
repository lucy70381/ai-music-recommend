import { revalidatePath, revalidateTag } from 'next/cache';
import { Configuration, OpenAIApi } from 'openai';
import { cookies } from 'next/headers';
import { isRedirectError } from 'next/dist/client/components/redirect';
import { redirect } from 'next/navigation';

const {
  OPENAI_API_KEY,
  OPENAI_CONTENT,
  OPENAI_MAX_TOKENS,
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
} = process.env;

const configuration = new Configuration({
  apiKey: OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function getRecommendSong(formData: FormData) {
  const response = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: OPENAI_CONTENT ?? '',
      },
      {
        role: 'user',
        content: '派對',
      },
      {
        role: 'assistant',
        content: 'Miley Cyrus - Party in the USA',
      },
      {
        role: 'user',
        content: '派對',
      },
      {
        role: 'assistant',
        content: 'Jolin Tsai - 舞力全開',
      },
      {
        role: 'user',
        content: '派對',
      },
      {
        role: 'assistant',
        content: 'P!nk-Get This Party Started',
      },
      {
        role: 'user',
        content: '派對',
      },
      {
        role: 'assistant',
        content: 'Bruno Mars - 24K Magic',
      },
      {
        role: 'user',
        content: '國歌',
      },
      {
        role: 'assistant',
        content: 'Glocal Orchestra - Taiwan',
      },
      {
        role: 'user',
        content: '跳舞',
      },
      {
        role: 'assistant',
        content: 'Calvin Harris, Dua Lipa - One Kiss',
      },
      {
        role: 'user',
        content: formData.get('description') as string,
      },
    ],
    temperature: 2,
    n: 1,
    max_tokens: Number(OPENAI_MAX_TOKENS),
  });

  return response.data.choices[0].message?.content ?? '';
}

async function getSpotifyToken() {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `grant_type=client_credentials&client_id=${SPOTIFY_CLIENT_ID}&client_secret=${SPOTIFY_CLIENT_SECRET}`,
  });
  const { access_token } = await response.json();

  cookies().set({
    name: 'token',
    value: access_token,
    path: '/',
    maxAge: 120,
    secure: true,
    sameSite: 'strict',
  });
}

async function getSpotifySongId(songName: string) {
  if (!cookies().get('token')?.value) {
    await getSpotifyToken();
  }
  const token = cookies().get('token')?.value;
  const response = await fetch(
    'https://api.spotify.com/v1/search?q=' + songName + '&type=track&market=TW',
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const { tracks } = await response.json();
  return tracks.items[0].id;
}

export default function Form() {
  async function chatAI(formData: FormData) {
    'use server';
    try {
      const song = await getRecommendSong(formData);
      console.log(song);

      const id = await getSpotifySongId(song);
      redirect('song/' + id);
    } catch (error) {
      if (isRedirectError(error)) throw error;
      console.error(error);
    }
  }

  return (
    <div className='my-auto'>
      <h1 className='mb-4 text-center text-4xl font-bold text-green-500'>
        AI 音樂推薦
      </h1>
      <form action={chatAI} className='mb-4 flex min-w-[354px] flex-col'>
        <input
          type='text'
          id='description'
          name='description'
          className='mb-2'
          placeholder='請輸入描述，例如：舞曲 英文 女歌手'
        />
        <button type='submit' className='bg-slate-400 p-2 hover:opacity-80'>
          送出
        </button>
      </form>
    </div>
  );
}
